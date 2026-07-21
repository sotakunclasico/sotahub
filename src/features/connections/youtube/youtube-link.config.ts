import "server-only";

import type { YouTubeLinkReadiness } from "./youtube-link.types";

export function getYouTubeLinkConfig() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const callbackUrl = process.env.YOUTUBE_OAUTH_REDIRECT_URI ?? new URL("/api/youtube/link/callback", appUrl).toString();
  const clientId = process.env.YOUTUBE_OAUTH_CLIENT_ID ?? "";
  const clientSecret = process.env.YOUTUBE_OAUTH_CLIENT_SECRET ?? "";
  const signingSecret = process.env.AUTH_SECRET ?? "";
  const missing = [
    !clientId && "YOUTUBE_OAUTH_CLIENT_ID",
    !clientSecret && "YOUTUBE_OAUTH_CLIENT_SECRET",
    !signingSecret && "AUTH_SECRET",
  ].filter((value): value is string => Boolean(value));

  return { appUrl, callbackUrl, clientId, clientSecret, signingSecret, enabled: missing.length === 0, missing };
}

export function getYouTubeLinkReadiness(): YouTubeLinkReadiness {
  const config = getYouTubeLinkConfig();
  return { enabled: config.enabled, callbackUrl: config.callbackUrl, missing: config.missing };
}
