import "server-only";

import { z } from "zod";
import youtubeSnapshot from "../../../data/youtube-channel.json";
import type { YouTubePlaylist, YouTubeSnapshot, YouTubeVideo } from "./youtube.types";
import { filterPortraitBroadcastCopies } from "./youtube-presentation";
import { siteConfig } from "@/config/site";

const fallback: YouTubeSnapshot = {
  syncedAt: "",
  channel: {
    id: "UCJ-vmk0-j_GC8bB_RK2vA9A",
    title: "SotaKun",
    description: "",
    customUrl: "",
    thumbnail: "",
    subscriberCount: 0,
    videoCount: 0,
    viewCount: 0,
    url: siteConfig.social.youtube,
  },
  featured: { latestVideo: null, live: null, latestLive: null },
  videos: [],
  shorts: [],
  playlists: [],
};

const bundledSnapshot: YouTubeSnapshot = youtubeSnapshot;
const thumbnailSchema = z.record(z.string(), z.object({ url: z.string().url() }));
const youtubeChannelResponseSchema = z.object({
  items: z.array(z.object({
    snippet: z.object({
      title: z.string(),
      description: z.string(),
      customUrl: z.string().optional(),
      thumbnails: thumbnailSchema,
    }),
    contentDetails: z.object({ relatedPlaylists: z.object({ uploads: z.string() }) }),
    statistics: z.object({
      subscriberCount: z.string().optional(),
      videoCount: z.string().optional(),
      viewCount: z.string().optional(),
    }),
  })),
});
const youtubePlaylistItemsResponseSchema = z.object({
  items: z.array(z.object({ contentDetails: z.object({ videoId: z.string() }) })),
});
const youtubeVideosResponseSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    snippet: z.object({
      title: z.string(),
      description: z.string(),
      publishedAt: z.string(),
      thumbnails: thumbnailSchema,
      liveBroadcastContent: z.enum(["live", "upcoming", "none"]).default("none"),
    }),
    contentDetails: z.object({ duration: z.string() }),
    statistics: z.object({
      viewCount: z.string().optional(),
      likeCount: z.string().optional(),
      commentCount: z.string().optional(),
    }).optional(),
    liveStreamingDetails: z.object({
      actualStartTime: z.string().optional(),
      actualEndTime: z.string().optional(),
      scheduledStartTime: z.string().optional(),
      concurrentViewers: z.string().optional(),
    }).optional(),
  })),
});
const youtubePlaylistsResponseSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    snippet: z.object({
      title: z.string(),
      description: z.string(),
      publishedAt: z.string(),
      thumbnails: thumbnailSchema,
    }),
    contentDetails: z.object({ itemCount: z.number().int().nonnegative() }),
  })),
});

const runtimeCacheTtlMs = 5 * 60 * 1_000;
let runtimeCache: { expiresAt: number; value: YouTubeSnapshot } | undefined;

function numericStatistic(value: string | undefined, current = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : current;
}

function bestThumbnail(thumbnails: Record<string, { url: string }>, current = "") {
  return thumbnails.maxres?.url
    ?? thumbnails.standard?.url
    ?? thumbnails.high?.url
    ?? thumbnails.medium?.url
    ?? thumbnails.default?.url
    ?? current;
}

function durationInSeconds(duration: string) {
  const match = duration.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return 0;
  return Number(match[1] ?? 0) * 86_400
    + Number(match[2] ?? 0) * 3_600
    + Number(match[3] ?? 0) * 60
    + Number(match[4] ?? 0);
}

async function youtubeApi<T>(path: string, params: Record<string, string>, schema: z.ZodType<T>, apiKey: string) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("key", apiKey);
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error(`YouTube API respondió ${response.status}.`);
  return schema.parse(await response.json());
}

function mapVideo(item: z.infer<typeof youtubeVideosResponseSchema>["items"][number]): YouTubeVideo {
  const durationSeconds = durationInSeconds(item.contentDetails.duration);
  const live = item.liveStreamingDetails;
  const isLive = item.snippet.liveBroadcastContent === "live" || Boolean(live?.actualStartTime && !live.actualEndTime);
  const isUpcoming = item.snippet.liveBroadcastContent === "upcoming" || Boolean(live?.scheduledStartTime && !live.actualStartTime);
  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
    thumbnail: bestThumbnail(item.snippet.thumbnails),
    url: `https://www.youtube.com/watch?v=${item.id}`,
    durationSeconds,
    viewCount: numericStatistic(item.statistics?.viewCount),
    likeCount: numericStatistic(item.statistics?.likeCount),
    commentCount: numericStatistic(item.statistics?.commentCount),
    isLive,
    isUpcoming,
    isShort: !isLive && !isUpcoming && durationSeconds > 0 && durationSeconds <= 180,
    wasLive: Boolean(live?.actualStartTime),
    concurrentViewers: numericStatistic(live?.concurrentViewers),
  };
}

function mapPlaylist(item: z.infer<typeof youtubePlaylistsResponseSchema>["items"][number]): YouTubePlaylist {
  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
    thumbnail: bestThumbnail(item.snippet.thumbnails),
    itemCount: item.contentDetails.itemCount,
    url: `https://www.youtube.com/playlist?list=${item.id}`,
  };
}

async function getLiveChannelData(snapshot: YouTubeSnapshot) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return snapshotForPresentation(snapshot);
  if (runtimeCache && runtimeCache.expiresAt > Date.now()) return runtimeCache.value;

  try {
    const channelData = await youtubeApi("channels", {
      part: "snippet,statistics,contentDetails",
      id: snapshot.channel.id,
    }, youtubeChannelResponseSchema, apiKey);
    const channel = channelData.items[0];
    if (!channel) return snapshot;

    const uploads = await youtubeApi("playlistItems", {
      part: "contentDetails",
      playlistId: channel.contentDetails.relatedPlaylists.uploads,
      maxResults: "30",
    }, youtubePlaylistItemsResponseSchema, apiKey);
    const videoIds = uploads.items.map((item) => item.contentDetails.videoId);
    const [videoData, playlistData] = await Promise.all([
      videoIds.length > 0
        ? youtubeApi("videos", {
            part: "snippet,contentDetails,statistics,liveStreamingDetails",
            id: videoIds.join(","),
          }, youtubeVideosResponseSchema, apiKey)
        : Promise.resolve({ items: [] }),
      youtubeApi("playlists", {
        part: "snippet,contentDetails",
        channelId: snapshot.channel.id,
        maxResults: "25",
      }, youtubePlaylistsResponseSchema, apiKey),
    ]);

    const allVideos = await filterPortraitBroadcastCopies(videoData.items.map(mapVideo));
    const value: YouTubeSnapshot = {
      syncedAt: new Date().toISOString(),
      channel: {
        ...snapshot.channel,
        title: channel.snippet.title,
        description: channel.snippet.description,
        customUrl: channel.snippet.customUrl ?? snapshot.channel.customUrl,
        thumbnail: bestThumbnail(channel.snippet.thumbnails, snapshot.channel.thumbnail),
        subscriberCount: numericStatistic(channel.statistics.subscriberCount, snapshot.channel.subscriberCount),
        videoCount: numericStatistic(channel.statistics.videoCount, snapshot.channel.videoCount),
        viewCount: numericStatistic(channel.statistics.viewCount, snapshot.channel.viewCount),
      },
      featured: {
        latestVideo: allVideos.find((video) => !video.isLive && !video.isUpcoming) ?? snapshot.featured.latestVideo,
        live: allVideos.find((video) => video.isLive) ?? null,
        latestLive: allVideos.find((video) => video.wasLive && !video.isLive) ?? snapshot.featured.latestLive,
      },
      videos: allVideos.filter((video) => !video.isShort).slice(0, 12),
      shorts: allVideos.filter((video) => video.isShort).slice(0, 12),
      playlists: playlistData.items.map(mapPlaylist),
    };
    runtimeCache = { expiresAt: Date.now() + runtimeCacheTtlMs, value };
    return value;
  } catch {
    return snapshotForPresentation(snapshot);
  }
}

async function snapshotForPresentation(snapshot: YouTubeSnapshot): Promise<YouTubeSnapshot> {
  const videos = await filterPortraitBroadcastCopies(snapshot.videos);
  return {
    ...snapshot,
    featured: {
      latestVideo: videos.find((video) => !video.isLive && !video.isUpcoming) ?? snapshot.featured.latestVideo,
      live: videos.find((video) => video.isLive) ?? null,
      latestLive: videos.find((video) => video.wasLive && !video.isLive) ?? null,
    },
    videos,
  };
}

export const youtubeService = {
  async getChannel(): Promise<YouTubeSnapshot> {
    const snapshot = bundledSnapshot.channel.id ? bundledSnapshot : fallback;
    return getLiveChannelData(snapshot);
  },
};
