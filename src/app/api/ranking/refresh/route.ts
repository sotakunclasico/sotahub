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
  if (process.env.SOTAHUB_RUNTIME === "cloudflare") {
    const engineUrl = process.env.RANKING_ENGINE_URL?.trim();
    const engineSecret = process.env.RANKING_ENGINE_SECRET?.trim();
    if (!engineUrl || !engineSecret) {
      return Response.json(
        { error: "El motor externo todavía no tiene configuradas sus credenciales." },
        { status: 503 },
      );
    }
    try {
      const engineResponse = await fetch(
        new URL(`/jobs/${requestedMode}`, engineUrl),
        {
          method: "POST",
          headers: {
            accept: "application/json",
            authorization: `Bearer ${engineSecret}`,
          },
          signal: AbortSignal.timeout(15_000),
        },
      );
      const payload: unknown = await engineResponse.json();
      if (!engineResponse.ok && engineResponse.status !== 409) {
        const message = payload && typeof payload === "object" && "detail" in payload
          ? String(payload.detail)
          : "El motor externo no pudo iniciar el análisis.";
        return Response.json({ error: message }, { status: engineResponse.status });
      }
      return Response.json(payload, { status: 202 });
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : "No se pudo contactar con el motor externo." },
        { status: 502 },
      );
    }
  }
  const state = await refreshCommunityRanking({ force: true, mode: requestedMode });
  return Response.json(state, { status: state.status === "failed" ? 500 : 200 });
}
