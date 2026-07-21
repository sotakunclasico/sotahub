import { BadgeCheck, Link2, Link2Off, ShieldCheck, Tv } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { LinkedYouTubeChannel } from "@/features/connections/youtube/youtube-link.types";

export function DashboardShell({ name, role, youtube }: { name: string; role: string; youtube: LinkedYouTubeChannel | null }) {
  return <>
    <div>
      <Badge>ÁREA PERSONAL</Badge>
      <h1 className="display-title mt-4 text-4xl text-[#e0c89e] md:text-5xl">Bienvenido, {name}</h1>
      <p className="mt-2 text-[#877b69]">Tu cuenta de Discord protege el acceso a este espacio.</p>
    </div>
    <div className="mt-9 grid gap-5 lg:grid-cols-3">
      <Card className="p-7 lg:col-span-2">
        {youtube ? <><BadgeCheck className="text-[#91a878]" size={28}/><h2 className="mt-5 font-serif text-2xl text-[#dec69d]">YouTube vinculado</h2><p className="mt-3 text-sm leading-7 text-[#8e8270]">El canal <strong className="text-[#cab286]">{youtube.title}</strong> está confirmado. La reconciliación con tu posición del ranking todavía no se realizará hasta disponer de identificadores de canal en el análisis.</p><Button href="/settings" className="mt-6"><Link2 size={16}/> Gestionar conexión</Button></> : <><Link2Off className="text-[#c59a57]" size={28}/><h2 className="mt-5 font-serif text-2xl text-[#dec69d]">Actividad de YouTube aún sin vincular</h2><p className="mt-3 text-sm leading-7 text-[#8e8270]">Discord y YouTube utilizan identidades distintas. Hasta confirmar qué canal te pertenece, no mostraremos puntos, posición, logros ni certificados inventados.</p><Button href="/settings" className="mt-6"><Tv size={16}/> Preparar vinculación</Button></>}
      </Card>
      <Card className="p-7"><ShieldCheck className="text-[#c59a57]"/><p className="eyebrow mt-5">ROL ACTUAL</p><p className="mt-3 font-serif text-3xl text-[#ddc59b]">{role}</p><p className="mt-3 text-sm leading-6 text-[#807565]">Los permisos proceden de tu identidad autenticada con Discord.</p>{role === "ADMIN" && <Button href="/admin" variant="secondary" size="sm" className="mt-6">Abrir administración</Button>}</Card>
    </div>
  </>;
}
