import { Activity, Crown, MessageCircle, Radio, RefreshCw, Trophy, Video } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getCommunityRanking, getCommunityRankingState } from "@/features/ranking/services/community-ranking";

function formatDate(value: string | null) {
  if (!value) return "Pendiente del primer cálculo";
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Madrid" }).format(new Date(value));
}

const podiumStyles = [
  { label: "Leyenda", color: "text-[#f0c56f]", border: "border-[#c99a4f]/80", order: "md:order-2 md:-translate-y-5", icon: Crown },
  { label: "Élite", color: "text-[#c7c4ba]", border: "border-[#8c887d]/55", order: "md:order-1", icon: Trophy },
  { label: "Veterano", color: "text-[#bf8056]", border: "border-[#87533a]/60", order: "md:order-3", icon: Trophy },
] as const;

export async function CommunityRankingPage() {
  const [ranking, state] = await Promise.all([getCommunityRanking(), getCommunityRankingState()]);
  const topThree = ranking.slice(0, 3);
  const totalComments = ranking.reduce((total, entry) => total + entry.comments, 0);
  const totalLiveMessages = ranking.reduce((total, entry) => total + entry.live_messages, 0);

  return <>
    <PageHeader eyebrow="COMMUNITY RANKING" title="La comunidad deja huella" description="Clasificación calculada con comentarios, participación en vídeos y mensajes de los directos de SotaKun. Sin cuentas propias, bots ni puntuaciones manuales."/>
    <section className="shell -mt-8 pb-24">
      <Card className="mb-10 grid gap-5 p-5 sm:grid-cols-3 sm:p-6">
        <div className="flex items-center gap-4"><Activity className="text-[#c99b52]"/><div><p className="font-serif text-2xl text-[#dec397]">{ranking.length.toLocaleString("es-ES")}</p><p className="text-[10px] tracking-wider text-[#756a5c] uppercase">miembros analizados</p></div></div>
        <div className="flex items-center gap-4"><MessageCircle className="text-[#c99b52]"/><div><p className="font-serif text-2xl text-[#dec397]">{totalComments.toLocaleString("es-ES")}</p><p className="text-[10px] tracking-wider text-[#756a5c] uppercase">comentarios válidos</p></div></div>
        <div className="flex items-center gap-4"><Radio className="text-[#c99b52]"/><div><p className="font-serif text-2xl text-[#dec397]">{totalLiveMessages.toLocaleString("es-ES")}</p><p className="text-[10px] tracking-wider text-[#756a5c] uppercase">mensajes en directo</p></div></div>
      </Card>

      <div className="mb-9 flex flex-col gap-3 border-y border-[#6a5134]/35 px-1 py-4 text-sm text-[#827767] sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2"><RefreshCw size={14} className={state.status === "running" ? "animate-spin text-[#c99b52]" : "text-[#8e754f]"}/>Último recálculo: <strong className="text-[#cbb38a]">{formatDate(state.lastSuccessfulRunAt)}</strong></span>
        <Badge className={state.status === "failed" ? "border-[#9d4b3a]/50 bg-[#782b20]/15 text-[#d8846f]" : "border-[#72815f]/50 bg-[#4e5d3f]/10 text-[#a8ba8d]"}>{state.status === "running" ? "Calculando" : state.status === "failed" ? "Revisión necesaria" : "Actualización cada 10 min"}</Badge>
      </div>

      {topThree.length > 0 && <div className="grid gap-5 md:grid-cols-3 md:items-end">{topThree.map((entry, index) => { const style = podiumStyles[index]; const RankIcon = style.icon; return <Card className={`relative overflow-hidden p-7 ${style.border} ${style.order}`} key={entry.username}>
        <span className="absolute -right-2 -top-7 font-serif text-9xl text-[#c79a53]/[.055]">{index + 1}</span>
        <div className="relative flex items-center justify-between"><Avatar name={entry.username} className="size-16"/><RankIcon className={style.color} size={index === 0 ? 28 : 23}/></div>
        <Badge className="relative mt-6">#{index + 1} · {style.label}</Badge>
        <h2 className="relative mt-4 truncate font-serif text-2xl text-[#e0c99f]">{entry.username}</h2>
        <p className={`relative mt-3 font-serif text-4xl ${style.color}`}>{entry.points.toLocaleString("es-ES")} <span className="text-xs text-[#6e6457]">PTS</span></p>
        <div className="relative mt-5 grid grid-cols-2 gap-2 border-t border-[#5e4931]/35 pt-4 text-xs text-[#807466]"><span>{entry.comments} comentarios</span><span>{entry.live_messages} mensajes</span></div>
      </Card>; })}</div>}

      <Card className="mt-9 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#675036]/40 p-6"><h2 className="flex items-center gap-3 font-serif text-2xl text-[#ddc49a]"><Trophy className="text-[#c99b52]" size={20}/> Ranking global</h2><span className="text-[10px] tracking-widest text-[#6f6558] uppercase">Primeros 100 puestos</span></div>
        <div className="overflow-x-auto"><table className="w-full min-w-190 text-left text-sm"><thead className="bg-black/30 text-[10px] tracking-widest text-[#756a5b] uppercase"><tr><th className="px-5 py-4">Posición</th><th className="px-5 py-4">Miembro</th><th className="px-5 py-4">Puntos</th><th className="px-5 py-4" aria-label="Comentarios"><MessageCircle size={14}/></th><th className="px-5 py-4" aria-label="Mensajes en directo"><Radio size={14}/></th><th className="px-5 py-4" aria-label="Vídeos diferentes"><Video size={14}/></th></tr></thead><tbody className="divide-y divide-[#55452f]/30">{ranking.slice(0, 100).map((entry,index)=><tr className="text-[#8f8371] transition hover:bg-[#8c632d]/[.055]" key={entry.username}><td className="px-5 py-4 font-serif text-[#766957]">#{index+1}</td><td className="px-5 py-4 font-serif font-bold text-[#d8c19a]">{entry.username}</td><td className="px-5 py-4 font-serif text-lg text-[#d3a75f]">{entry.points.toLocaleString("es-ES")}</td><td className="px-5 py-4">{entry.comments}</td><td className="px-5 py-4">{entry.live_messages}</td><td className="px-5 py-4">{entry.unique_videos}</td></tr>)}</tbody></table></div>
      </Card>
      <div className="mt-6 grid gap-3 text-xs leading-6 text-[#776c5f] sm:grid-cols-4">{[["+2","Comentario válido"],["+3","Vídeo diferente"],["+0,1","Mensaje en directo"],["+1","Directo diferente"]].map(([points,label])=><div className="border border-[#644d32]/35 bg-black/20 px-4 py-3" key={label}><strong className="mr-2 font-serif text-lg text-[#c99b52]">{points}</strong>{label}</div>)}</div>
      <p className="mt-5 text-xs leading-6 text-[#6f6558]">Los vídeos con títulos iguales se conservan cuando sus identificadores son diferentes. El spam y las cuentas excluidas no deben alterar la clasificación publicada.</p>
    </section>
  </>;
}
