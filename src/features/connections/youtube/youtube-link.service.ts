import "server-only";

import { cookies } from "next/headers";
import type { LinkedYouTubeChannel } from "./youtube-link.types";
import { readYouTubeLinkCookie, youtubeLinkCookieName } from "./youtube-link-cookie";

export async function getLinkedYouTubeChannel(userId: string): Promise<LinkedYouTubeChannel | null> {
  const cookieStore = await cookies();
  const link = readYouTubeLinkCookie(cookieStore.get(youtubeLinkCookieName)?.value, userId);
  if (!link) return null;
  return {
    channelId: link.channelId,
    title: link.title,
    handle: link.handle,
    thumbnail: link.thumbnail,
    linkedAt: link.linkedAt,
  };
}
