import { z } from "zod";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getYouTubeLinkConfig } from "@/features/connections/youtube/youtube-link.config";
import { readYouTubeOAuthState, sealYouTubeCookie, youtubeLinkCookieName, youtubeOAuthCookieName } from "@/features/connections/youtube/youtube-link-cookie";

export const runtime = "nodejs";

const tokenSchema = z.object({ access_token: z.string().min(1) });
const channelsSchema = z.object({ items: z.array(z.object({
  id: z.string().min(1),
  snippet: z.object({
    title: z.string().min(1),
    customUrl: z.string().optional(),
    thumbnails: z.record(z.string(), z.object({ url: z.string().url() })).optional(),
  }),
})).min(1) });

function settingsRedirect(request: NextRequest, status: string) {
  const url = new URL("/settings", request.url);
  url.searchParams.set("youtube", status);
  const response = NextResponse.redirect(url, 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user.id) return settingsRedirect(request, "unauthorized");
  const config = getYouTubeLinkConfig();
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const oauthState = readYouTubeOAuthState(request.cookies.get(youtubeOAuthCookieName)?.value);
  if (!config.enabled || !code || !state || !oauthState || oauthState.state !== state || oauthState.userId !== session.user.id) {
    return settingsRedirect(request, "invalid-state");
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        code_verifier: oauthState.verifier,
        grant_type: "authorization_code",
        redirect_uri: config.callbackUrl,
      }),
      cache: "no-store",
    });
    if (!tokenResponse.ok) return settingsRedirect(request, "provider-error");
    const token = tokenSchema.parse(await tokenResponse.json());
    const channelsResponse = await fetch("https://www.googleapis.com/youtube/v3/channels?part=id,snippet&mine=true", {
      headers: { authorization: `Bearer ${token.access_token}` },
      cache: "no-store",
    });
    if (!channelsResponse.ok) return settingsRedirect(request, "channel-error");
    const channels = channelsSchema.parse(await channelsResponse.json());
    const channel = channels.items[0];
    const thumbnails = channel.snippet.thumbnails ? Object.values(channel.snippet.thumbnails) : [];
    const response = settingsRedirect(request, "linked");
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set(youtubeOAuthCookieName, "", { maxAge: 0, path: "/api/youtube/link" });
    response.cookies.set(youtubeLinkCookieName, sealYouTubeCookie({
      userId: session.user.id,
      channelId: channel.id,
      title: channel.snippet.title,
      handle: channel.snippet.customUrl ?? null,
      thumbnail: thumbnails.at(-1)?.url ?? null,
      linkedAt: new Date().toISOString(),
    }), {
      httpOnly: true,
      sameSite: "lax",
      secure: config.appUrl.startsWith("https://"),
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch {
    return settingsRedirect(request, "unexpected-error");
  }
}
