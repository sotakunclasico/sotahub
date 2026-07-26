import Image from "next/image";
import { ArrowRight, BadgeCheck, ExternalLink, Handshake, HeartHandshake, Lightbulb, Palette, Sparkles, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { CollaborationApplicationForm } from "@/features/collaboration/components/collaboration-application-form";
import { collaboration } from "@/features/collaboration/collaboration.config";
import { isCollaborationEmailConfigured } from "@/features/collaboration/services/collaboration-email.service";

export const metadata = {
  title: "Colaboraciones",
  description: "Descubre las colaboraciones oficiales de SotaKun o presenta una nueva propuesta creativa.",
};

export const dynamic = "force-dynamic";

const profiles = [
  { title: "Artistas y tattooers", description: "Ilustración, tinta, diseño, artesanía o cualquier disciplina con una voz visual propia." },
  { title: "Marcas y talleres", description: "Productos o procesos reales que puedan convertirse en una colaboración honesta y bien construida." },
  { title: "Creadores y comunidades", description: "Vídeos, eventos, juegos, retos o experiencias capaces de unir a dos comunidades." },
  { title: "Ideas inesperadas", description: "Si no encaja en una categoría pero tiene historia, identidad y sentido, también queremos conocerla." },
] as const;

const principles = [
  "Autoría visible y reconocimiento claro del trabajo de cada parte.",
  "Propuestas pensadas para aportar valor, no solo para colocar un logotipo.",
  "Comunicación transparente sobre alcance, tiempos y responsabilidades.",
  "Nada se anuncia ni se vende hasta que ambas partes lo aprueban.",
] as const;

export default function CollaborationsPage() {
  const configured = isCollaborationEmailConfigured();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return <>
    <PageHeader
      eyebrow="HISTORIAS CREADAS JUNTOS"
      title="Colaboraciones"
      description="Proyectos donde dos identidades se encuentran para crear algo propio. Aquí documentamos las obras, las personas y el proceso detrás de cada colaboración de SotaKun."
    />

    <Section
      id="niebla"
      eyebrow="PRIMERA COLABORACIÓN"
      title={collaboration.partners}
      description={collaboration.origin}
    >
      <Card className="overflow-hidden">
        <div className="grid lg:grid-cols-[1.1fr_.9fr]">
          <div className="relative min-h-80 bg-black md:min-h-[540px]">
            <Image
              src="/assets/collaboration/niebla/original-sketch.webp"
              alt="Boceto original de El legado del Rey Helado realizado por Niebla Tattooer"
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080909] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#080909]/65"/>
          </div>
          <div className="flex flex-col justify-center p-7 md:p-10">
            <p className="eyebrow">{collaboration.name}</p>
            <h2 className="mt-5 font-serif text-3xl text-[#e0c89e] md:text-4xl">Una obra nacida en papel</h2>
            <p className="mt-5 text-sm leading-7 text-[#948773]">{collaboration.summary}</p>
            <p className="mt-4 text-sm leading-7 text-[#817664]">El objetivo fue conservar el carácter artesanal del dibujo y convertirlo en una identidad completa para la comunidad: una obra que pudiera vivir fuera de la pantalla sin perder la firma de quien la creó.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/merch">Ver los diseños <ArrowRight size={16}/></Button>
              <Button href="#proceso" variant="secondary">Conocer el proceso</Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {collaboration.partnersDetail.map((partner, index) => <Card className="p-7 md:p-9" key={partner.name}>
          <div className="flex items-center gap-3 text-[#c99c54]">{index === 0 ? <Palette/> : <Sparkles/>}<span className="eyebrow">{partner.role}</span></div>
          <h2 className="mt-6 font-serif text-3xl text-[#dec69b]">{partner.name}</h2>
          <p className="mt-4 text-sm leading-7 text-[#918570]">{partner.description}</p>
          {index === 0 && <a className="mt-6 inline-flex items-center gap-2 text-sm text-[#cca35f] transition hover:text-[#efd08f]" href="https://www.instagram.com/niebla_tattooer/" target="_blank" rel="noreferrer">{collaboration.artistHandle}<ExternalLink size={14}/></a>}
        </Card>)}
      </div>
    </Section>

    <Section
      id="proceso"
      eyebrow="DEL BOCETO A LA COLECCIÓN"
      title="El proceso creativo"
      description="La colaboración conserva el recorrido de la obra para reconocer su origen, entender su evolución y acreditar la autoría de cada pieza."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {collaboration.process.map((step, index) => <Card className="p-6" key={step.title}>
          <span className="font-serif text-4xl text-[#7c5a30]">0{index + 1}</span>
          <h3 className="mt-5 font-serif text-xl text-[#d9c095]">{step.title}</h3>
          <p className="mt-3 text-sm leading-6 text-[#877b69]">{step.description}</p>
        </Card>)}
      </div>
    </Section>

    <Section eyebrow="COLABORA CON SOTAKUN" title="Una buena colaboración empieza por el encaje" description="Buscamos personas, proyectos y marcas con algo auténtico que contar. Nos interesan las ideas que respetan la identidad de ambas partes y pueden construirse con tiempo, criterio y una autoría clara.">
      <div className="grid gap-4 sm:grid-cols-2">
        {profiles.map((profile, index) => <Card className="p-6 md:p-8" key={profile.title}>
          <div className="flex items-center gap-3 text-[#c99c54]">{index === 0 ? <Lightbulb/> : index === 1 ? <Handshake/> : index === 2 ? <UsersRound/> : <HeartHandshake/>}<span className="eyebrow">0{index + 1}</span></div>
          <h2 className="mt-6 font-serif text-2xl text-[#dec69b]">{profile.title}</h2>
          <p className="mt-3 text-sm leading-7 text-[#8f826e]">{profile.description}</p>
        </Card>)}
      </div>
    </Section>

    <Section eyebrow="FORMA DE TRABAJAR" title="Qué puedes esperar" description="Cada propuesta se valora por su historia, su viabilidad y lo que puede aportar a la comunidad. No es un formulario para patrocinios automáticos.">
      <Card className="p-7 md:p-9">
        <h2 className="font-serif text-2xl text-[#ddc59b]">Principios de colaboración</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">{principles.map((principle) => <li className="flex gap-3 text-sm leading-7 text-[#958773]" key={principle}><BadgeCheck className="mt-1 shrink-0 text-[#9bab7f]" size={17}/>{principle}</li>)}</ul>
      </Card>
    </Section>

    <Section id="propuesta" eyebrow="PRESENTA TU IDEA" title="Cuéntanos qué quieres crear" description="Explica quién eres, qué propones y por qué crees que encaja con SotaKun. Cuanto más concreta sea la idea, mejor podremos valorarla.">
      <Card className="p-6 md:p-10">
        <CollaborationApplicationForm configured={configured} turnstileSiteKey={turnstileSiteKey}/>
      </Card>
    </Section>
  </>;
}
