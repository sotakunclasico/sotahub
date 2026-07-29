import { AlertTriangle, CalendarClock, Check, ExternalLink, Gift, LockKeyhole, Scale, ShieldCheck, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { getNieblaGiveawayStatus, nieblaGiveaway } from "@/features/giveaways/niebla-giveaway.config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bases · Sorteo SotaKun × Niebla Tattooer",
  description: "Condiciones del sorteo especial SotaKun × Niebla Tattooer previsto para el 15 de agosto de 2026.",
};

const participationExamples = [
  ["6 puntos", "1 participación"],
  ["15 puntos", "3 participaciones"],
  ["50 puntos", "10 participaciones"],
] as const;

export default function NieblaGiveawayRulesPage() {
  const status = getNieblaGiveawayStatus();

  return <>
    <PageHeader
      eyebrow={`BASES DEL SORTEO · PARTICIPACIÓN ${status === "open" ? "ABIERTA" : "CERRADA"}`}
      title="SotaKun × Niebla Tattooer"
      description="Condiciones vigentes del sorteo especial. El censo cierra el 15 de agosto de 2026 a las 21:30 y la extracción comienza a las 22:00, hora de Madrid."
    />

    <section className="shell -mt-8 pb-8">
      <Card className="border-[#71824f]/60 bg-[#456027]/10 p-6 text-center md:p-8">
        <ShieldCheck className="mx-auto text-[#a7bd78]" size={27}/>
        <Badge className="mt-4">{status === "open" ? "PARTICIPACIÓN ABIERTA" : "PARTICIPACIÓN CERRADA"}</Badge>
        <h2 className="mt-4 font-serif text-2xl text-[#dec397]">Censo abierto hasta el comienzo del sorteo</h2>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-[#8f816d]">El censo se cerrará el 15 de agosto de 2026 a las 21:30, hora de Madrid. Durante los siguientes 30 minutos se congelará el ranking, se revisarán duplicados y se calculará el número definitivo de participaciones. La extracción comenzará a las 22:00.</p>
      </Card>
    </section>

    <Section eyebrow="01 · IDENTIFICACIÓN" title="Datos principales">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          [CalendarClock, "Cierre y extracción", "21:30 / 22:00", "15 de agosto · hora de Madrid"],
          [Users, "Organización", nieblaGiveaway.organizer, `${nieblaGiveaway.legalOrganizer} · Colabora ${nieblaGiveaway.collaborator}`],
          [Trophy, "Selección", `${nieblaGiveaway.winners} ganador`, `${nieblaGiveaway.alternateWinners} suplentes en el mismo sorteo`],
          [Scale, "Estado", status === "open" ? "Abierto" : "Cerrado", status === "open" ? "Participaciones activas" : "Censo cerrado"],
        ].map(([Icon, label, value, detail]) => {
          const ItemIcon = Icon as typeof CalendarClock;
          return <Card className="p-6 text-center" key={label as string}>
            <ItemIcon className="mx-auto text-[#c99b52]" size={22}/>
            <span className="eyebrow mt-4 block">{label as string}</span>
            <p className="mt-2 font-serif text-2xl text-[#ddc397]">{value as string}</p>
            <p className="mt-2 text-xs leading-5 text-[#766b5c]">{detail as string}</p>
          </Card>;
        })}
      </div>
      <p className="mx-auto mt-6 max-w-4xl text-center text-sm leading-7 text-[#827666]">Participación gratuita. YouTube, Discord y otras plataformas no patrocinan, avalan ni administran este sorteo y quedan desvinculadas de su organización.</p>
    </Section>

    <Section eyebrow="02 · PREMIO" title="Una elección, no dos" description="El ganador escogerá el pack de merchandising o la sesión con Niebla Tattooer. Las opciones no son acumulables.">
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-7 text-left">
          <Gift className="text-[#c99b52]"/>
          <h2 className="mt-5 font-serif text-3xl text-[#dec397]">Opción A · Pack físico</h2>
          <ul className="mt-5 space-y-3">
            {nieblaGiveaway.pack.map((item) => <li className="flex gap-3 text-sm leading-6 text-[#8f826f]" key={item}><Check className="mt-1 shrink-0 text-[#9cac78]" size={15}/>{item}</li>)}
          </ul>
          <p className="mt-5 border-t border-[#634d35]/40 pt-5 text-xs leading-6 text-[#746959]">Incluye las cartas oficiales de SotaKun y Niebla Tattooer. Todas las tallas están disponibles y el ganador elegirá la suya después del sorteo hablando con el administrador. SotaKun pagará el envío ordinario; los impuestos, aranceles o tasas de importación que pudieran exigir las autoridades del país de destino corresponderán al ganador.</p>
        </Card>
        <Card className="p-7 text-left">
          <ShieldCheck className="text-[#c99b52]"/>
          <h2 className="mt-5 font-serif text-3xl text-[#dec397]">Opción B · Tatuaje</h2>
          <p className="mt-5 text-sm leading-7 text-[#8f826f]">Sesión gratuita para tatuarse el diseño promocionado. Estará sujeta a agenda, valoración profesional, requisitos médicos, condiciones sanitarias y consentimiento informado.</p>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-[#807465]">
            <li>Viaje, alojamiento y desplazamientos no incluidos.</li>
            <li>Si no resulta seguro realizar el tatuaje, el profesional podrá rechazar la sesión.</li>
            <li>El ganador podrá escoger el pack físico si no puede desplazarse.</li>
          </ul>
          <p className="mt-5 border-t border-[#634d35]/40 pt-5 text-xs leading-6 text-[#746959]">Solo disponible para mayores de 18 años. El estudio y su ubicación se añadirán cuando estén confirmados. Tamaño, zona corporal, retoques, disponibilidad y plazos se tratarán directamente con Niebla Tattooer.</p>
        </Card>
      </div>
      <p className="mx-auto mt-6 max-w-4xl text-center text-xs leading-6 text-[#716657]">El premio no puede canjearse por dinero. Las imágenes son orientativas y pueden existir pequeñas variaciones físicas. Solo podrá sustituirse un elemento por otro de valor equivalente cuando resulte necesario.</p>
    </Section>

    <Section eyebrow="03 · PARTICIPACIÓN" title="Regla utilizada en la extracción">
      <Card className="mx-auto max-w-4xl p-7 text-center md:p-9">
        <p className="font-serif text-xl leading-8 text-[#a6977e]">Para entrar en el censo debes aparecer en el ranking y tener <strong className="text-[#e0bd7c]">más de 5 puntos</strong> antes del cierre. Cinco puntos exactos no bastan; 5,1 puntos sí permiten participar. No es obligatorio estar suscrito al canal ni pertenecer al Discord.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {participationExamples.map(([points, entries]) => <div className="border border-[#705432]/45 bg-black/25 p-4" key={points}><p className="font-serif text-xl text-[#d8bd91]">{points}</p><p className="mt-1 text-xs text-[#887b68]">{entries}</p></div>)}
        </div>
        <p className="mt-6 text-sm leading-7 text-[#827666]">Cada bloque completo de 5 puntos genera una participación. Actualmente no existe un máximo configurado. Perder puntos o eliminar comentarios antes del cierre puede afectar a la elegibilidad.</p>
      </Card>
      <div className="mx-auto mt-5 grid max-w-4xl gap-4 md:grid-cols-2">
        <Card className="p-6 text-left"><h3 className="font-serif text-xl text-[#d8bd91]">Territorio</h3><p className="mt-3 text-sm leading-7 text-[#817565]">Pueden participar residentes de Europa y Latinoamérica. La disponibilidad efectiva del envío dependerá de que el transportista pueda operar legalmente en el país de destino.</p></Card>
        <Card className="p-6 text-left"><h3 className="font-serif text-xl text-[#d8bd91]">Actividad prohibida</h3><p className="mt-3 text-sm leading-7 text-[#817565]">Cuentas duplicadas, bots, spam, suplantación o manipulación artificial de visitas, suscripciones, comentarios o «Me gusta». Solo quedan excluidos los creadores SotaKun y Niebla.</p></Card>
      </div>
    </Section>

    <Section eyebrow="04 · EXTRACCIÓN" title="Selección verificable">
      <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
        {[
          "El censo se cerrará a las 21:30 y el ranking quedará congelado para la extracción.",
          "La extracción se realizará con la herramienta aleatoria ponderada de SotaHub.",
          "Se publicará el número de usuarios elegibles y de participaciones.",
          "Se elegirán un ganador y tres suplentes distintos, ordenados en la misma extracción.",
          "Se comprobarán identidad, puntos y cumplimiento de los requisitos.",
          "El ganador dispondrá de 72 horas desde el primer aviso para responder. Después se acudirá por orden a los suplentes.",
          "El ranking cerrado no se modificará salvo para corregir fraude o errores acreditados.",
          "El primer contacto se intentará mediante la cuenta de Discord vinculada a SotaHub. Si el participante facilitó un correo, se utilizará como canal alternativo. Nunca se solicitará un pago para recibir el premio.",
        ].map((rule) => <Card className="flex gap-3 p-5 text-left text-sm leading-7 text-[#847868]" key={rule}><Check className="mt-1 shrink-0 text-[#a7b981]" size={16}/>{rule}</Card>)}
      </div>
    </Section>

    <Section eyebrow="05 · PRIVACIDAD Y PLATAFORMAS" title="Protección de participantes">
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-7 text-left">
          <LockKeyhole className="text-[#c99b52]"/>
          <h2 className="mt-5 font-serif text-2xl text-[#dec397]">Privacidad</h2>
          <p className="mt-4 text-sm leading-7 text-[#847868]"><strong className="text-[#bba27b]">Responsable:</strong> {nieblaGiveaway.legalOrganizer}, bajo el nombre SotaKun. Contacto: {nieblaGiveaway.contactEmail}.</p>
          <p className="mt-4 text-sm leading-7 text-[#847868]"><strong className="text-[#bba27b]">Finalidad y base jurídica:</strong> administrar la participación conforme a estas bases, prevenir fraude, realizar la extracción, contactar con ganador y suplentes y entregar el premio. El tratamiento necesario para participar se basa en la ejecución de estas bases y el interés legítimo en garantizar una extracción íntegra.</p>
          <p className="mt-4 text-sm leading-7 text-[#847868]"><strong className="text-[#bba27b]">Datos utilizados:</strong> alias e identificadores de las cuentas vinculadas, puntos e historial necesario para el ranking y, exclusivamente para gestionar el premio, datos de contacto, talla y dirección de entrega que facilite el ganador.</p>
          <p className="mt-4 text-sm leading-7 text-[#847868]"><strong className="text-[#bba27b]">Destinatarios:</strong> proveedores técnicos de alojamiento y correo, la empresa de transporte y, si se escoge la sesión, Niebla Tattooer. También podrán comunicarse datos cuando exista una obligación legal.</p>
          <p className="mt-4 text-sm leading-7 text-[#847868]"><strong className="text-[#bba27b]">Conservación:</strong> los datos específicos de participantes no premiados se eliminarán o anonimizarán en un máximo de 90 días tras finalizar el sorteo. Los del ganador y suplentes se conservarán durante la gestión del premio y, posteriormente, bloqueados durante los plazos legales aplicables.</p>
          <p className="mt-4 text-sm leading-7 text-[#847868]"><strong className="text-[#bba27b]">Derechos:</strong> puedes solicitar acceso, rectificación, supresión, oposición, limitación o portabilidad escribiendo al correo indicado. También puedes presentar una reclamación ante la Agencia Española de Protección de Datos.</p>
          <p className="mt-4 text-xs leading-6 text-[#746959]">No se publicarán direcciones, teléfonos ni nombres reales sin autorización. Si se elige el tatuaje, solo se compartirán con Niebla Tattooer los datos necesarios para organizar la sesión.</p>
          <a className="mt-4 inline-block text-sm text-[#c99b52] hover:text-[#e3bd7b]" href={`mailto:${nieblaGiveaway.contactEmail}`}>{nieblaGiveaway.contactEmail}</a>
        </Card>
        <Card className="p-7 text-left">
          <ExternalLink className="text-[#c99b52]"/>
          <h2 className="mt-5 font-serif text-2xl text-[#dec397]">YouTube</h2>
          <p className="mt-4 text-sm leading-7 text-[#847868]">YouTube no patrocina ni administra el sorteo y queda exonerado de responsabilidad relacionada con él. Las participaciones deben respetar sus Condiciones del Servicio y Normas de la Comunidad.</p>
          <p className="mt-4 text-sm leading-7 text-[#847868]">No se permite manipular métricas ni generar actividad artificial. Las participaciones que incumplan las normas serán descalificadas.</p>
          <Button href={nieblaGiveaway.youtubeContestPolicyUrl} variant="secondary" className="mt-6">Políticas de concursos <ExternalLink size={14}/></Button>
        </Card>
      </div>
    </Section>

    <Section eyebrow="06 · INFORMACIÓN PENDIENTE" title="Datos que se añadirán después" description="Estos detalles logísticos se publicarán cuando estén disponibles sin cambiar la fecha, el sistema de puntos ni las probabilidades.">
      <Card className="mx-auto max-w-5xl p-6 md:p-8">
        <div className="grid gap-3 md:grid-cols-2">
          {nieblaGiveaway.pendingDecisions.map((decision) => <div className="flex gap-3 border border-[#704c31]/35 bg-black/20 p-4 text-left text-sm leading-6 text-[#8a7c69]" key={decision}><AlertTriangle className="mt-1 shrink-0 text-[#c47d4d]" size={15}/>{decision}</div>)}
        </div>
      </Card>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Button href="/sorteos">Volver a Sorteos</Button><Button href="/ranking" variant="secondary">Consultar ranking</Button></div>
    </Section>
  </>;
}
