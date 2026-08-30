import csv
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import types
import unittest


sys.modules.setdefault("requests", types.ModuleType("requests"))
yt_dlp_stub = types.ModuleType("yt_dlp")
yt_dlp_stub.YoutubeDL = object
sys.modules.setdefault("yt_dlp", yt_dlp_stub)

MODULE_PATH = Path(__file__).with_name("community_ranking.py")
SPEC = importlib.util.spec_from_file_location("community_ranking", MODULE_PATH)
community_ranking = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(community_ranking)


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
