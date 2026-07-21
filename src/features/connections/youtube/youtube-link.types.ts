export type LinkedYouTubeChannel = {
  channelId: string;
  title: string;
  handle: string | null;
  thumbnail: string | null;
  linkedAt: string;
};

export type YouTubeLinkReadiness = {
  enabled: boolean;
  callbackUrl: string;
  missing: string[];
};
