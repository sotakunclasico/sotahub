import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { youtubeLinkCookieName } from "@/features/connections/youtube/youtube-link-cookie";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user.id) return new Response("No autenticado", { status: 401 });
  const response = NextResponse.redirect(new URL("/settings?youtube=disconnected", request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  response.cookies.delete(youtubeLinkCookieName);
  return response;
}
