import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { YouTubeSnapshot } from "./youtube.types";
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

export const youtubeService = {
  async getChannel(): Promise<YouTubeSnapshot> {
    try {
      const file = await readFile(path.join(process.cwd(), "data", "youtube-channel.json"), "utf8");
      return JSON.parse(file) as YouTubeSnapshot;
    } catch {
      return fallback;
    }
  },
};
