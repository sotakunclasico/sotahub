import { getCommunityRanking, getCommunityRankingState } from "@/features/ranking/services/community-ranking";
export const runtime = "nodejs";
export async function GET() {
  const [ranking, state] = await Promise.all([getCommunityRanking(), getCommunityRankingState()]);
  return Response.json({ data: ranking, meta: state }, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } });
}
