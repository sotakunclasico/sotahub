import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getYouTubeLinkConfig } from "@/features/connections/youtube/youtube-link.config";
import { sealYouTubeCookie, youtubeOAuthCookieName } from "@/features/connections/youtube/youtube-link-cookie";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user.id) return new Response("No autenticado", { status: 401 });
  const config = getYouTubeLinkConfig();
  if (!config.enabled) return NextResponse.redirect(new URL("/settings?youtube=not-configured", config.appUrl));

  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.callbackUrl,
    response_type: "code",
    scope: "openid profile https://www.googleapis.com/auth/youtube.readonly",
    access_type: "online",
    include_granted_scopes: "true",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();

  const response = NextResponse.redirect(authorizationUrl);
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(youtubeOAuthCookieName, sealYouTubeCookie({ userId: session.user.id, state, verifier, expiresAt: Date.now() + 10 * 60_000 }), {
    httpOnly: true,
    sameSite: "lax",
    secure: config.appUrl.startsWith("https://"),
    path: "/api/youtube/link",
    maxAge: 10 * 60,
  });
  return response;
}
