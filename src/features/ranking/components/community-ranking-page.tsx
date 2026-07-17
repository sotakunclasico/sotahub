import { MessageCircle, Radio, Trophy, Video } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getCommunityRanking, getCommunityRankingState } from "@/features/ranking/services/community-ranking";

function formatDate(value: string | null) {
  if (!value) return "Pendiente del primer cálculo";
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Madrid" }).format(new Date(value));
}

export async function CommunityRankingPage() {
  const [ranking, state] = await Promise.all([getCommunityRanking(), getCommunityRankingState()]);
  const topThree = ranking.slice(0, 3);
  return <>
    <PageHeader eyebrow="COMMUNITY RANKING" title="La comunidad deja huella" description="Clasificación calculada a partir de comentarios, participación en vídeos y mensajes de los directos de SotaKun." />
    <section className="shell pb-24">
      <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-white/[.07] bg-white/[.025] px-5 py-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>Último recálculo: <strong className="text-slate-200">{formatDate(state.lastSuccessfulRunAt)}</strong></span>
        <Badge className={state.status === "failed" ? "border-red-400/20 bg-red-400/10 text-red-300" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"}>{state.status === "running" ? "Calculando" : state.status === "failed" ? "Revisión necesaria" : "Actualización diaria"}</Badge>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {topThree.map((entry, index) => <Card className={index === 0 ? "relative p-6 md:-translate-y-3 border-yellow-300/20" : "relative p-6"} key={entry.username}>
          <span className="absolute right-5 top-3 text-5xl font-black text-white/[.04]">0{index + 1}</span>
          <Avatar name={entry.username} className="size-14" />
          <h2 className="mt-5 truncate text-xl font-black text-white">{entry.username}</h2>
          <p className={index === 0 ? "mt-2 text-3xl font-black text-yellow-300" : "mt-2 text-3xl font-black text-sky-300"}>{entry.points.toLocaleString("es-ES")} <span className="text-xs text-slate-600">PTS</span></p>
          <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-slate-500"><span>{entry.comments} comentarios</span><span>{entry.live_messages} mensajes</span></div>
        </Card>)}
      </div>

      <Card className="mt-8 overflow-hidden">
        <div className="border-b border-white/[.07] p-5"><h2 className="flex items-center gap-3 font-black text-white"><Trophy className="text-yellow-300" size={19}/> Ranking global</h2></div>
        <div className="overflow-x-auto"><table className="w-full min-w-190 text-left text-sm"><thead className="bg-white/[.025] text-[10px] tracking-widest text-slate-600 uppercase"><tr><th className="px-5 py-4">Posición</th><th className="px-5 py-4">Miembro</th><th className="px-5 py-4">Puntos</th><th className="px-5 py-4"><MessageCircle size={14}/></th><th className="px-5 py-4"><Radio size={14}/></th><th className="px-5 py-4"><Video size={14}/></th></tr></thead><tbody className="divide-y divide-white/[.055]">{ranking.slice(0, 100).map((entry,index)=><tr className="text-slate-400 transition hover:bg-white/[.025]" key={entry.username}><td className="px-5 py-4 font-black text-slate-600">#{index+1}</td><td className="px-5 py-4 font-bold text-white">{entry.username}</td><td className="px-5 py-4 font-black text-sky-300">{entry.points.toLocaleString("es-ES")}</td><td className="px-5 py-4">{entry.comments}</td><td className="px-5 py-4">{entry.live_messages}</td><td className="px-5 py-4">{entry.unique_videos}</td></tr>)}</tbody></table></div>
      </Card>
      <p className="mt-5 text-xs leading-5 text-slate-600">Puntuación: +2 por comentario, +3 por participar por primera vez en un vídeo, +0,1 por mensaje en directo y +1 por participar por primera vez en un directo. El sistema elimina duplicados por vídeo y usuario.</p>
    </section>
  </>;
}
