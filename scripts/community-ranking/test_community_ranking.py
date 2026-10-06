import csv
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import types
import unittest
from unittest.mock import patch


sys.modules.setdefault("requests", types.ModuleType("requests"))
yt_dlp_stub = types.ModuleType("yt_dlp")
yt_dlp_stub.YoutubeDL = object
sys.modules.setdefault("yt_dlp", yt_dlp_stub)

MODULE_PATH = Path(__file__).with_name("community_ranking.py")
SPEC = importlib.util.spec_from_file_location("community_ranking", MODULE_PATH)
community_ranking = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(community_ranking)


class ReplayRecoveryTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.directory = Path(self.temporary.name)
        self.patches = [patch.object(community_ranking, name, self.directory)
                        for name in ("CHECKPOINT_DIRECTORY", "CACHE_DIRECTORY", "OUTPUT_DIRECTORY")]
        for item in self.patches:
            item.start()
        self.video = {"video_id": "video-1", "has_replay": True}

    def tearDown(self):
        for item in reversed(self.patches):
            item.stop()
        self.temporary.cleanup()

    def seed(self, **values):
        checkpoint = {"video_id": "video-1", "comments": [], "messages": [["old-user", "old"]],
                      "replay_complete": True, "error": None, **values}
        community_ranking.save_checkpoint(self.directory / "video-1.json", checkpoint)

    def test_full_refresh_redownloads_verified_replay(self):
        self.seed(replay_verification_version=community_ranking.REPLAY_VERIFICATION_VERSION)
        with patch.object(community_ranking, "get_video_comments", return_value=[]), \
             patch.object(community_ranking, "download_live_chat", return_value=[["new-user", "new"]]) as download:
            result = community_ranking.process_video(self.video, "full", False)
        download.assert_called_once()
        self.assertEqual(result["messages"], [["new-user", "new"]])
        self.assertTrue(result["replay_complete"])

    def test_old_checkpoint_retries_replay_outside_recent_videos(self):
        self.seed()
        with patch.object(community_ranking, "download_live_chat", return_value=[["new-user", "new"]]) as download:
            result = community_ranking.process_video(self.video, "incremental", False)
        download.assert_called_once()
        self.assertEqual(result["source"], "youtube")

    def test_failed_download_preserves_checkpoint_and_reports_failure(self):
        self.seed(replay_complete=False)
        with patch.object(community_ranking, "download_live_chat", side_effect=RuntimeError("missing replay")):
            result = community_ranking.process_video(self.video, "incremental", False)
        self.assertEqual(result["source"], "stale-checkpoint")
        self.assertEqual(result["error"], "missing replay")
        self.assertEqual(result["messages"], [["old-user", "old"]])
        self.assertFalse(community_ranking.load_checkpoint(self.directory / "video-1.json")["replay_complete"])

    def test_unavailable_replay_preserves_old_messages_and_remains_pending(self):
        self.seed()
        with patch.object(community_ranking, "download_live_chat", return_value=None):
            result = community_ranking.process_video(self.video, "incremental", False)
        self.assertFalse(result["replay_complete"])
        self.assertEqual(result["replay_status"], "unavailable")
        self.assertEqual(result["messages"], [["old-user", "old"]])

    def test_missing_and_corrupt_replay_are_errors(self):
        replay = self.directory / "video-1.live_chat.json"
        with self.assertRaises(RuntimeError):
            community_ranking.parse_live_chat(replay)
        replay.write_text("", encoding="utf-8")
        with self.assertRaises(RuntimeError):
            community_ranking.parse_live_chat(replay)
        replay.write_text("not json\n", encoding="utf-8")
        with self.assertRaises(RuntimeError):
            community_ranking.parse_live_chat(replay)

    def test_advertised_replay_without_file_fails(self):
        with patch.object(community_ranking, "YoutubeDL") as ydl:
            ydl.return_value.__enter__.return_value.extract_info.return_value = {"subtitles": {"live_chat": [{}]}}
            with self.assertRaises(RuntimeError):
                community_ranking.download_live_chat("video-1", self.directory / "missing.json")

    def test_absent_replay_is_distinct_from_empty_activity(self):
        with patch.object(community_ranking, "YoutubeDL") as ydl:
            ydl.return_value.__enter__.return_value.extract_info.return_value = {"subtitles": {}}
            self.assertIsNone(community_ranking.download_live_chat("video-1", self.directory / "missing.json"))

    def test_parser_deduplicates_messages_and_preserves_distinct_messages(self):
        def action(message_id, text):
            return {"replayChatItemAction": {"actions": [{"addChatItemAction": {"item": {
                "liveChatTextMessageRenderer": {"id": message_id, "authorName": {"simpleText": "@User"},
                                                "message": {"runs": [{"text": text}]}}
            }}}]}}
        replay = self.directory / "replay.json"
        replay.write_text("\n".join(json.dumps(item) for item in
                                   [action("1", "hello"), action("1", "hello"), action("2", "hello")]), encoding="utf-8")
        self.assertEqual(community_ranking.parse_live_chat(replay),
                         [{"username": "user", "content": "hello", "channel_id": None}] * 2)

    def test_migration_does_not_mark_unknown_chats_complete(self):
        (self.directory / "community_activity_log.csv").write_text(
            "video_id,username,type,content\nvideo-1,user,live_message,hello\n", encoding="utf-8")
        community_ranking.seed_checkpoints_from_activity_log([self.video, {"video_id": "video-2"}])
        for video_id in ("video-1", "video-2"):
            self.assertFalse(community_ranking.load_checkpoint(self.directory / f"{video_id}.json")["replay_complete"])


class IdentityTests(unittest.TestCase):
    def test_channel_id_unifies_changed_handles_and_comment_names(self):
        results = [{"video_id": "video-1", "comments": [{"username": "OldName", "content": "comment", "channel_id": "UC1"}],
                    "messages": [{"username": "OldHandle", "content": "old", "channel_id": "UC1"}]},
                   {"video_id": "video-2", "comments": [],
                    "messages": [{"username": "NewHandle", "content": "new", "channel_id": "UC1"}]}]
        with patch.object(community_ranking, "resolve_channel_usernames", return_value={"UC1": "newhandle"}):
            normalized, identities = community_ranking.canonicalize_identities(results)
        ranking, _, _ = community_ranking.build_outputs(normalized)
        self.assertEqual(len(ranking), 1)
        self.assertEqual(ranking[0]["username"], "newhandle")
        self.assertEqual(ranking[0]["points"], 7.2)
        self.assertEqual(identities[0]["observed_usernames"], ["newhandle", "oldhandle", "oldname"])

    def test_ambiguous_legacy_name_is_not_assigned_to_either_channel(self):
        results = [{"video_id": "video-1", "comments": [], "messages": [
            {"username": "shared", "content": "a", "channel_id": "UC1"},
            {"username": "shared", "content": "b", "channel_id": "UC2"},
            ["shared", "legacy"]]}]
        with patch.object(community_ranking, "resolve_channel_usernames", return_value={"UC1": "one", "UC2": "two"}):
            normalized, _ = community_ranking.canonicalize_identities(results)
        self.assertEqual([item["username"] for item in normalized[0]["messages"]], ["one", "two", "shared"])

    def test_unique_legacy_alias_uses_verified_channel(self):
        results = [{"video_id": "video-1", "comments": [], "messages": [
            {"username": "old", "content": "a", "channel_id": "UC1"}, ["old", "legacy"]]}]
        with patch.object(community_ranking, "resolve_channel_usernames", return_value={"UC1": "new"}):
            normalized, _ = community_ranking.canonicalize_identities(results)
        self.assertEqual([item["username"] for item in normalized[0]["messages"]], ["new", "new"])


class CommentEvidenceTests(unittest.TestCase):
    def test_legacy_checkpoint_comments_remain_compatible(self):
        comment = community_ranking.normalize_comment_record(
            ["@Usuario", "Comentario anterior"],
            "video-1",
        )

        self.assertEqual(comment["username"], "usuario")
        self.assertEqual(comment["content"], "Comentario anterior")
        self.assertIsNone(comment["comment_id"])
        self.assertIsNone(comment["comment_url"])

    def test_only_comments_create_reference_evidence(self):
        results = [{
            "video_id": "video-1",
            "comments": [
                {
                    "username": "usuario",
                    "content": "Primer comentario",
                    "comment_id": "comment-1",
                    "comment_url": None,
                },
                {
                    "username": "usuario",
                    "content": "Segundo comentario",
                    "comment_id": "comment-2",
                    "comment_url": None,
                },
            ],
            "messages": [["usuario", "Mensaje del directo"]],
        }]

        ranking, activity, evidence = community_ranking.build_outputs(results)

        self.assertEqual(ranking[0]["points"], 8.1)
        self.assertEqual(len(evidence), 2)
        self.assertEqual(evidence[0]["points_awarded"], 5)
        self.assertTrue(evidence[0]["includes_unique_video_bonus"])
        self.assertEqual(evidence[1]["points_awarded"], 2)
        self.assertFalse(evidence[1]["includes_unique_video_bonus"])
        self.assertEqual(
            evidence[0]["comment_url"],
            "https://www.youtube.com/watch?v=video-1&lc=comment-1",
        )
        live_rows = [row for row in activity if row["type"] in {"live_message", "unique_live"}]
        self.assertTrue(live_rows)
        self.assertTrue(all(not row["comment_id"] and not row["comment_url"] for row in live_rows))

    def test_export_persists_comment_references_but_not_live_references(self):
        activity = [
            {
                "username": "usuario",
                "type": "comment",
                "video_id": "video-1",
                "points": 2,
                "content": "Comentario",
                "comment_id": "comment-1",
                "comment_url": "https://www.youtube.com/watch?v=video-1&lc=comment-1",
            },
            {
                "username": "usuario",
                "type": "live_message",
                "video_id": "video-1",
                "points": 0.1,
                "content": "Directo",
                "comment_id": "",
                "comment_url": "",
            },
        ]
        evidence = [{
            "username": "usuario",
            "video_id": "video-1",
            "comment_id": "comment-1",
            "comment_url": "https://www.youtube.com/watch?v=video-1&lc=comment-1",
            "points_awarded": 5,
            "includes_unique_video_bonus": True,
        }]
        ranking = [{
            "username": "usuario",
            "points": 5,
            "comments": 1,
            "live_messages": 0,
            "unique_videos": 1,
            "unique_lives": 0,
        }]

        original_output_directory = community_ranking.OUTPUT_DIRECTORY
        with tempfile.TemporaryDirectory() as temporary:
            community_ranking.OUTPUT_DIRECTORY = Path(temporary)
            try:
                community_ranking.export(ranking, activity, evidence)
            finally:
                community_ranking.OUTPUT_DIRECTORY = original_output_directory

            with (Path(temporary) / "community_activity_log.csv").open(encoding="utf-8") as stream:
                rows = list(csv.DictReader(stream))
            saved_evidence = json.loads(
                (Path(temporary) / "community_comment_evidence.json").read_text(encoding="utf-8")
            )

        self.assertEqual(rows[0]["comment_id"], "comment-1")
        self.assertEqual(rows[1]["comment_id"], "")
        self.assertEqual(rows[1]["comment_url"], "")
        self.assertEqual(saved_evidence, evidence)


if __name__ == "__main__":
    unittest.main()
