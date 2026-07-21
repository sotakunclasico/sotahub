import Image from "next/image";
import { ArrowUpRight, Clock3, Newspaper, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { youtubeService } from "@/features/youtube/youtube.service";
import { formatCompact, formatYouTubeDate } from "@/utils/format-youtube";

export const metadata = { title: "Noticias" };
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const youtube = await youtubeService.getChannel();
  const videos = youtube.videos.slice(0, 6);
  return <>
    <PageHeader eyebrow="ACTUALIDAD OFICIAL" title="Las historias continúan" description="Publicaciones obtenidas directamente del canal de SotaKun y novedades verificables del desarrollo de la plataforma."/>
    {videos.length > 0 && <Section eyebrow="DESDE YOUTUBE" title="Últimas publicaciones" description="Sin titulares de muestra: este contenido procede de la última sincronización del canal.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{videos.map((video) => <Card className="group overflow-hidden" key={video.id}><a href={video.url} className="block"><div className="relative aspect-video overflow-hidden bg-black">{video.thumbnail && <Image src={video.thumbnail} alt="" fill unoptimized sizes="(max-width: 768px) 100vw, 33vw" className="object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-100"/>}<div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"/><span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#c59a58]/60 bg-black/65 text-[#e2bd78]"><Play size={18} fill="currentColor"/></span></div><div className="p-6"><Badge>{video.wasLive ? "DIRECTO" : "VÍDEO"}</Badge><h2 className="mt-4 line-clamp-2 font-serif text-xl text-[#ddc59b] transition group-hover:text-[#e6b96e]">{video.title}</h2><div className="mt-4 flex flex-wrap gap-4 text-xs text-[#74695b]"><span>{formatCompact(video.viewCount)} visualizaciones</span><span>{formatYouTubeDate(video.publishedAt)}</span></div></div></a></Card>)}</div>
      <Button href={`${youtube.channel.url}/videos`} variant="secondary" className="mt-7">Abrir el canal <ArrowUpRight size={15}/></Button>
    </Section>}

    <Section eyebrow="ESTADO DE SOTAHUB" title="Desarrollo transparente" description="Solo mostramos funcionalidades que existen o cuyo estado está claramente identificado.">
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="p-7"><Newspaper className="text-[#c69a55]"/><Badge className="mt-5">DISPONIBLE</Badge><h2 className="mt-4 font-serif text-2xl text-[#ddc59b]">Ranking comunitario</h2><p className="mt-3 text-sm leading-7 text-[#817666]">Consulta pública basada en el análisis real de comentarios y directos.</p></Card>
        <Card className="p-7"><Newspaper className="text-[#c69a55]"/><Badge className="mt-5">EN PREPARACIÓN</Badge><h2 className="mt-4 font-serif text-2xl text-[#ddc59b]">SotaKun × Niebla</h2><p className="mt-3 text-sm leading-7 text-[#817666]">Archivo visual integrado; producción, existencias y precio todavía no publicados.</p></Card>
        <Card className="p-7"><Clock3 className="text-[#c69a55]"/><Badge className="mt-5">SIGUIENTE FASE</Badge><h2 className="mt-4 font-serif text-2xl text-[#ddc59b]">Identidad YouTube</h2><p className="mt-3 text-sm leading-7 text-[#817666]">OAuth preparado para confirmar canales sin almacenar tokens de Google.</p></Card>
      </div>
    </Section>
  </>;
}
