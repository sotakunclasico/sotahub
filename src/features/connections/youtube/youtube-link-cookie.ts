import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { getYouTubeLinkConfig } from "./youtube-link.config";

export const youtubeOAuthCookieName = "sotakun.youtube.oauth";
export const youtubeLinkCookieName = "sotakun.youtube.link";

const oauthStateSchema = z.object({
  userId: z.string().min(1),
  state: z.string().min(32),
  verifier: z.string().min(43),
  expiresAt: z.number().int().positive(),
});

const linkedChannelSchema = z.object({
  userId: z.string().min(1),
  channelId: z.string().min(1),
  title: z.string().min(1),
  handle: z.string().nullable(),
  thumbnail: z.string().url().nullable(),
  linkedAt: z.string().datetime(),
});

export type YouTubeOAuthState = z.infer<typeof oauthStateSchema>;
export type YouTubeLinkCookie = z.infer<typeof linkedChannelSchema>;

function signature(value: string) {
  const { signingSecret } = getYouTubeLinkConfig();
  if (!signingSecret) throw new Error("AUTH_SECRET no está configurado.");
  return createHmac("sha256", signingSecret).update(value).digest("base64url");
}

export function sealYouTubeCookie(value: YouTubeOAuthState | YouTubeLinkCookie) {
  const encoded = Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
  return `${encoded}.${signature(encoded)}`;
}

function unseal(value: string) {
  const [encoded, receivedSignature] = value.split(".");
  if (!encoded || !receivedSignature) return null;
  const expectedSignature = signature(encoded);
  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(receivedSignature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try { return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as unknown; }
  catch { return null; }
}

export function readYouTubeOAuthState(value: string | undefined) {
  if (!value) return null;
  const parsed = oauthStateSchema.safeParse(unseal(value));
  if (!parsed.success || parsed.data.expiresAt < Date.now()) return null;
  return parsed.data;
}

export function readYouTubeLinkCookie(value: string | undefined, userId: string) {
  if (!value) return null;
  const parsed = linkedChannelSchema.safeParse(unseal(value));
  if (!parsed.success || parsed.data.userId !== userId) return null;
  return parsed.data;
}
