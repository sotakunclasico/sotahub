"use client";

import { useEffect } from "react";

export function YouTubeLinkLifetimeRefresh() {
  useEffect(() => {
    void fetch("/api/youtube/link/refresh", {
      method: "POST",
      credentials: "same-origin",
      headers: { "x-sotahub-action": "refresh-youtube-link" },
    });
  }, []);

  return null;
}
