from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import boto3
from botocore.exceptions import ClientError

from .settings import Settings


STATE_KEY = "snapshots/community-ranking-state.json"
RANKING_KEY = "snapshots/community_ranking.json"
CHECKPOINTS_KEY = "engine/community-ranking-checkpoints.tar.gz"


class RankingStorage:
    def __init__(self, settings: Settings) -> None:
        self.bucket = settings.r2_bucket
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.r2_endpoint,
            aws_access_key_id=settings.r2_access_key_id,
            aws_secret_access_key=settings.r2_secret_access_key,
            region_name="auto",
        )

    def get_json(self, key: str) -> Any | None:
        try:
            response = self.client.get_object(Bucket=self.bucket, Key=key)
        except ClientError as error:
            code = error.response.get("Error", {}).get("Code")
            if code in {"NoSuchKey", "404"}:
                return None
            raise
        return json.loads(response["Body"].read().decode("utf-8"))

    def put_json(self, key: str, value: Any) -> None:
        body = json.dumps(value, ensure_ascii=False, indent=2).encode("utf-8")
        self.client.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=body,
            ContentType="application/json; charset=utf-8",
            CacheControl="no-store",
        )

    def download(self, key: str, destination: Path) -> bool:
        destination.parent.mkdir(parents=True, exist_ok=True)
        try:
            self.client.download_file(self.bucket, key, str(destination))
        except ClientError as error:
            code = error.response.get("Error", {}).get("Code")
            if code in {"NoSuchKey", "404"}:
                return False
            raise
        return True

    def upload(self, key: str, source: Path, content_type: str) -> None:
        self.client.upload_file(
            str(source),
            self.bucket,
            key,
            ExtraArgs={
                "ContentType": content_type,
                "CacheControl": "no-store",
            },
        )
