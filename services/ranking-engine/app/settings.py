from dataclasses import dataclass
import os


def required(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Falta la variable obligatoria {name}.")
    return value


def positive_int(name: str, default: int) -> int:
    try:
        return max(1, int(os.getenv(name, str(default))))
    except ValueError:
        return default


@dataclass(frozen=True)
class Settings:
    engine_secret: str
    youtube_api_key: str
    youtube_channel_id: str
    r2_endpoint: str
    r2_access_key_id: str
    r2_secret_access_key: str
    r2_bucket: str
    max_workers: int
    incremental_video_limit: int

    @classmethod
    def from_environment(cls) -> "Settings":
        account_id = required("CLOUDFLARE_ACCOUNT_ID")
        return cls(
            engine_secret=required("RANKING_ENGINE_SECRET"),
            youtube_api_key=required("YOUTUBE_API_KEY"),
            youtube_channel_id=os.getenv(
                "YOUTUBE_CHANNEL_ID",
                "UCJ-vmk0-j_GC8bB_RK2vA9A",
            ).strip(),
            r2_endpoint=f"https://{account_id}.r2.cloudflarestorage.com",
            r2_access_key_id=required("R2_ACCESS_KEY_ID"),
            r2_secret_access_key=required("R2_SECRET_ACCESS_KEY"),
            r2_bucket=os.getenv("R2_BUCKET_NAME", "sotahub-ranking").strip(),
            max_workers=positive_int("COMMUNITY_RANKING_MAX_WORKERS", 1),
            incremental_video_limit=positive_int(
                "COMMUNITY_RANKING_INCREMENTAL_VIDEO_LIMIT",
                10,
            ),
        )
