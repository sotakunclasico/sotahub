import { type NextRequest, NextResponse } from "next/server";
import { YOUTUBE_LINK_MAX_AGE_SECONDS } from "@/config/session";
import {
  readYouTubeLinkCookie,
  sealYouTubeCookie,
  youtubeLinkCookieName,
} from "@/features/connections/youtube/youtube-link-cookie";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (request.headers.get("x-sotahub-action") !== "refresh-youtube-link") {
    return new Response(null, { status: 403 });
  }

  const session = await auth();
  if (!session?.user.id) return new Response(null, { status: 401 });

  const link = readYouTubeLinkCookie(
    request.cookies.get(youtubeLinkCookieName)?.value,
    session.user.id,
  );
  if (!link) return new Response(null, { status: 204 });

  const response = NextResponse.json({ refreshed: true });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(youtubeLinkCookieName, sealYouTubeCookie(link), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: YOUTUBE_LINK_MAX_AGE_SECONDS,
  });
  return response;
}
