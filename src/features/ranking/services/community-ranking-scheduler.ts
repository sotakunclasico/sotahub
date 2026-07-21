import "server-only";
import {
  communityRankingIncrementalIntervalMs,
  getCommunityRankingState,
  isFullCommunityRankingRefreshDue,
  refreshCommunityRanking,
} from "./community-ranking";

declare global {
  var __sotahubRankingScheduler: ReturnType<typeof setInterval> | undefined;
}

async function runScheduledRefresh() {
  const state = await getCommunityRankingState();
  const mode = isFullCommunityRankingRefreshDue(state) ? "full" : "incremental";
  return refreshCommunityRanking({ mode });
}

export function startCommunityRankingScheduler() {
  if (globalThis.__sotahubRankingScheduler || process.env.COMMUNITY_RANKING_AUTOSTART === "false") return;
  void runScheduledRefresh().catch((error: unknown) => console.error("[ranking] Falló el recálculo inicial", error));
  globalThis.__sotahubRankingScheduler = setInterval(() => {
    void runScheduledRefresh().catch((error: unknown) => console.error("[ranking] Falló el recálculo programado", error));
  }, communityRankingIncrementalIntervalMs);
  globalThis.__sotahubRankingScheduler.unref();
}
