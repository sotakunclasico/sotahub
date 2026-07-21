import { Compass, Home, Trophy } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return <main id="main-content" className="relative grid min-h-screen place-items-center overflow-hidden p-5">
    <div className="orb left-1/2 top-1/3 -translate-x-1/2"/>
    <Card className="ornate-frame relative w-full max-w-2xl p-8 text-center md:p-12">
      <div className="mx-auto w-fit"><Logo/></div>
      <Compass className="mx-auto mt-10 text-[#c99b52]" size={34}/>
      <span className="eyebrow mt-5 block">ERROR 404</span>
      <h1 className="display-title mt-4 text-4xl text-[#e0c89e] md:text-6xl">Este camino no existe</h1>
      <p className="mx-auto mt-5 max-w-lg font-serif leading-7 text-[#8e8270]">La página ha cambiado de lugar, permanece oculta o todavía no forma parte del mundo de SotaKun.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button href="/"><Home size={16}/> Volver al inicio</Button><Button href="/ranking" variant="secondary"><Trophy size={16}/> Abrir el ranking</Button></div>
    </Card>
  </main>;
}
