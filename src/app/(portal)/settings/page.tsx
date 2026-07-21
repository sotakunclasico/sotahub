import { redirect } from "next/navigation";
import { BadgeCheck, Cable, CheckCircle2, Disc3, ExternalLink, KeyRound, Link2, LockKeyhole, Tv, Unplug } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getYouTubeLinkReadiness } from "@/features/connections/youtube/youtube-link.config";
import { getLinkedYouTubeChannel } from "@/features/connections/youtube/youtube-link.service";
import { auth } from "@/lib/auth";

export const metadata = { title: "Configuración" };

const feedback: Record<string, string> = {
  linked: "Canal de YouTube vinculado correctamente.",
  disconnected: "La vinculación con YouTube se ha eliminado de este dispositivo.",
  "not-configured": "Faltan las credenciales OAuth de YouTube para activar la conexión.",
  "invalid-state": "La solicitud de vinculación ha caducado o no es válida. Inténtalo de nuevo.",
  "provider-error": "Google no pudo completar la autorización.",
  "channel-error": "No se encontró un canal de YouTube en esa cuenta.",
  "unexpected-error": "No se pudo completar la vinculación con YouTube.",
};

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ youtube?: string }> }) {
  const session = await auth();
  if (!session?.user.id) redirect("/login?callbackUrl=/settings");
  const [linkedChannel, readiness, query] = await Promise.all([
    getLinkedYouTubeChannel(session.user.id),
    Promise.resolve(getYouTubeLinkReadiness()),
    searchParams,
  ]);
  const message = query.youtube ? feedback[query.youtube] : null;

  return <>
    <div className="relative overflow-hidden border-b border-[#6f522f]/35 pb-9">
      <div className="orb -left-48 -top-48"/>
      <Badge><Cable size={12} className="mr-1"/> CENTRO DE CONEXIONES</Badge>
      <h1 className="display-title relative mt-5 text-4xl text-[#e0c89e] md:text-6xl">Tu identidad SotaKun</h1>
      <p className="relative mt-3 max-w-2xl font-serif leading-7 text-[#958875]">Discord protege el acceso. YouTube permitirá asociar tu canal con la actividad pública del ranking sin mezclar proveedores ni almacenar credenciales.</p>
    </div>

    {message && <div role="status" className="mt-6 flex items-center gap-3 border border-[#7d633d]/50 bg-[#74501e]/10 px-5 py-4 text-sm text-[#d5bc91]"><CheckCircle2 size={18} className="text-[#9caf7e]"/>{message}</div>}

    <div className="mt-8 grid gap-6 xl:grid-cols-2">
      <Card className="overflow-hidden p-7 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4"><Avatar name={session.user.name ?? "SK"} className="size-14"/><div><Badge>CUENTA PRINCIPAL</Badge><h2 className="mt-2 font-serif text-2xl text-[#dfc79d]">Discord</h2></div></div>
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#91a878] uppercase"><BadgeCheck size={17}/> Conectado</span>
        </div>
        <dl className="mt-7 divide-y divide-[#5f4c34]/35 border-y border-[#5f4c34]/35 text-sm">
          <div className="flex justify-between gap-4 py-4"><dt className="text-[#786e60]">Usuario</dt><dd className="text-[#cbb58e]">{session.user.name ?? "Usuario de Discord"}</dd></div>
          <div className="flex justify-between gap-4 py-4"><dt className="text-[#786e60]">Rol</dt><dd className="text-[#cbb58e]">{session.user.role}</dd></div>
          <div className="flex justify-between gap-4 py-4"><dt className="text-[#786e60]">Sesión</dt><dd className="text-[#9eb07f]">Activa y protegida</dd></div>
        </dl>
        <p className="mt-5 flex gap-3 text-xs leading-6 text-[#786f62]"><LockKeyhole className="mt-1 shrink-0 text-[#9d7947]" size={15}/>Discord seguirá siendo la identidad de acceso y la fuente del rol dentro de la comunidad.</p>
      </Card>

      <Card className="overflow-hidden p-7 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4"><span className="grid size-14 place-items-center border border-[#8d4938]/50 bg-[#7e261c]/15 text-[#d86e57]"><Tv size={28}/></span><div><Badge>ACTIVIDAD</Badge><h2 className="mt-2 font-serif text-2xl text-[#dfc79d]">YouTube</h2></div></div>
          <span className={`inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase ${linkedChannel ? "text-[#91a878]" : "text-[#a58c68]"}`}>{linkedChannel ? <BadgeCheck size={17}/> : <Unplug size={17}/>} {linkedChannel ? "Vinculado" : "Sin vincular"}</span>
        </div>

        {linkedChannel ? <>
          <div className="mt-7 border border-[#715738]/45 bg-black/25 p-5">
            <p className="eyebrow">CANAL CONFIRMADO</p>
            <p className="mt-3 font-serif text-2xl text-[#dfc89f]">{linkedChannel.title}</p>
            <p className="mt-1 text-sm text-[#a08d70]">{linkedChannel.handle ?? linkedChannel.channelId}</p>
            <p className="mt-4 text-xs text-[#746b5e]">Vinculado el {new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeZone: "Europe/Madrid" }).format(new Date(linkedChannel.linkedAt))}</p>
          </div>
          <p className="mt-5 text-sm leading-7 text-[#897e6d]">La propiedad del canal está confirmada. La asociación automática con el ranking se activará cuando el analizador conserve los identificadores de canal de cada participante.</p>
          <form action="/api/youtube/link/disconnect" method="post" className="mt-6"><Button type="submit" variant="secondary"><Unplug size={16}/> Desvincular YouTube</Button></form>
        </> : <>
          <p className="mt-7 text-sm leading-7 text-[#897e6d]">Autoriza únicamente la lectura de la identidad pública de tu canal. SotaHub no publica vídeos, no modifica tu cuenta y no conserva el token de Google.</p>
          <div className="mt-5 flex flex-wrap gap-2">{["Solo lectura", "OAuth con PKCE", "Sin tokens guardados"].map(item => <span className="border border-[#675034]/45 bg-black/25 px-3 py-2 text-[10px] font-bold tracking-wider text-[#a38d6c] uppercase" key={item}>{item}</span>)}</div>
          {readiness.enabled
            ? <Button href="/api/youtube/link/start" className="mt-7"><Link2 size={16}/> Vincular mi canal</Button>
            : <div className="mt-7"><Button disabled><KeyRound size={16}/> Pendiente de credenciales</Button>{session.user.role === "ADMIN" && <p className="mt-3 text-xs leading-5 text-[#766b5e]">Configuración pendiente: {readiness.missing.join(", ")}.</p>}</div>}
        </>}
      </Card>
    </div>

    <Card className="mt-6 grid gap-6 p-7 md:grid-cols-[auto_1fr_auto] md:items-center md:p-8">
      <span className="grid size-14 place-items-center border border-[#765b38]/50 bg-[#7b5627]/10 text-[#c69a55]"><Disc3 size={25}/></span>
      <div><h2 className="font-serif text-2xl text-[#dac199]">Cómo se convertirá en puntos</h2><p className="mt-2 text-sm leading-7 text-[#847969]">La vinculación no crea puntos. Solo permitirá reconocer de forma fiable qué identidad de YouTube corresponde a tu cuenta; los puntos seguirán procediendo exclusivamente de comentarios y directos analizados.</p></div>
      <Button href="/ranking" variant="secondary">Ver reglas <ExternalLink size={15}/></Button>
    </Card>
  </>;
}
