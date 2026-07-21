import { BadgeCheck, MessageCircle, Radio, ShieldCheck, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { getCommunityRanking, getCommunityRankingState } from "@/features/ranking/services/community-ranking";
import { youtubeService } from "@/features/youtube/youtube.service";
import { formatCompact } from "@/utils/format-youtube";

export const metadata = { title: "Comunidad" };
export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const [youtube, ranking, state] = await Promise.all([youtubeService.getChannel(), getCommunityRanking(), getCommunityRankingState()]);
  const activeInLives = ranking.filter((entry) => entry.unique_lives > 0).length;
  const activeInVideos = ranking.filter((entry) => entry.unique_videos > 0).length;

  return <>
    <PageHeader eyebrow="COMUNIDAD SOTAKUN" title="Aquí empieza todo" description="Un espacio construido alrededor de vídeos, directos y personas que aportan de verdad. Las cifras de esta página proceden del canal y del ranking procesado."/>
    <section className="shell -mt-8 pb-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [Users, formatCompact(youtube.channel.subscriberCount), "suscriptores del canal"],
          [Trophy, ranking.length.toLocaleString("es-ES"), "miembros con actividad"],
          [MessageCircle, activeInVideos.toLocaleString("es-ES"), "participantes en vídeos"],
          [Radio, activeInLives.toLocaleString("es-ES"), "participantes en directos"],
        ].map(([Icon, value, label]) => { const MetricIcon = Icon as typeof Users; return <Card className="p-6" key={label as string}><MetricIcon className="text-[#c89b53]" size={21}/><p className="mt-5 font-serif text-4xl text-[#e0c494]">{value as string}</p><p className="mt-2 text-xs tracking-wider text-[#756a5c] uppercase">{label as string}</p></Card>; })}
      </div>
      <div className="mt-4 flex items-center gap-3 text-xs text-[#756b5d]"><BadgeCheck size={15} className="text-[#8fa273]"/>Datos del ranking: {state.lastSuccessfulRunAt ? new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeZone: "Europe/Madrid" }).format(new Date(state.lastSuccessfulRunAt)) : "primer cálculo pendiente"}.</div>
    </section>

    <Section eyebrow="CÓMO FORMAR PARTE" title="Presencia antes que ruido" description="No necesitas competir para pertenecer. El ranking existe para reconocer la constancia, no para convertir la conversación en spam.">
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="p-7"><MessageCircle className="text-[#c89b53]"/><h2 className="mt-6 font-serif text-2xl text-[#ddc49a]">Comenta con intención</h2><p className="mt-3 text-sm leading-7 text-[#857a69]">Comparte una idea, una pregunta o una experiencia relacionada con el vídeo.</p></Card>
        <Card className="p-7"><Radio className="text-[#c89b53]"/><h2 className="mt-6 font-serif text-2xl text-[#ddc49a]">Acompaña los directos</h2><p className="mt-3 text-sm leading-7 text-[#857a69]">Cada directo diferente reconoce tu presencia; repetir mensajes no añade valor.</p></Card>
        <Card className="p-7"><ShieldCheck className="text-[#c89b53]"/><h2 className="mt-6 font-serif text-2xl text-[#ddc49a]">Identidad protegida</h2><p className="mt-3 text-sm leading-7 text-[#857a69]">Discord controla el acceso y YouTube podrá confirmar tu identidad pública sin compartir contraseñas.</p></Card>
      </div>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Button href="/ranking">Explorar el ranking</Button><Button href="/settings" variant="secondary">Gestionar conexiones</Button></div>
    </Section>
  </>;
}
