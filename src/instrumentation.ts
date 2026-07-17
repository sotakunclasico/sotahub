export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NEXT_PHASE === "phase-production-build") return;
  const { startCommunityRankingScheduler } = await import("@/features/ranking/services/community-ranking-scheduler");
  startCommunityRankingScheduler();
}
