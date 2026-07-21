"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import type { CollaborationArtwork } from "../collaboration.config";

export function CollaborationGallery({ artwork }: { artwork: readonly CollaborationArtwork[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = selectedIndex === null ? null : artwork[selectedIndex];

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedIndex(null);
      if (event.key === "ArrowLeft") setSelectedIndex((selectedIndex - 1 + artwork.length) % artwork.length);
      if (event.key === "ArrowRight") setSelectedIndex((selectedIndex + 1) % artwork.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [artwork.length, selectedIndex]);

  const move = (direction: -1 | 1) => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + direction + artwork.length) % artwork.length);
  };

  return <>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {artwork.map((item, index) => <button
        type="button"
        key={item.src}
        onClick={() => setSelectedIndex(index)}
        className={`group relative overflow-hidden border border-[#72532e]/50 bg-black/50 text-left transition duration-300 hover:-translate-y-1 hover:border-[#c3934e]/80 hover:shadow-[0_14px_50px_rgba(157,99,30,.16)] ${index === 0 ? "sm:col-span-2 lg:col-span-2" : ""}`}
        aria-label={`Ampliar ${item.title}`}
      >
        <div className={`relative overflow-hidden ${item.aspect === "portrait" ? "aspect-[3/4]" : item.aspect === "square" ? "aspect-square" : "aspect-[16/10]"}`}>
          <Image src={item.src} alt={item.alt} fill sizes={index === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"} className="object-cover transition duration-700 group-hover:scale-[1.03]"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent"/>
          <Maximize2 className="absolute right-4 top-4 text-[#dbc28f] opacity-0 transition group-hover:opacity-100" size={19}/>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="font-serif text-lg text-[#e0c89e]">{item.title}</h3>
          <p className="mt-1 text-xs leading-5 text-[#92836e]">{item.description}</p>
        </div>
      </button>)}
    </div>

    {selected && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 backdrop-blur-xl md:p-8" role="dialog" aria-modal="true" aria-label={selected.title} onMouseDown={() => setSelectedIndex(null)}>
      <button type="button" onClick={() => setSelectedIndex(null)} className="absolute right-4 top-4 z-10 grid size-11 place-items-center border border-[#8a673a]/60 bg-black/70 text-[#dfc89e] transition hover:border-[#d0a35e] hover:text-white" aria-label="Cerrar galería"><X size={22}/></button>
      <button type="button" onClick={(event) => { event.stopPropagation(); move(-1); }} className="absolute left-3 z-10 grid size-11 place-items-center border border-[#8a673a]/60 bg-black/70 text-[#dfc89e] transition hover:border-[#d0a35e] md:left-8" aria-label="Imagen anterior"><ChevronLeft/></button>
      <div className="relative h-[82vh] w-[min(90vw,1200px)]" onMouseDown={(event) => event.stopPropagation()}>
        <Image src={selected.src} alt={selected.alt} fill sizes="90vw" className="object-contain" priority/>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent px-6 pb-5 pt-16 text-center">
          <p className="font-serif text-2xl text-[#e4cda3]">{selected.title}</p>
          <p className="mt-1 text-sm text-[#9f907a]">{selected.description}</p>
        </div>
      </div>
      <button type="button" onClick={(event) => { event.stopPropagation(); move(1); }} className="absolute right-3 z-10 grid size-11 place-items-center border border-[#8a673a]/60 bg-black/70 text-[#dfc89e] transition hover:border-[#d0a35e] md:right-8" aria-label="Imagen siguiente"><ChevronRight/></button>
    </div>}
  </>;
}
