import argparse
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
from urllib.parse import urlencode

import requests
from yt_dlp import YoutubeDL


CHANNEL_ID = os.getenv("YOUTUBE_CHANNEL_ID", "UCJ-vmk0-j_GC8bB_RK2vA9A")
MAX_WORKERS = max(1, int(os.getenv("COMMUNITY_RANKING_MAX_WORKERS", "1")))
INCREMENTAL_VIDEO_LIMIT = max(1, int(os.getenv("COMMUNITY_RANKING_INCREMENTAL_VIDEO_LIMIT", "10")))
OUTPUT_DIRECTORY = Path(os.getenv("COMMUNITY_RANKING_OUTPUT_DIRECTORY", Path.cwd())).resolve()
CACHE_DIRECTORY = OUTPUT_DIRECTORY / ".community-ranking-cache"
CHECKPOINT_DIRECTORY = OUTPUT_DIRECTORY / ".community-ranking-checkpoints"
COOKIE_FILE = os.getenv("YOUTUBE_COOKIES_FILE")
LEGACY_CONFIG_PATH = Path(os.getenv("COMMUNITY_LEGACY_CONFIG_PATH", r"C:\SotakunJson\V_Codex\Community\config.py"))
YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"
REPLAY_VERIFICATION_VERSION = 3


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


def safe_error(error):
    message = str(error)
    api_key = os.getenv("YOUTUBE_API_KEY")
    return message.replace(api_key, "[redacted]") if api_key else message


def build_comment_url(video_id, comment_id):
    if not video_id or not comment_id:
        return None
    return f"https://www.youtube.com/watch?{urlencode({'v': video_id, 'lc': comment_id})}"


def normalize_comment_record(comment, video_id):
    if isinstance(comment, dict):
        comment_id = comment.get("comment_id") or None
        return {
            "username": normalize_username(comment.get("username")),
            "content": comment.get("content") or "",
            "comment_id": comment_id,
            "comment_url": comment.get("comment_url") or build_comment_url(video_id, comment_id),
            "channel_id": comment.get("channel_id"),
        }
    if isinstance(comment, (list, tuple)) and len(comment) >= 2:
        return {
            "username": normalize_username(comment[0]),
            "content": comment[1] or "",
            "comment_id": None,
            "comment_url": None,
        }
    return None


def quiet_options():
    options = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "socket_timeout": 30,
        "retries": 3,
        "fragment_retries": 3,
        "skip_unavailable_fragments": False,
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
                live_details = item.get("liveStreamingDetails", {})
                videos.append({
                    "video_id": video_id,
                    "title": item["snippet"]["title"],
                    "has_replay": bool(live_details.get("actualEndTime")),
                })

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
        raise RuntimeError(f"No se generó el archivo de replay: {chat_path.name}")
    if chat_path.stat().st_size == 0:
        raise RuntimeError(f"El archivo de replay está vacío: {chat_path.name}")

    with chat_path.open("r", encoding="utf-8") as stream:
        for line in stream:
            try:
                action = json.loads(line)
            except json.JSONDecodeError:
                raise RuntimeError(f"Replay inválido en {chat_path.name}")
            for renderer in renderer_from_action(action):
                message_id = renderer.get("id")
                author = renderer.get("authorName", {}).get("simpleText", "")
                text = "".join(run.get("text", "") for run in renderer.get("message", {}).get("runs", []))
                key = message_id or (author, text, renderer.get("timestampUsec"))
                if not author or key in seen:
                    continue
                seen.add(key)
                messages.append({"username": normalize_username(author), "content": text,
                                 "channel_id": renderer.get("authorExternalChannelId")})
    return messages


def load_checkpoint(checkpoint_path):
    if not checkpoint_path.exists():
        return None
    try:
        with checkpoint_path.open("r", encoding="utf-8") as stream:
            return json.load(stream)
    except (json.JSONDecodeError, OSError):
        checkpoint_path.unlink(missing_ok=True)
        return None


def save_checkpoint(checkpoint_path, result):
    temporary_path = checkpoint_path.with_suffix(".tmp")
    with temporary_path.open("w", encoding="utf-8") as stream:
        json.dump(result, stream, ensure_ascii=False)
    temporary_path.replace(checkpoint_path)


def seed_checkpoints_from_activity_log(channel_videos):
    activity_path = OUTPUT_DIRECTORY / "community_activity_log.csv"
    if not activity_path.exists():
        return 0

    videos = defaultdict(lambda: {"comments": [], "messages": []})
    with activity_path.open("r", encoding="utf-8-sig", newline="") as stream:
        for row in csv.DictReader(stream):
            video_id = row.get("video_id", "").strip()
            username = row.get("username", "").strip()
            if not video_id or not username:
                continue
            if row.get("type") == "comment":
                comment_id = row.get("comment_id", "").strip() or None
                videos[video_id]["comments"].append({
                    "username": username,
                    "content": row.get("content", ""),
                    "comment_id": comment_id,
                    "comment_url": row.get("comment_url", "").strip() or build_comment_url(video_id, comment_id),
                })
            elif row.get("type") == "live_message":
                videos[video_id]["messages"].append((username, row.get("content", "")))

    created = 0
    for video in channel_videos:
        video_id = video["video_id"]
        activity = videos.get(video_id, {"comments": [], "messages": []})
        checkpoint_path = CHECKPOINT_DIRECTORY / f"{video_id}.json"
        if checkpoint_path.exists():
            continue
        save_checkpoint(checkpoint_path, {
            "video_id": video_id,
            "comments": activity["comments"],
            "messages": activity["messages"],
            "replay_complete": False,
            "updated_at": activity_path.stat().st_mtime,
            "error": None,
            "source": "activity-log-migration",
        })
        created += 1
    return created


def download_live_chat(video_id, chat_path):
    output_template = str(CACHE_DIRECTORY / f"{video_id}.%(ext)s")
    options = {**quiet_options(), "writesubtitles": True, "subtitleslangs": ["live_chat"], "outtmpl": output_template}
    with YoutubeDL(options) as ydl:
        info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=True)
    if not info:
        raise RuntimeError(f"YouTube no devolvió información para {video_id}")
    if not info.get("subtitles", {}).get("live_chat"):
        return None
    messages = parse_live_chat(chat_path)
    time.sleep(float(os.getenv("COMMUNITY_RANKING_REPLAY_DELAY", "1")))
    return messages


def process_video(video, mode, refresh_comments):
    video_id = video["video_id"]
    checkpoint_path = CHECKPOINT_DIRECTORY / f"{video_id}.json"
    checkpoint = load_checkpoint(checkpoint_path)
    chat_path = CACHE_DIRECTORY / f"{video_id}.live_chat.json"

    replay_complete = bool(checkpoint and checkpoint.get("replay_complete")
                           and checkpoint.get("replay_verification_version") == REPLAY_VERIFICATION_VERSION)
    needs_replay = bool(video.get("has_replay") and (mode == "full" or not replay_complete))
    if checkpoint and mode == "incremental" and not refresh_comments and not needs_replay:
        return {**checkpoint, "error": None, "source": "checkpoint"}

    try:
        comments = get_video_comments(video_id) if mode == "full" or refresh_comments or not checkpoint else checkpoint.get("comments", [])
        messages = checkpoint.get("messages", []) if checkpoint else []
        replay_status = "complete" if replay_complete else "not-applicable"
        if needs_replay:
            downloaded_messages = download_live_chat(video_id, chat_path)
            replay_complete = downloaded_messages is not None
            replay_status = "complete" if replay_complete else "unavailable"
            if replay_complete:
                messages = downloaded_messages
        result = {
            "video_id": video_id,
            "comments": comments,
            "messages": messages,
            "replay_complete": replay_complete,
            "replay_verification_version": REPLAY_VERIFICATION_VERSION if replay_complete else None,
            "replay_status": replay_status,
            "updated_at": time.time(),
            "error": None,
            "source": "youtube",
        }
        save_checkpoint(checkpoint_path, result)
        return result
    except Exception as error:
        if checkpoint:
            return {**checkpoint, "error": safe_error(error), "source": "stale-checkpoint"}
        return {"video_id": video_id, "comments": [], "messages": [], "replay_complete": False, "error": safe_error(error), "source": "error"}
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
            top_level_comment = item["snippet"]["topLevelComment"]
            snippet = top_level_comment["snippet"]
            comment_id = top_level_comment.get("id")
            comments.append({
                "username": normalize_username(snippet.get("authorDisplayName")),
                "content": snippet.get("textDisplay") or "",
                "comment_id": comment_id,
                "comment_url": build_comment_url(video_id, comment_id),
                "channel_id": snippet.get("authorChannelId", {}).get("value"),
            })
        page_token = payload.get("nextPageToken")
        if not page_token:
            return comments


def normalize_message_record(message):
    if isinstance(message, dict):
        return {"username": normalize_username(message.get("username")),
                "content": message.get("content") or "", "channel_id": message.get("channel_id")}
    return {"username": normalize_username(message[0]), "content": message[1], "channel_id": None}


def resolve_channel_usernames(channel_ids):
    usernames = {}
    if not channel_ids:
        return usernames
    api_key = get_api_key()
    for offset in range(0, len(channel_ids), 50):
        response = requests.get(f"{YOUTUBE_API_BASE}/channels",
                                params={"key": api_key, "id": ",".join(channel_ids[offset:offset + 50]),
                                        "part": "snippet", "maxResults": 50}, timeout=30)
        response.raise_for_status()
        for channel in response.json().get("items", []):
            custom_url = channel.get("snippet", {}).get("customUrl")
            if custom_url:
                usernames[channel["id"]] = normalize_username(custom_url)
    return usernames


def canonicalize_identities(results):
    observed = defaultdict(set)
    records = []
    for result in results:
        comments = [normalize_comment_record(item, result["video_id"]) for item in result["comments"]]
        comments = [item for item in comments if item]
        messages = [normalize_message_record(item) for item in result["messages"]]
        records.append({**result, "comments": comments, "messages": messages})
        for item in comments + messages:
            if item.get("channel_id") and item["username"]:
                observed[item["channel_id"]].add(item["username"])
    current = resolve_channel_usernames(sorted(observed))
    canonical = {channel_id: current.get(channel_id) or sorted(names)[0]
                 for channel_id, names in observed.items()}
    aliases = defaultdict(set)
    for channel_id, names in observed.items():
        for name in names:
            aliases[name].add(channel_id)
    for result in records:
        for item in result["comments"] + result["messages"]:
            channel_id = item.get("channel_id")
            if not channel_id and len(aliases[item["username"]]) == 1:
                channel_id = next(iter(aliases[item["username"]]))
            item["username"] = canonical.get(channel_id, item["username"])
    identities = [{"channel_id": channel_id, "username": canonical[channel_id],
                   "observed_usernames": sorted(names)} for channel_id, names in sorted(observed.items())]
    return records, identities


def build_outputs(results):
    points = defaultdict(float)
    comments_count = defaultdict(int)
    live_messages_count = defaultdict(int)
    unique_videos = defaultdict(set)
    unique_lives = defaultdict(set)
    activity = []
    comment_evidence = []

    for result in results:
        video_id = result["video_id"]
        for raw_comment in result["comments"]:
            comment = normalize_comment_record(raw_comment, video_id)
            if not comment or not comment["username"]:
                continue
            username = comment["username"]
            content = comment["content"]
            first_comment_in_video = video_id not in unique_videos[username]
            points[username] += 2
            comments_count[username] += 1
            activity.append({
                "username": username,
                "type": "comment",
                "video_id": video_id,
                "points": 2,
                "content": content,
                "comment_id": comment["comment_id"] or "",
                "comment_url": comment["comment_url"] or "",
            })
            if first_comment_in_video:
                points[username] += 3
                unique_videos[username].add(video_id)
                activity.append({
                    "username": username,
                    "type": "unique_video_comment",
                    "video_id": video_id,
                    "points": 3,
                    "content": "",
                    "comment_id": comment["comment_id"] or "",
                    "comment_url": comment["comment_url"] or "",
                })
            comment_evidence.append({
                "username": username,
                "video_id": video_id,
                "comment_id": comment["comment_id"],
                "comment_url": comment["comment_url"],
                "points_awarded": 5 if first_comment_in_video else 2,
                "includes_unique_video_bonus": first_comment_in_video,
            })

        users_in_live = set()
        for raw_message in result["messages"]:
            message = normalize_message_record(raw_message)
            username, content = message["username"], message["content"]
            if not username:
                continue
            points[username] += 0.1
            live_messages_count[username] += 1
            activity.append({"username": username, "type": "live_message", "video_id": video_id, "points": 0.1, "content": content, "comment_id": "", "comment_url": ""})
            if username not in users_in_live:
                users_in_live.add(username)
                points[username] += 1
                unique_lives[username].add(video_id)
                activity.append({"username": username, "type": "unique_live", "video_id": video_id, "points": 1, "content": "", "comment_id": "", "comment_url": ""})

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
    return ranking, activity, comment_evidence


def export(ranking, activity, comment_evidence, partial=False):
    suffix = ".partial" if partial else ""
    with (OUTPUT_DIRECTORY / f"community_ranking{suffix}.json").open("w", encoding="utf-8") as stream:
        json.dump(ranking, stream, ensure_ascii=False, indent=2)
    with (OUTPUT_DIRECTORY / f"community_ranking{suffix}.csv").open("w", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=["username", "points", "comments", "live_messages", "unique_videos", "unique_lives"])
        writer.writeheader()
        writer.writerows(ranking)
    with (OUTPUT_DIRECTORY / f"community_activity_log{suffix}.csv").open("w", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=["username", "type", "video_id", "points", "content", "comment_id", "comment_url"])
        writer.writeheader()
        writer.writerows(activity)
    with (OUTPUT_DIRECTORY / f"community_comment_evidence{suffix}.json").open("w", encoding="utf-8") as stream:
        json.dump(comment_evidence, stream, ensure_ascii=False, indent=2)


def parse_args():
    parser = argparse.ArgumentParser(description="Calcula el ranking de comunidad de SotaKun.")
    parser.add_argument("--mode", choices=("incremental", "full"), default="incremental")
    return parser.parse_args()


def main():
    args = parse_args()
    started = time.perf_counter()
    CACHE_DIRECTORY.mkdir(parents=True, exist_ok=True)
    CHECKPOINT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    videos = get_channel_videos()
    seeded_checkpoints = seed_checkpoints_from_activity_log(videos)
    if seeded_checkpoints:
        print(f"Checkpoints migrados desde el histórico: {seeded_checkpoints}", flush=True)
    hot_video_ids = {video["video_id"] for video in videos[:INCREMENTAL_VIDEO_LIMIT]}
    print(f"Modo {args.mode}: {len(videos)} vídeos únicos encontrados", flush=True)
    results = []
    errors = 0
    reused_checkpoints = 0
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {
            executor.submit(process_video, video, args.mode, video["video_id"] in hot_video_ids): video
            for video in videos
        }
        for index, future in enumerate(as_completed(futures), start=1):
            result = future.result()
            results.append(result)
            errors += int(result["error"] is not None)
            reused_checkpoints += int(result.get("source") == "checkpoint")
            if result.get("source") != "checkpoint" or result["error"]:
                print(f"[{index}/{len(videos)}] {result['video_id']}: {len(result['comments'])} comentarios, {len(result['messages'])} mensajes" + (f" · ERROR: {result['error']}" if result["error"] else ""), flush=True)

    results, identities = canonicalize_identities(results)
    ranking, activity, comment_evidence = build_outputs(results)
    report = {
        "mode": args.mode,
        "completed_at": time.time(),
        "videos": len(videos),
        "errors": errors,
        "replays_unavailable": [item["video_id"] for item in results if item.get("replay_status") == "unavailable"],
        "failed_videos": [{"video_id": item["video_id"], "error": item["error"]} for item in results if item["error"]],
        "identities": identities,
    }
    with (OUTPUT_DIRECTORY / "community_scan_report.json").open("w", encoding="utf-8") as stream:
        json.dump(report, stream, ensure_ascii=False, indent=2)
    print(f"Replays no disponibles: {len(report['replays_unavailable'])}", flush=True)
    export(ranking, activity, comment_evidence, partial=errors > 0)
    shutil.rmtree(CACHE_DIRECTORY, ignore_errors=True)
    elapsed = time.perf_counter() - started
    print(f"Finalizado: {len(videos)} vídeos, {reused_checkpoints} desde caché, {sum(len(item['comments']) for item in results)} comentarios, {sum(len(item['messages']) for item in results)} mensajes, {errors} errores, {elapsed / 60:.2f} minutos", flush=True)
    return 1 if errors else 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:
        print(safe_error(error), file=sys.stderr, flush=True)
        sys.exit(1)
