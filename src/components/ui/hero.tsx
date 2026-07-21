"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Play, Radio, Users } from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";
import { siteConfig } from "@/config/site";
import type { YouTubeSnapshot } from "@/features/youtube/youtube.types";
import { formatCompact } from "@/utils/format-youtube";

export function Hero({ youtube }: { youtube: YouTubeSnapshot }) {
  const broadcast = youtube.featured.live ?? youtube.featured.latestLive ?? youtube.featured.latestVideo;
  const isLive = Boolean(youtube.featured.live);

  return (
    <section className="hero-art relative isolate min-h-[620px] overflow-hidden border-b border-[#7c5b31]/35">
      <div className="hero-grid absolute inset-0" />
      <div className="hero-vignette absolute inset-0" />
      <div className="orb left-[65%] top-20 size-[32rem]" />
      <div className="shell relative grid min-h-[580px] items-center gap-4 py-20 text-center lg:grid-cols-[1.2fr_.8fr] lg:text-left">
        <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 max-w-5xl">
          <Badge className={isLive ? "border-[#a24521]/50 bg-[#601d10]/30 text-[#e5a06d]" : "border-[#876638]/50 bg-black/30 text-[#c4a575]"}>
            {isLive ? <Radio size={11} className="mr-1 animate-pulse" /> : <Play size={11} className="mr-1" />}
            {isLive ? "SotaKun está en directo" : "Último contenido de SotaKun"}
          </Badge>
          <h1 className="display-title mt-7 text-5xl leading-[.94] text-[#d8c39e] sm:text-7xl lg:text-[5.4rem] xl:text-[6rem]">TU COMUNIDAD.<br /><span className="text-gradient">TU LEGADO.</span></h1>
          <div className="gold-divider mx-auto mt-7 w-fit lg:mx-0">✦</div>
          <p className="mx-auto mt-6 max-w-2xl font-serif text-base leading-7 text-[#b9ab94] md:text-lg lg:mx-0">El hogar oficial de SotaKun: directos, aventuras completas, historias y una comunidad que crece con cada partida.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Button href={siteConfig.social.youtubeSubscribe} size="lg">Suscríbete en YouTube <ArrowRight size={17} /></Button>
            {broadcast && <Button href={broadcast.url} variant="secondary" size="lg"><Play size={16} /> {isLive ? "Ver directo" : "Ver último vídeo"}</Button>}
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8 font-serif text-sm text-[#887b68] lg:justify-start">
            <span><strong className="mr-2 text-xl text-[#d7b678]">{formatCompact(youtube.channel.subscriberCount)}</strong> suscriptores</span>
            <span><strong className="mr-2 text-xl text-[#d7b678]">{formatCompact(youtube.channel.viewCount)}</strong> visualizaciones</span>
            <span className="flex items-center gap-2 text-[#b99a65]"><Users size={16} /> {youtube.channel.videoCount} vídeos publicados</span>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .9, delay: .15 }} className="pointer-events-none relative mx-auto hidden aspect-[3/4] w-full max-w-md lg:block" aria-hidden="true">
          <Image src="/assets/sotakun/home-emblem.png" alt="" fill priority sizes="448px" className="scale-[1.35] object-contain drop-shadow-[0_0_45px_rgba(196,137,62,.18)]" />
        </motion.div>
      </div>
    </section>
  );
}
