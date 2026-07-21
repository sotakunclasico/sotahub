"""Synchronize the public SotaKun YouTube channel into a local, deployable snapshot."""

from __future__ import annotations

import json
import os
import re
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import urlopen


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "data" / "youtube-channel.json"
CHANNEL_ID = os.getenv("YOUTUBE_CHANNEL_ID", "UCJ-vmk0-j_GC8bB_RK2vA9A")
LEGACY_CONFIG = Path(
    os.getenv("COMMUNITY_LEGACY_CONFIG_PATH", r"C:\SotakunJson\V_Codex\Community\config.py")
)
API_BASE = "https://www.googleapis.com/youtube/v3"


def api_key() -> str:
    direct = os.getenv("YOUTUBE_API_KEY")
    if direct:
        return direct
    if LEGACY_CONFIG.exists():
        content = LEGACY_CONFIG.read_text(encoding="utf-8")
        match = re.search(r"(?:YOUTUBE_API_KEY|API_KEY)\s*=\s*['\"]([^'\"]+)['\"]", content)
        if match:
            return match.group(1)
    raise RuntimeError("Set YOUTUBE_API_KEY or provide the legacy Community config.py")


def request(resource: str, **params: str | int) -> dict[str, Any]:
    query = urlencode({**params, "key": api_key()})
    with urlopen(f"{API_BASE}/{resource}?{query}", timeout=30) as response:
        return json.load(response)


def pages(resource: str, **params: str | int) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    token = ""
    while True:
        payload = request(resource, **params, **({"pageToken": token} if token else {}))
        items.extend(payload.get("items", []))
        token = payload.get("nextPageToken", "")
        if not token:
            return items


def thumbnail(snippet: dict[str, Any]) -> str:
    thumbnails = snippet.get("thumbnails", {})
    for size in ("maxres", "standard", "high", "medium", "default"):
        if size in thumbnails:
            return thumbnails[size]["url"]
    return ""


def duration_seconds(value: str) -> int:
    match = re.fullmatch(r"P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", value)
    if not match:
        return 0
    days, hours, minutes, seconds = (int(part or 0) for part in match.groups())
    return days * 86400 + hours * 3600 + minutes * 60 + seconds


def as_int(value: Any) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def video(item: dict[str, Any]) -> dict[str, Any]:
    snippet = item["snippet"]
    stats = item.get("statistics", {})
    live_details = item.get("liveStreamingDetails", {})
    seconds = duration_seconds(item.get("contentDetails", {}).get("duration", ""))
    is_live = snippet.get("liveBroadcastContent") == "live" or bool(
        live_details.get("actualStartTime") and not live_details.get("actualEndTime")
    )
    return {
        "id": item["id"],
        "title": snippet["title"],
        "description": snippet.get("description", ""),
        "publishedAt": snippet["publishedAt"],
        "thumbnail": thumbnail(snippet),
        "url": f"https://www.youtube.com/watch?v={item['id']}",
        "durationSeconds": seconds,
        "viewCount": as_int(stats.get("viewCount")),
        "likeCount": as_int(stats.get("likeCount")),
        "commentCount": as_int(stats.get("commentCount")),
        "isLive": is_live,
        "isUpcoming": snippet.get("liveBroadcastContent") == "upcoming",
        "isShort": 0 < seconds <= 180 and not live_details,
        "wasLive": bool(live_details.get("actualStartTime")),
        "concurrentViewers": as_int(live_details.get("concurrentViewers")),
    }


def chunks(values: list[str], size: int = 50) -> list[list[str]]:
    return [values[index : index + size] for index in range(0, len(values), size)]


def synchronize() -> dict[str, Any]:
    channel_item = request(
        "channels",
        part="snippet,statistics,contentDetails,brandingSettings",
        id=CHANNEL_ID,
    )["items"][0]
    channel_snippet = channel_item["snippet"]
    channel_stats = channel_item["statistics"]
    uploads_id = channel_item["contentDetails"]["relatedPlaylists"]["uploads"]

    upload_items = pages(
        "playlistItems", part="contentDetails", playlistId=uploads_id, maxResults=50
    )
    video_ids = [entry["contentDetails"]["videoId"] for entry in upload_items]
    videos_raw: list[dict[str, Any]] = []
    for batch in chunks(video_ids):
        videos_raw.extend(
            request(
                "videos",
                part="snippet,contentDetails,statistics,liveStreamingDetails",
                id=",".join(batch),
                maxResults=50,
            ).get("items", [])
        )
    by_id = {entry["id"]: video(entry) for entry in videos_raw}
    ordered = [by_id[entry] for entry in video_ids if entry in by_id]
    public_videos = [entry for entry in ordered if not entry["isUpcoming"]]
    live = next((entry for entry in public_videos if entry["isLive"]), None)
    latest_live = next((entry for entry in public_videos if entry["wasLive"] and not entry["isLive"]), None)

    playlist_items = pages(
        "playlists", part="snippet,contentDetails,status", channelId=CHANNEL_ID, maxResults=50
    )
    playlists = []
    for item in playlist_items:
        if item.get("status", {}).get("privacyStatus") != "public":
            continue
        snippet = item["snippet"]
        playlists.append(
            {
                "id": item["id"],
                "title": snippet["title"],
                "description": snippet.get("description", ""),
                "publishedAt": snippet["publishedAt"],
                "thumbnail": thumbnail(snippet),
                "itemCount": as_int(item.get("contentDetails", {}).get("itemCount")),
                "url": f"https://www.youtube.com/playlist?list={item['id']}",
            }
        )

    return {
        "syncedAt": datetime.now(timezone.utc).isoformat(),
        "channel": {
            "id": CHANNEL_ID,
            "title": channel_snippet["title"],
            "description": channel_snippet.get("description", ""),
            "customUrl": channel_snippet.get("customUrl", ""),
            "thumbnail": thumbnail(channel_snippet),
            "subscriberCount": as_int(channel_stats.get("subscriberCount")),
            "videoCount": as_int(channel_stats.get("videoCount")),
            "viewCount": as_int(channel_stats.get("viewCount")),
            "url": f"https://www.youtube.com/channel/{CHANNEL_ID}",
        },
        "featured": {"latestVideo": public_videos[0] if public_videos else None, "live": live, "latestLive": latest_live},
        "videos": [entry for entry in public_videos if not entry["isShort"]][:12],
        "shorts": [entry for entry in public_videos if entry["isShort"]][:12],
        "playlists": playlists,
    }


def main() -> None:
    payload = synchronize()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=OUTPUT.parent, delete=False) as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        temporary = Path(handle.name)
    temporary.replace(OUTPUT)
    print(f"YouTube snapshot: {payload['channel']['title']} | {len(payload['videos'])} videos | {len(payload['playlists'])} playlists")


if __name__ == "__main__":
    main()
