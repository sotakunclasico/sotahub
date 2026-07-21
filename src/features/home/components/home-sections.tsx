import { ArrowUpRight, Crown, ListVideo, Play, Radio, Sparkles, Trophy } from "lucide-react";
import Image from "next/image";
import { contentService } from "@/services/content.service";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import type { YouTubeSnapshot, YouTubeVideo } from "@/features/youtube/youtube.types";
import { formatCompact, formatDuration, formatYouTubeDate } from "@/utils/format-youtube";
import { getCurrentMilestone, getMilestoneProgress } from "@/features/giveaways/giveaways.config";

function VideoArtwork({ video }: { video: YouTubeVideo }) {
  return (
    <div className="video-frame-shell relative aspect-[3/2] overflow-hidden bg-[#080807]">
      <Image src="/assets/sotakun/video-frame.png" alt="" fill sizes="(min-width: 1024px) 48vw, (min-width: 768px) 55vw, 100vw" className="z-10 object-cover" />
      <div className="absolute inset-x-[14%] inset-y-[24%] z-20 overflow-hidden bg-black shadow-[0_0_35px_rgba(0,0,0,.9)]">
        {video.thumbnail && <Image src={video.thumbnail} alt="" fill unoptimized sizes="(min-width: 1024px) 36vw, (min-width: 768px) 44vw, 72vw" className="object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
        <span className="absolute left-1/2 top-1/2 grid size-13 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#b68a4d]/60 bg-black/60 text-[#ddb975] backdrop-blur"><Play size={20} fill="currentColor" /></span>
        {video.durationSeconds > 0 && <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-[10px] text-white">{formatDuration(video.durationSeconds)}</span>}
      </div>
    </div>
  );
}

export async function HomeSections({ youtube }: { youtube: YouTubeSnapshot }) {
  const ranking = await contentService.getRanking();
  const broadcast = youtube.featured.live ?? youtube.featured.latestLive;
  const isLive = Boolean(youtube.featured.live);
  const giveaway = getCurrentMilestone(youtube.channel.subscriberCount);
  const giveawayProgress = getMilestoneProgress(youtube.channel.subscriberCount, giveaway.subscribers);

  return <>
    {broadcast && <Section eyebrow={isLive ? "EN DIRECTO" : "ÚLTIMO DIRECTO"} title={isLive ? "Ahora en SotaKun" : "La última aventura en directo"}>
      <Card className="ornate-frame relative overflow-hidden p-0"><div className="grid md:grid-cols-[1.2fr_1fr]">
        <a href={broadcast.url} className="group block"><VideoArtwork video={broadcast} /></a>
        <div className="relative flex flex-col justify-center p-7 md:p-10"><Badge className="w-fit border-[#a84424]/40 bg-[#6d1e13]/20 text-[#e5976b]">{isLive ? <><Radio size={11} className="mr-1 animate-pulse" /> EN DIRECTO</> : "DIRECTO ARCHIVADO"}</Badge><h3 className="mt-5 font-serif text-2xl text-[#e1c99e] md:text-3xl">{broadcast.title}</h3><p className="mt-3 text-sm text-[#8e8270]">{isLive ? `${formatCompact(broadcast.concurrentViewers)} espectadores ahora` : `${formatCompact(broadcast.viewCount)} visualizaciones · ${formatYouTubeDate(broadcast.publishedAt)}`}</p><Button href={broadcast.url} className="mt-6 w-fit">{isLive ? "Entrar al directo" : "Ver la retransmisión"} <ArrowUpRight size={16} /></Button></div>
      </div></Card>
    </Section>}

    <Section eyebrow="VÍDEOS OFICIALES" title="Últimas publicaciones" description="El contenido más reciente publicado en el canal oficial de SotaKun."><div className="grid gap-5 md:grid-cols-3">{youtube.videos.slice(0, 6).map(video => <Card className="group overflow-hidden" key={video.id}><a href={video.url} className="block"><VideoArtwork video={video} /><div className="p-5"><span className="eyebrow">{video.wasLive ? "DIRECTO" : "VÍDEO"}</span><h3 className="mt-3 line-clamp-2 font-serif text-xl text-[#d9c39e] transition group-hover:text-[#e5b96e]">{video.title}</h3><p className="mt-4 text-xs text-[#716759]">{formatCompact(video.viewCount)} visualizaciones · {formatYouTubeDate(video.publishedAt)}</p></div></a></Card>)}</div><Button href={youtube.channel.url + "/videos"} variant="secondary" className="mt-7">Ver todos los vídeos <ArrowUpRight size={15} /></Button></Section>

    {youtube.playlists.length > 0 && <Section eyebrow="LISTAS DE REPRODUCCIÓN" title="Elige tu próxima aventura" description="Series, gameplays y viajes completos organizados directamente desde el canal."><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{youtube.playlists.slice(0, 8).map(playlist => <Card className="group overflow-hidden" key={playlist.id}><a href={playlist.url} className="block"><div className="relative aspect-video overflow-hidden bg-[#0b0907]">{playlist.thumbnail && <Image src={playlist.thumbnail} alt="" fill unoptimized sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover opacity-65 transition duration-500 group-hover:scale-105 group-hover:opacity-85" />}<div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"/><span className="absolute bottom-3 right-3 flex items-center gap-1 rounded border border-white/10 bg-black/80 px-2 py-1 text-[10px] text-white"><ListVideo size={12} /> {playlist.itemCount} {playlist.itemCount === 1 ? "vídeo" : "vídeos"}</span></div><div className="p-5"><h3 className="line-clamp-2 min-h-12 font-serif text-lg text-[#d9c39e] transition group-hover:text-[#e5b96e]">{playlist.title}</h3><span className="mt-4 inline-flex items-center gap-1 text-xs text-[#b88b4e]">Ver lista <ArrowUpRight size={13} /></span></div></a></Card>)}</div></Section>}

    <Section eyebrow="CLASIFICACIÓN" title="Los nombres en lo más alto"><div className="grid gap-5 md:grid-cols-3">{ranking.map(entry=><Card className={`relative p-6 ${entry.position===1?"md:-translate-y-3 border-[#c6984f]/70":""}`} key={entry.name}><span className="absolute right-5 top-4 font-serif text-5xl text-[#b88a43]/10">0{entry.position}</span><div className="flex items-center gap-5"><Avatar name={entry.name} className="size-16"/><div className="min-w-0"><p className="truncate font-serif font-bold text-[#ddc69e]">{entry.name}</p><Badge variant="role" className="mt-2">{entry.badge}</Badge></div></div><div className="mt-7 flex items-end justify-between"><div><p className="font-serif text-3xl text-[#d5ad66]">{entry.points.toLocaleString("es-ES")}</p><p className="text-xs text-[#635a4d]">puntos de comunidad</p></div>{entry.position===1?<Crown className="text-[#d6aa60]"/>:<Trophy className="text-[#78684f]"/>}</div></Card>)}</div><Button href="/ranking" variant="secondary" className="mt-7">Ver ranking completo</Button></Section>

    <Section eyebrow="EL CAMINO A LOS 1000" title={`Próximo hito: ${giveaway.subscribers} suscriptores`}><Card className="ornate-frame overflow-hidden"><div className="grid md:grid-cols-2"><div className="giveaway-art min-h-80"/><div className="flex flex-col justify-center p-8 md:p-12"><Badge className="w-fit"><Sparkles size={11} className="mr-1"/> SORTEO DE COMUNIDAD</Badge><h3 className="mt-5 font-serif text-3xl text-[#dfc69b]">{giveaway.prize}</h3><p className="mt-3 font-serif leading-7 text-[#8d806d]">La participación real suma puntos y aumenta tus posibilidades. No premiamos el spam: premiamos estar, aportar y compartir el camino.</p><div className="mt-6"><div className="flex justify-between text-xs text-[#aa9676]"><span>{youtube.channel.subscriberCount} suscriptores</span><span>{giveaway.subscribers}</span></div><div className="mt-2 h-2 overflow-hidden border border-[#79572f]/60 bg-black"><div className="h-full bg-gradient-to-r from-[#85501d] to-[#e0ac55]" style={{width:`${giveawayProgress}%`}}/></div></div><Button href="/sorteos" className="mt-7 w-fit">Cómo participar</Button></div></div></Card></Section>

  </>;
}
