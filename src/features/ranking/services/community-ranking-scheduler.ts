import "server-only";
import { refreshCommunityRanking } from "./community-ranking";

declare global {
  var __sotahubRankingScheduler: ReturnType<typeof setInterval> | undefined;
}

const oneDayMs = 24 * 60 * 60 * 1_000;

export function startCommunityRankingScheduler() {
  if (globalThis.__sotahubRankingScheduler || process.env.COMMUNITY_RANKING_AUTOSTART === "false") return;
  void refreshCommunityRanking().catch((error: unknown) => console.error("[ranking] Falló el recálculo inicial", error));
  globalThis.__sotahubRankingScheduler = setInterval(() => {
    void refreshCommunityRanking().catch((error: unknown) => console.error("[ranking] Falló el recálculo diario", error));
  }, oneDayMs);
  globalThis.__sotahubRankingScheduler.unref();
}
