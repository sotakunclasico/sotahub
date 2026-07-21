import { auth } from "@/lib/auth";
import { refreshCommunityRanking } from "@/features/ranking/services/community-ranking";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const session = await auth();
  const authorization = request.headers.get("authorization");
  const cronAuthorized = Boolean(process.env.CRON_SECRET) && authorization === `Bearer ${process.env.CRON_SECRET}`;
  if (session?.user.role !== "ADMIN" && !cronAuthorized) return Response.json({ error: "No autorizado" }, { status: 401 });
  const requestedMode = new URL(request.url).searchParams.get("mode") ?? "incremental";
  if (requestedMode !== "incremental" && requestedMode !== "full") {
    return Response.json({ error: "Modo de actualización no válido" }, { status: 400 });
  }
  const state = await refreshCommunityRanking({ force: true, mode: requestedMode });
  return Response.json(state, { status: state.status === "failed" ? 500 : 200 });
}
