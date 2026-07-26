import Image from "next/image";
import { ArrowRight, Images, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { CollaborationGallery } from "@/features/collaboration/components/collaboration-gallery";
import { collaboration, collaborationArtwork } from "@/features/collaboration/collaboration.config";

export const metadata = {
  title: "Merch",
  description: "Diseños y piezas de la colección El legado del Rey Helado de SotaKun.",
};

export default function MerchPage() {
  return <>
    <header className="shell relative py-12 md:py-20">
      <div className="orb -right-32 top-0"/>
      <Card className="overflow-hidden">
        <div className="grid lg:grid-cols-[1.2fr_.8fr]">
          <div className="relative min-h-80 bg-black md:min-h-[560px]">
            <Image
              src="/assets/collaboration/niebla/shirt-presentation.webp"
              alt="Diseños de la camiseta El legado del Rey Helado"
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080909] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#080909]/75"/>
          </div>
          <div className="relative flex flex-col justify-center p-7 md:p-12">
            <Badge className="w-fit">{collaboration.status}</Badge>
            <p className="eyebrow mt-7">PRIMERA COLECCIÓN SOTAKUN</p>
            <h1 className="display-title mt-4 text-4xl text-gradient md:text-6xl">{collaboration.name}</h1>
            <p className="mt-6 font-serif text-base leading-8 text-[#a29580]">Explora los diseños de la camiseta, los pósteres, las pegatinas y las piezas de colección.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="#disenos">Ver diseños <Images size={16}/></Button>
              <Button href="/colaboradores#niebla" variant="secondary">Historia de la colaboración <ArrowRight size={16}/></Button>
            </div>
          </div>
        </div>
      </Card>
    </header>

    <Section
      id="disenos"
      eyebrow="ARCHIVO VISUAL"
      title="Diseños de la colección"
      description="Selecciona cualquier pieza para verla a mayor tamaño. Los diseños forman parte de una colección en preparación."
    >
      <CollaborationGallery artwork={collaborationArtwork}/>
    </Section>

    <section className="shell pb-12 md:pb-20">
      <Card className="grid gap-7 overflow-hidden p-7 md:grid-cols-[1fr_auto] md:items-center md:p-10">
        <div>
          <div className="flex items-center gap-3 text-[#c99c54]"><Sparkles/><span className="eyebrow">SOTAKUN × NIEBLA TATTOOER</span></div>
          <h2 className="mt-5 font-serif text-2xl text-[#ddc59b] md:text-3xl">Conoce la historia detrás de los diseños</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#8f826d]">El origen del dibujo, el papel de cada creador y todo el proceso creativo están documentados en la página de colaboraciones.</p>
        </div>
        <Button href="/colaboradores#niebla" variant="secondary">Ver colaboración <ArrowRight size={16}/></Button>
      </Card>
    </section>
  </>;
}
