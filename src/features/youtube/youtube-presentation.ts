import "server-only";

import { youtubeVideoOrientationOverrides } from "@/config/youtube";
import type { YouTubeVideo } from "./youtube.types";

type VideoOrientation = "landscape" | "portrait" | "unknown";

const duplicateWindowMs = 6 * 60 * 60 * 1_000;
const orientationCacheTtlMs = 7 * 24 * 60 * 60 * 1_000;
const orientationCache = new Map<string, { expiresAt: number; value: VideoOrientation }>();

function isBroadcast(video: YouTubeVideo) {
  return video.isLive || video.isUpcoming || video.wasLive;
}

function normalizedTitle(title: string) {
  return title.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
}

function publishedAtMs(video: YouTubeVideo) {
  const timestamp = Date.parse(video.publishedAt);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function duplicateBroadcastGroups(videos: YouTubeVideo[]) {
  const byTitle = new Map<string, YouTubeVideo[]>();

  for (const video of videos) {
    if (!isBroadcast(video)) continue;
    const key = normalizedTitle(video.title);
    byTitle.set(key, [...(byTitle.get(key) ?? []), video]);
  }

  return [...byTitle.values()].flatMap((sameTitle) => {
    const ordered = [...sameTitle].sort((left, right) => publishedAtMs(left) - publishedAtMs(right));
    const groups: YouTubeVideo[][] = [];

    for (const video of ordered) {
      const current = groups.at(-1);
      const previous = current?.at(-1);
      if (!current || !previous || publishedAtMs(video) - publishedAtMs(previous) > duplicateWindowMs) {
        groups.push([video]);
      } else {
        current.push(video);
      }
    }

    return groups.filter((group) => group.length > 1);
  });
}

async function detectOrientation(videoId: string): Promise<VideoOrientation> {
  const override = youtubeVideoOrientationOverrides[videoId];
  if (override) return override;

  const cached = orientationCache.get(videoId);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  let value: VideoOrientation = "unknown";

  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      cache: "force-cache",
      headers: { "Accept-Language": "es-ES,es;q=0.9,en;q=0.8" },
      next: { revalidate: 604_800 },
      signal: AbortSignal.timeout(5_000),
    });
    if (response.ok) {
      const page = await response.text();
      const hasPortraitStream = /"width":(?:360|480|720|1080),"height":(?:640|854|1280|1920)/.test(page);
      const hasLandscapeStream = /"width":(?:640|854|1280|1920),"height":(?:360|480|720|1080)/.test(page);
      value = hasPortraitStream ? "portrait" : hasLandscapeStream ? "landscape" : "unknown";
    }
  } catch {
    value = "unknown";
  }

  orientationCache.set(videoId, { expiresAt: Date.now() + orientationCacheTtlMs, value });
  return value;
}

/**
 * Removes only confirmed portrait copies from duplicated broadcasts.
 * Ranking ingestion keeps using the complete YouTube source and is not affected.
 */
export async function filterPortraitBroadcastCopies(videos: YouTubeVideo[]) {
  const duplicateGroups = duplicateBroadcastGroups(videos);
  if (duplicateGroups.length === 0) return videos;

  const hiddenIds = new Set<string>();
  await Promise.all(duplicateGroups.map(async (group) => {
    const orientations = await Promise.all(group.map(async (video) => ({
      id: video.id,
      orientation: await detectOrientation(video.id),
    })));

    if (!orientations.some(({ orientation }) => orientation === "landscape")) return;
    for (const video of orientations) {
      if (video.orientation === "portrait") hiddenIds.add(video.id);
    }
  }));

  return videos.filter((video) => !hiddenIds.has(video.id));
}
