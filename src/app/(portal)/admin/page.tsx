import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getGiveawayCandidates } from "@/features/giveaways/services/giveaway-draw";
import { getCommunityRanking, getCommunityRankingState } from "@/features/ranking/services/community-ranking";
import { Sidebar } from "@/layouts/sidebar";

export const metadata = { title: "Administración" };

const modules = {
  users: { title: "Usuarios", description: "Las cuentas persistentes aparecerán aquí al conectar Auth.js con PostgreSQL.", status: "Persistencia pendiente" },
  orders: { title: "Pedidos", description: "No existen pedidos almacenados. El checkout continuará bloqueado mientras la tienda pública esté oculta.", status: "Módulo inactivo" },
  certificates: { title: "Certificados", description: "La estructura está preparada; la emisión comenzará cuando existan piezas físicas numeradas.", status: "Emisión pendiente" },
  ranking: { title: "Ranking", description: "La clasificación pública usa checkpoints incrementales cada 10 minutos y reconstruye todo el histórico una vez al mes.", status: "Operativo", href: "/ranking", action: "Abrir ranking" },
  giveaways: { title: "Sorteos", description: "La mesa de extracción utiliza participantes reales, exclusiones y probabilidades ponderadas.", status: "Operativo", href: "/sorteos", action: "Abrir sorteos" },
  news: { title: "Noticias", description: "La página pública muestra las últimas publicaciones oficiales del canal. El editor propio llegará con PostgreSQL.", status: "Lectura operativa", href: "/noticias", action: "Ver actualidad" },
  logs: { title: "Logs", description: "Los eventos administrativos se conectarán al modelo AuditLog cuando la persistencia esté activa.", status: "Persistencia pendiente" },
} as const;

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const [{ view }, ranking, rankingState, giveaway] = await Promise.all([
    searchParams,
    getCommunityRanking(),
    getCommunityRankingState(),
    getGiveawayCandidates([]),
  ]);
  const selected = view && view in modules ? modules[view as keyof typeof modules] : null;
  const lastRun = rankingState.lastSuccessfulRunAt
    ? new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Madrid" }).format(new Date(rankingState.lastSuccessfulRunAt))
    : "Pendiente";
  const stats = [
    ["Miembros con actividad", ranking.length.toLocaleString("es-ES")],
    ["Elegibles para sorteo", giveaway.candidates.length.toLocaleString("es-ES")],
    ["Último análisis", lastRun],
  ] as const;

  return <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
    <Sidebar/>
    <section className="min-w-0">
      <Badge>CONTROL CENTER</Badge>
      <h1 className="display-title mt-4 text-4xl text-[#e0c89e]">{selected?.title ?? "Operaciones"}</h1>
      <p className="mt-2 text-[#817666]">Vista basada exclusivamente en datos procesados o estados declarados.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">{stats.map(([label, value]) => <Card className="p-5" key={label}><p className="font-serif text-2xl text-[#e0c495]">{value}</p><p className="mt-2 text-xs tracking-wider text-[#716758] uppercase">{label}</p></Card>)}</div>
      <Card className="mt-6 p-7">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-serif text-2xl text-[#dec69d]">{selected?.title ?? "Actividad administrativa"}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#807566]">{selected?.description ?? "Todavía no existen pedidos, certificados ni eventos administrativos persistidos. Cada módulo se activará cuando disponga de una fuente de datos real."}</p></div><Badge>{selected?.status ?? "SIN DATOS SIMULADOS"}</Badge></div>
        {selected && "href" in selected && <Button href={selected.href} variant="secondary" className="mt-6">{selected.action}</Button>}
      </Card>
    </section>
  </div>;
}
