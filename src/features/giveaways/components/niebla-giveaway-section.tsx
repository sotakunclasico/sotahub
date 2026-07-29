import { CalendarClock, Check, CircleHelp, Gift, MapPin, Radio, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import {
  getNieblaDrawDaysRemaining,
  getNieblaGiveawayStatus,
  nieblaGiveaway,
  nieblaGiveawayFaq,
  nieblaPrizeArtwork,
} from "../niebla-giveaway.config";

export function NieblaGiveawaySection() {
  const remainingDays = getNieblaDrawDaysRemaining();
  const status = getNieblaGiveawayStatus();

  return <>
    <Section
      eyebrow="SORTEO ESPECIAL · COLABORACIÓN"
      title="SotaKun × Niebla Tattooer"
      description="Un sorteo independiente de los hitos habituales. El ganador elegirá entre el pack físico de colección o una sesión con Niebla Tattooer."
    >
      <Card className="ornate-frame overflow-hidden">
        <div className="grid lg:grid-cols-[1.15fr_.85fr]">
          <div className="relative min-h-96 overflow-hidden bg-black">
            <Image
              src="/assets/collaboration/niebla/shirt-presentation.webp"
              alt="Sorteo especial SotaKun y Niebla Tattooer"
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/15 lg:to-black"/>
            <Badge className="absolute left-5 top-5"><Sparkles size={12}/> {status === "open" ? "PARTICIPACIÓN ABIERTA" : status === "upcoming" ? "SORTEO PRÓXIMO" : "PARTICIPACIÓN CERRADA"}</Badge>
          </div>
          <div className="flex flex-col justify-center p-7 text-center md:p-10 lg:text-left">
            <span className="eyebrow">EXTRACCIÓN EN DIRECTO</span>
            <p className="mt-3 font-serif text-4xl text-[#e2c89b]">15 de agosto de 2026</p>
            <p className="mt-3 text-sm leading-7 text-[#8d806d]">El censo se cerrará el 15 de agosto a las 21:30 y la extracción comenzará a las 22:00, hora de Madrid. El enlace al directo se añadirá cuando esté programado.</p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="border border-[#725532]/50 bg-black/35 p-4 text-center">
                <p className="font-serif text-4xl text-[#d7ad68]">{remainingDays}</p>
                <p className="mt-1 text-[10px] tracking-widest text-[#756957] uppercase">días hasta el cierre</p>
              </div>
              <div className="border border-[#725532]/50 bg-black/35 p-4 text-center">
                <p className="font-serif text-4xl text-[#d7ad68]">&gt;5</p>
                <p className="mt-1 text-[10px] tracking-widest text-[#756957] uppercase">puntos mínimos</p>
              </div>
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href="/sorteos/niebla-tattooer">Ver bases completas</Button>
              <Button href="/ranking" variant="secondary">Consultar mis puntos</Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <Card className="p-7 text-left">
          <Badge>OPCIÓN A</Badge>
          <Gift className="mt-6 text-[#c89a52]" size={27}/>
          <h3 className="mt-4 font-serif text-3xl text-[#dfc69b]">Pack de merchandising</h3>
          <ul className="mt-5 space-y-3">
            {nieblaGiveaway.pack.map((item) => <li className="flex gap-3 text-sm leading-6 text-[#948673]" key={item}><Check className="mt-1 shrink-0 text-[#9dac78]" size={15}/>{item}</li>)}
          </ul>
          <p className="mt-5 border-t border-[#665037]/40 pt-5 text-xs leading-6 text-[#756a5b]">El pack incluye cuatro pegatinas, dos pósteres y las dos cartas oficiales de autor.</p>
        </Card>
        <Card className="p-7 text-left">
          <Badge>OPCIÓN B</Badge>
          <Sparkles className="mt-6 text-[#c89a52]" size={27}/>
          <h3 className="mt-4 font-serif text-3xl text-[#dfc69b]">Sesión con Niebla Tattooer</h3>
          <p className="mt-5 text-sm leading-7 text-[#948673]">Una sesión gratuita para tatuarse el diseño promocionado, sujeta a la agenda, valoración profesional, condiciones sanitarias y consentimiento informado.</p>
          <div className="mt-5 space-y-3 text-sm text-[#817565]">
            <p className="flex gap-3"><MapPin className="mt-1 shrink-0 text-[#aa8049]" size={15}/>{nieblaGiveaway.studioAddress}.</p>
            <p className="flex gap-3"><CalendarClock className="mt-1 shrink-0 text-[#aa8049]" size={15}/>Tamaño, zona corporal, retoques y plazos se acordarán directamente con el tatuador.</p>
          </div>
          <p className="mt-5 border-t border-[#665037]/40 pt-5 text-xs leading-6 text-[#756a5b]">Viaje, alojamiento y desplazamientos no incluidos. Si el ganador no puede desplazarse, podrá escoger el pack físico.</p>
        </Card>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {nieblaPrizeArtwork.map((artwork) => <Card className="overflow-hidden text-left" key={artwork.title}>
          <div className="relative aspect-[4/3] overflow-hidden bg-black">
            <Image src={artwork.src} alt={artwork.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover"/>
          </div>
          <div className="p-5">
            <h3 className="font-serif text-xl text-[#dbc198]">{artwork.title}</h3>
            <p className="mt-2 text-xs leading-6 text-[#7d7263]">{artwork.description}</p>
          </div>
        </Card>)}
      </div>

      <Card className="mt-7 p-6 md:p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Trophy className="text-[#c99b52]"/>
          <div><span className="eyebrow">PARTICIPACIONES PONDERADAS</span><h3 className="mt-3 font-serif text-3xl text-[#dec59b]">Más puntos, más posibilidades</h3></div>
        </div>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-7 text-[#887c6b]">Debes superar los 5 puntos. Cada bloque completo de 5 puntos genera una participación en la extracción, sin un máximo configurado actualmente.</p>
        <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-3">
          {[["6 puntos","1 participación"],["15 puntos","3 participaciones"],["50 puntos","10 participaciones"]].map(([points, entries]) => <div className="border border-[#725532]/45 bg-black/25 p-4 text-center" key={points}><p className="font-serif text-xl text-[#d8bd91]">{points}</p><p className="mt-1 text-xs text-[#8b7d68]">{entries}</p></div>)}
        </div>
        <div className="mx-auto mt-6 flex max-w-3xl gap-3 border border-[#765635]/40 bg-[#6c3d1f]/10 p-4 text-left text-xs leading-6 text-[#8e806d]"><ShieldCheck className="mt-1 shrink-0 text-[#c69a53]" size={18}/><p>Una persona y una identidad. Las cuentas duplicadas, bots, spam o actividad artificial pueden excluirse. El censo se cerrará antes de la extracción y solo podrá corregirse por fraude o error acreditado.</p></div>
      </Card>

      <div className="mt-7">
        <div className="mb-5 flex items-center justify-center gap-3"><CircleHelp className="text-[#c69a53]" size={20}/><h3 className="font-serif text-3xl text-[#dec59b]">Preguntas frecuentes</h3></div>
        <div className="mx-auto max-w-4xl space-y-3 text-left">
          {nieblaGiveawayFaq.map((item) => <details className="group border border-[#665038]/45 bg-black/25 px-5 py-4" key={item.question}>
            <summary className="cursor-pointer list-none font-serif text-lg text-[#ceb48a]">{item.question}</summary>
            <p className="mt-3 border-t border-[#604b34]/35 pt-3 text-sm leading-7 text-[#817666]">{item.answer}</p>
          </details>)}
        </div>
      </div>

      <div className="mx-auto mt-7 max-w-4xl border border-[#8b6237]/45 bg-[#7a481e]/10 p-5 text-center text-sm leading-7 text-[#938570]">
        <Radio className="mx-auto mb-3 text-[#c99b52]" size={20}/>
        Participación gratuita. SotaKun organiza el sorteo con la colaboración de Niebla Tattooer. YouTube, Discord y las demás plataformas no patrocinan, avalan ni administran esta promoción.
      </div>
    </Section>
  </>;
}
