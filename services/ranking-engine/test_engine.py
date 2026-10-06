"""Publication checks with simulated storage and scanner; no credentials or network."""
import importlib
import json
from pathlib import Path
import sys
import tempfile
import types
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).parent))
storage_stub = types.ModuleType("app.storage")
for name in ("COMMENT_EVIDENCE_KEY", "CHECKPOINTS_KEY", "RANKING_KEY", "STATE_KEY", "SCAN_REPORT_KEY"):
    setattr(storage_stub, name, name)
storage_stub.RankingStorage = object
with patch.dict(sys.modules, {"app.storage": storage_stub}):
    engine_module = importlib.import_module("app.engine")


class PublicationTests(unittest.TestCase):
    def run_engine(self, exit_code=0, backup_fails=False):
        storage = Mock()
        storage.download.return_value = False
        old_ranking = [{"username": "old-user", "points": 5}]
        storage.get_json.return_value = old_ranking
        if backup_fails:
            def put(key, value):
                if key.startswith("backups/"):
                    raise RuntimeError("Backup unavailable")
            storage.put_json.side_effect = put
        settings = types.SimpleNamespace(youtube_api_key="test", youtube_channel_id="test",
                                         max_workers=1, incremental_video_limit=10)
        engine = engine_module.RankingEngine(settings, storage)
        engine._lock.acquire()
        new_ranking = [{"username": "new-user", "points": 10}]

        def scan(*args, **kwargs):
            workspace = Path(kwargs["cwd"])
            for filename, value in (("community_ranking.json", new_ranking),
                                    ("community_comment_evidence.json", []),
                                    ("community_scan_report.json", {"videos": 20, "errors": int(exit_code != 0),
                                                                    "replays_unavailable": ["video-1"]})):
                (workspace / filename).write_text(json.dumps(value), encoding="utf-8")
            return types.SimpleNamespace(returncode=exit_code, stdout="scan error" if exit_code else "ok", stderr="")

        with patch.object(engine, "_upload_checkpoints"), patch.object(engine_module.subprocess, "run", side_effect=scan):
            engine._run("full", {"jobId": "test-job", "runMode": "full"})
        self.assertFalse(engine._lock.locked())
        return storage, old_ranking, new_ranking

    def test_success_backs_up_before_publishing_and_records_coverage(self):
        storage, old, new = self.run_engine()
        calls = storage.put_json.call_args_list
        keys = [call.args[0] for call in calls]
        self.assertLess(keys.index("backups/ranking/test-job.json"), keys.index("RANKING_KEY"))
        self.assertEqual(calls[keys.index("backups/ranking/test-job.json")].args[1], old)
        self.assertEqual(calls[keys.index("RANKING_KEY")].args[1], new)
        state = calls[-1].args[1]
        self.assertEqual(state["status"], "success")
        self.assertEqual(state["videosScanned"], 20)
        self.assertEqual(state["replaysUnavailable"], 1)

    def test_failed_scan_preserves_public_ranking(self):
        storage, _, _ = self.run_engine(exit_code=1)
        keys = [call.args[0] for call in storage.put_json.call_args_list]
        self.assertIn("SCAN_REPORT_KEY", keys)
        self.assertNotIn("RANKING_KEY", keys)
        self.assertEqual(storage.put_json.call_args_list[-1].args[1]["status"], "failed")

    def test_failed_backup_prevents_publication(self):
        storage, _, _ = self.run_engine(backup_fails=True)
        keys = [call.args[0] for call in storage.put_json.call_args_list]
        self.assertNotIn("RANKING_KEY", keys)
        self.assertEqual(storage.put_json.call_args_list[-1].args[1]["status"], "failed")


if __name__ == "__main__":
    unittest.main()
