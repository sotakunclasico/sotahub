export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  url: string;
  durationSeconds: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isLive: boolean;
  isUpcoming: boolean;
  isShort: boolean;
  wasLive: boolean;
  concurrentViewers: number;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  itemCount: number;
  url: string;
}

export interface YouTubeSnapshot {
  syncedAt: string;
  channel: {
    id: string;
    title: string;
    description: string;
    customUrl: string;
    thumbnail: string;
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
    url: string;
  };
  featured: {
    latestVideo: YouTubeVideo | null;
    live: YouTubeVideo | null;
    latestLive: YouTubeVideo | null;
  };
  videos: YouTubeVideo[];
  shorts: YouTubeVideo[];
  playlists: YouTubePlaylist[];
}
