import csv
import json
import os
import shutil
import sys
import time
import re
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import requests
from yt_dlp import YoutubeDL


CHANNEL_ID = os.getenv("YOUTUBE_CHANNEL_ID", "UCJ-vmk0-j_GC8bB_RK2vA9A")
MAX_WORKERS = max(1, int(os.getenv("COMMUNITY_RANKING_MAX_WORKERS", "1")))
OUTPUT_DIRECTORY = Path.cwd()
CACHE_DIRECTORY = OUTPUT_DIRECTORY / ".community-ranking-cache"
CHECKPOINT_DIRECTORY = OUTPUT_DIRECTORY / ".community-ranking-checkpoints"
COOKIE_FILE = os.getenv("YOUTUBE_COOKIES_FILE")
LEGACY_CONFIG_PATH = Path(os.getenv("COMMUNITY_LEGACY_CONFIG_PATH", r"C:\SotakunJson\V_Codex\Community\config.py"))
YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"


def get_api_key():
    api_key = os.getenv("YOUTUBE_API_KEY")
    if api_key:
        return api_key
    if LEGACY_CONFIG_PATH.exists():
        config_text = LEGACY_CONFIG_PATH.read_text(encoding="utf-8")
        match = re.search(r'^API_KEY\s*=\s*["\']([^"\']+)["\']', config_text, re.MULTILINE)
        if match:
            return match.group(1)
    raise RuntimeError("Configura YOUTUBE_API_KEY para ejecutar Community Ranking.")


def normalize_username(username):
    return (username or "").lower().replace("@", "").strip()


def quiet_options():
    options = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "socket_timeout": 30,
        "retries": 3,
        "fragment_retries": 3,
    }
    if COOKIE_FILE:
        options["cookiefile"] = COOKIE_FILE
    return options


def get_channel_videos():
    explicit_ids = [item.strip() for item in os.getenv("COMMUNITY_RANKING_VIDEO_IDS", "").split(",") if item.strip()]
    if explicit_ids:
        return [{"video_id": video_id, "title": video_id, "has_replay": True} for video_id in explicit_ids]

    api_key = get_api_key()
    upload_playlist = f"UU{CHANNEL_ID[2:]}"
    video_ids = []
    page_token = None
    while True:
        response = requests.get(f"{YOUTUBE_API_BASE}/playlistItems", params={"key": api_key, "playlistId": upload_playlist, "part": "contentDetails", "maxResults": 50, "pageToken": page_token}, timeout=30)
        response.raise_for_status()
        payload = response.json()
        video_ids.extend(item["contentDetails"]["videoId"] for item in payload.get("items", []))
        page_token = payload.get("nextPageToken")
        if not page_token:
            break

    videos = []
    for offset in range(0, len(video_ids), 50):
        batch = video_ids[offset:offset + 50]
        response = requests.get(f"{YOUTUBE_API_BASE}/videos", params={"key": api_key, "id": ",".join(batch), "part": "snippet,liveStreamingDetails"}, timeout=30)
        response.raise_for_status()
        by_id = {item["id"]: item for item in response.json().get("items", [])}
        for video_id in batch:
            item = by_id.get(video_id)
            if item:
                videos.append({"video_id": video_id, "title": item["snippet"]["title"], "has_replay": "liveStreamingDetails" in item})

    ordered = videos
    limit = int(os.getenv("COMMUNITY_RANKING_VIDEO_LIMIT", "0"))
    return ordered[:limit] if limit > 0 else ordered


def renderer_from_action(action):
    for nested in action.get("replayChatItemAction", {}).get("actions", []):
        item = nested.get("addChatItemAction", {}).get("item", {})
        renderer = item.get("liveChatTextMessageRenderer") or item.get("liveChatPaidMessageRenderer")
        if renderer:
            yield renderer


def parse_live_chat(chat_path):
    messages = []
    seen = set()
    if not chat_path.exists():
        return messages

    with chat_path.open("r", encoding="utf-8") as stream:
        for line in stream:
            try:
                action = json.loads(line)
            except json.JSONDecodeError:
                continue
            for renderer in renderer_from_action(action):
                message_id = renderer.get("id")
                author = renderer.get("authorName", {}).get("simpleText", "")
                text = "".join(run.get("text", "") for run in renderer.get("message", {}).get("runs", []))
                key = message_id or (author, text, renderer.get("timestampUsec"))
                if not author or key in seen:
                    continue
                seen.add(key)
                messages.append((normalize_username(author), text))
    return messages


def process_video(video):
    video_id = video["video_id"]
    checkpoint_path = CHECKPOINT_DIRECTORY / f"{video_id}.json"
    if checkpoint_path.exists():
        try:
            with checkpoint_path.open("r", encoding="utf-8") as stream:
                return json.load(stream)
        except (json.JSONDecodeError, OSError):
            checkpoint_path.unlink(missing_ok=True)
    output_template = str(CACHE_DIRECTORY / f"{video_id}.%(ext)s")
    options = {**quiet_options(), "writesubtitles": True, "subtitleslangs": ["live_chat"], "outtmpl": output_template}
    chat_path = CACHE_DIRECTORY / f"{video_id}.live_chat.json"
    try:
        comments = get_video_comments(video_id)
        messages = []
        if video.get("has_replay"):
            with YoutubeDL(options) as ydl:
                ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=True)
            messages = parse_live_chat(chat_path)
            time.sleep(float(os.getenv("COMMUNITY_RANKING_REPLAY_DELAY", "1")))
        result = {"video_id": video_id, "comments": comments, "messages": messages, "error": None}
        temporary_path = checkpoint_path.with_suffix(".tmp")
        with temporary_path.open("w", encoding="utf-8") as stream:
            json.dump(result, stream, ensure_ascii=False)
        temporary_path.replace(checkpoint_path)
        return result
    except Exception as error:
        return {"video_id": video_id, "comments": [], "messages": [], "error": str(error)}
    finally:
        chat_path.unlink(missing_ok=True)


def get_video_comments(video_id):
    comments = []
    page_token = None
    api_key = get_api_key()
    while True:
        response = requests.get(f"{YOUTUBE_API_BASE}/commentThreads", params={"key": api_key, "videoId": video_id, "part": "snippet", "maxResults": 100, "pageToken": page_token, "textFormat": "plainText"}, timeout=30)
        if response.status_code == 403 and response.json().get("error", {}).get("errors", [{}])[0].get("reason") in {"commentsDisabled", "forbidden"}:
            return comments
        response.raise_for_status()
        payload = response.json()
        for item in payload.get("items", []):
            snippet = item["snippet"]["topLevelComment"]["snippet"]
            comments.append((normalize_username(snippet.get("authorDisplayName")), snippet.get("textDisplay") or ""))
        page_token = payload.get("nextPageToken")
        if not page_token:
            return comments


def build_outputs(results):
    points = defaultdict(float)
    comments_count = defaultdict(int)
    live_messages_count = defaultdict(int)
    unique_videos = defaultdict(set)
    unique_lives = defaultdict(set)
    activity = []

    for result in results:
        video_id = result["video_id"]
        for username, content in result["comments"]:
            points[username] += 2
            comments_count[username] += 1
            activity.append({"username": username, "type": "comment", "video_id": video_id, "points": 2, "content": content})
            if video_id not in unique_videos[username]:
                points[username] += 3
                unique_videos[username].add(video_id)
                activity.append({"username": username, "type": "unique_video_comment", "video_id": video_id, "points": 3, "content": ""})

        users_in_live = set()
        for username, content in result["messages"]:
            points[username] += 0.1
            live_messages_count[username] += 1
            activity.append({"username": username, "type": "live_message", "video_id": video_id, "points": 0.1, "content": content})
            if username not in users_in_live:
                users_in_live.add(username)
                points[username] += 1
                unique_lives[username].add(video_id)
                activity.append({"username": username, "type": "unique_live", "video_id": video_id, "points": 1, "content": ""})

    ranking = [
        {
            "username": username,
            "points": round(score, 2),
            "comments": comments_count[username],
            "live_messages": live_messages_count[username],
            "unique_videos": len(unique_videos[username]),
            "unique_lives": len(unique_lives[username]),
        }
        for username, score in sorted(points.items(), key=lambda item: item[1], reverse=True)
    ]
    return ranking, activity


def export(ranking, activity, partial=False):
    suffix = ".partial" if partial else ""
    with (OUTPUT_DIRECTORY / f"community_ranking{suffix}.json").open("w", encoding="utf-8") as stream:
        json.dump(ranking, stream, ensure_ascii=False, indent=2)
    with (OUTPUT_DIRECTORY / f"community_ranking{suffix}.csv").open("w", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=["username", "points", "comments", "live_messages", "unique_videos", "unique_lives"])
        writer.writeheader()
        writer.writerows(ranking)
    with (OUTPUT_DIRECTORY / f"community_activity_log{suffix}.csv").open("w", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=["username", "type", "video_id", "points", "content"])
        writer.writeheader()
        writer.writerows(activity)


def main():
    started = time.perf_counter()
    CACHE_DIRECTORY.mkdir(parents=True, exist_ok=True)
    CHECKPOINT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    videos = get_channel_videos()
    print(f"Vídeos únicos encontrados: {len(videos)}", flush=True)
    results = []
    errors = 0
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_video, video): video for video in videos}
        for index, future in enumerate(as_completed(futures), start=1):
            result = future.result()
            results.append(result)
            errors += int(result["error"] is not None)
            print(f"[{index}/{len(videos)}] {result['video_id']}: {len(result['comments'])} comentarios, {len(result['messages'])} mensajes" + (f" · ERROR: {result['error']}" if result["error"] else ""), flush=True)

    ranking, activity = build_outputs(results)
    export(ranking, activity, partial=errors > 0)
    shutil.rmtree(CACHE_DIRECTORY, ignore_errors=True)
    if errors == 0:
        shutil.rmtree(CHECKPOINT_DIRECTORY, ignore_errors=True)
    elapsed = time.perf_counter() - started
    print(f"Finalizado: {len(videos)} vídeos, {sum(len(item['comments']) for item in results)} comentarios, {sum(len(item['messages']) for item in results)} mensajes, {errors} errores, {elapsed / 60:.2f} minutos", flush=True)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
