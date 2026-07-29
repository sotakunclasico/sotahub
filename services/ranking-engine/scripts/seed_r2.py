from __future__ import annotations

import json
import os
from pathlib import Path
import tarfile
import tempfile

import boto3


PROJECT_ROOT = Path(__file__).resolve().parents[3]
DATA_DIRECTORY = PROJECT_ROOT / "data"
BUCKET = os.getenv("R2_BUCKET_NAME", "sotahub-ranking")


def required(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Falta la variable {name}.")
    return value


def upload_json(client, source: Path, key: str) -> None:
    json.loads(source.read_text(encoding="utf-8"))
    client.upload_file(
        str(source),
        BUCKET,
        key,
        ExtraArgs={
            "ContentType": "application/json; charset=utf-8",
            "CacheControl": "no-store",
        },
    )
    print(f"Subido {key}")


def main() -> None:
    account_id = required("CLOUDFLARE_ACCOUNT_ID")
    client = boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=required("R2_ACCESS_KEY_ID"),
        aws_secret_access_key=required("R2_SECRET_ACCESS_KEY"),
        region_name="auto",
    )

    ranking = DATA_DIRECTORY / "community_ranking.json"
    state = DATA_DIRECTORY / "community-ranking-state.json"
    checkpoints = DATA_DIRECTORY / ".community-ranking-checkpoints"
    activity = DATA_DIRECTORY / "community_activity_log.csv"

    upload_json(client, ranking, "snapshots/community_ranking.json")
    upload_json(client, state, "snapshots/community-ranking-state.json")

    with tempfile.TemporaryDirectory(prefix="sotahub-r2-seed-") as temporary:
        archive = Path(temporary) / "community-ranking-checkpoints.tar.gz"
        with tarfile.open(archive, "w:gz") as bundle:
            if checkpoints.exists():
                bundle.add(checkpoints, arcname=".community-ranking-checkpoints")
            if activity.exists():
                bundle.add(activity, arcname="community_activity_log.csv")
        client.upload_file(
            str(archive),
            BUCKET,
            "engine/community-ranking-checkpoints.tar.gz",
            ExtraArgs={
                "ContentType": "application/gzip",
                "CacheControl": "no-store",
            },
        )
        print(
            "Subidos los checkpoints actuales "
            f"({len(list(checkpoints.glob('*.json')))} vídeos)."
        )


if __name__ == "__main__":
    main()
