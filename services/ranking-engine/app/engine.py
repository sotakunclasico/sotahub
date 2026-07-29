from __future__ import annotations

from datetime import datetime, timezone
import json
import os
from pathlib import Path
import shutil
import subprocess
import tarfile
import tempfile
import threading
from typing import Literal
from uuid import uuid4

from .settings import Settings
from .storage import CHECKPOINTS_KEY, RANKING_KEY, STATE_KEY, RankingStorage


ScanMode = Literal["incremental", "full"]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def default_state() -> dict:
    return {
        "lastAttemptAt": None,
        "lastSuccessfulRunAt": None,
        "lastIncrementalSuccessfulRunAt": None,
        "lastFullSuccessfulRunAt": None,
        "runMode": None,
        "status": "idle",
        "entries": 0,
        "error": None,
    }


class RankingEngine:
    def __init__(self, settings: Settings, storage: RankingStorage) -> None:
        self.settings = settings
        self.storage = storage
        self._lock = threading.Lock()
        self._thread: threading.Thread | None = None

    def state(self) -> dict:
        return self.storage.get_json(STATE_KEY) or default_state()

    def start(self, mode: ScanMode) -> tuple[dict, bool]:
        if not self._lock.acquire(blocking=False):
            return self.state(), False

        current = self.state()
        running = {
            **default_state(),
            **current,
            "lastAttemptAt": utc_now(),
            "runMode": mode,
            "status": "running",
            "error": None,
            "jobId": str(uuid4()),
        }
        try:
            self.storage.put_json(STATE_KEY, running)
        except Exception:
            self._lock.release()
            raise

        self._thread = threading.Thread(
            target=self._run,
            args=(mode, running),
            daemon=True,
            name=f"ranking-{mode}",
        )
        self._thread.start()
        return running, True

    def _run(self, mode: ScanMode, running: dict) -> None:
        workspace = Path(tempfile.mkdtemp(prefix="sotahub-ranking-"))
        archive = workspace / "checkpoints.tar.gz"
        try:
            if self.storage.download(CHECKPOINTS_KEY, archive):
                with tarfile.open(archive, "r:gz") as bundle:
                    bundle.extractall(workspace, filter="data")

            environment = {
                **os.environ,
                "YOUTUBE_API_KEY": self.settings.youtube_api_key,
                "YOUTUBE_CHANNEL_ID": self.settings.youtube_channel_id,
                "COMMUNITY_RANKING_OUTPUT_DIRECTORY": str(workspace),
                "COMMUNITY_RANKING_MAX_WORKERS": str(self.settings.max_workers),
                "COMMUNITY_RANKING_INCREMENTAL_VIDEO_LIMIT": str(
                    self.settings.incremental_video_limit
                ),
                "PYTHONUTF8": "1",
                "PYTHONIOENCODING": "utf-8",
            }
            scanner = Path("/app/scanner/community_ranking.py")
            completed = subprocess.run(
                ["python", str(scanner), "--mode", mode],
                cwd=workspace,
                env=environment,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                check=False,
            )

            self._upload_checkpoints(workspace, archive)

            if completed.returncode != 0:
                tail = (completed.stderr or completed.stdout)[-3000:].strip()
                raise RuntimeError(tail or f"El escáner terminó con código {completed.returncode}.")

            ranking_path = workspace / "community_ranking.json"
            ranking = json.loads(ranking_path.read_text(encoding="utf-8"))
            completed_at = utc_now()
            success = {
                **running,
                "lastSuccessfulRunAt": completed_at,
                "lastIncrementalSuccessfulRunAt": (
                    completed_at
                    if mode == "incremental"
                    else running.get("lastIncrementalSuccessfulRunAt")
                ),
                "lastFullSuccessfulRunAt": (
                    completed_at
                    if mode == "full"
                    else running.get("lastFullSuccessfulRunAt")
                ),
                "status": "success",
                "entries": len(ranking),
                "error": None,
            }
            self.storage.put_json(RANKING_KEY, ranking)
            self.storage.put_json(STATE_KEY, success)
        except Exception as error:
            try:
                failed = {
                    **running,
                    "status": "failed",
                    "error": str(error)[:4000],
                }
                self.storage.put_json(STATE_KEY, failed)
            except Exception:
                pass
        finally:
            shutil.rmtree(workspace, ignore_errors=True)
            self._lock.release()

    def _upload_checkpoints(self, workspace: Path, archive: Path) -> None:
        checkpoint_directory = workspace / ".community-ranking-checkpoints"
        activity_log = workspace / "community_activity_log.csv"
        with tarfile.open(archive, "w:gz") as bundle:
            if checkpoint_directory.exists():
                bundle.add(
                    checkpoint_directory,
                    arcname=".community-ranking-checkpoints",
                )
            if activity_log.exists():
                bundle.add(activity_log, arcname="community_activity_log.csv")
        self.storage.upload(CHECKPOINTS_KEY, archive, "application/gzip")
