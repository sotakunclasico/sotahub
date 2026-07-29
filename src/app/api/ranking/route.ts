import { getCommunityRanking, getCommunityRankingState } from "@/features/ranking/services/community-ranking";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const [ranking, state] = await Promise.all([getCommunityRanking(), getCommunityRankingState()]);
  const fresh = new URL(request.url).searchParams.get("fresh") === "1";
  return Response.json(
    { data: ranking, meta: state },
    { headers: { "Cache-Control": fresh ? "no-store" : "public, max-age=300, stale-while-revalidate=3600" } },
  );
}
