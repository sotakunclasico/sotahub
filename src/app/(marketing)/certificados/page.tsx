import Image from "next/image";
import { BadgeCheck, Database, Fingerprint, QrCode, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";

export const metadata = { title: "Certificados" };

const certificateFields = ["UUID", "Número", "Producto", "Colección", "Diseñador", "Propietario", "Fecha", "QR", "Estado", "Verificado"];

export default function CertificatesPage() {
  return <>
    <PageHeader eyebrow="AUTENTICIDAD" title="Cada pieza tiene una historia" description="El futuro registro de SotaKun vinculará cada pieza oficial con una identidad única, verificable y preparada para conservar su procedencia."/>

    <Section eyebrow="PRIMERA COLECCIÓN" title="SotaKun × Niebla Tattooer" description="Las cartas de autor definen la identidad visual de la colaboración El legado del Rey Helado.">
      <Card className="ornate-frame overflow-hidden p-4 md:p-7">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative aspect-[663/983] overflow-hidden bg-[#c7a675]"><Image src="/assets/collaboration/niebla/card-sotakun.webp" alt="Carta oficial de SotaKun" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority/></div>
          <div className="relative aspect-[683/983] overflow-hidden bg-black"><Image src="/assets/collaboration/niebla/card-niebla.webp" alt="Carta oficial de Niebla Tattooer" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority/></div>
        </div>
      </Card>
    </Section>

    <Section eyebrow="REGISTRO DIGITAL" title="Una identidad irrepetible" description="El módulo todavía no emite certificados públicos. Esta es la estructura prevista antes de conectarlo a PostgreSQL y habilitar la verificación.">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <Card className="p-7 md:p-9">
          <div className="flex items-center gap-3 text-[#c99c54]"><Fingerprint/><span className="eyebrow">DATOS DEL CERTIFICADO</span></div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">{certificateFields.map((field) => <div className="flex items-center gap-3 border border-[#6d5334]/40 bg-black/25 px-4 py-3 text-sm text-[#b5a487]" key={field}><BadgeCheck size={15} className="text-[#8da174]"/>{field}</div>)}</div>
        </Card>
        <div className="grid gap-5">
          <Card className="p-7"><QrCode className="text-[#c89a51]"/><h3 className="mt-5 font-serif text-2xl text-[#ddc59b]">Verificación mediante QR</h3><p className="mt-3 text-sm leading-7 text-[#877b69]">Cada código abrirá una ficha pública de solo lectura para confirmar autenticidad, colección y estado.</p></Card>
          <Card className="p-7"><Database className="text-[#c89a51]"/><h3 className="mt-5 font-serif text-2xl text-[#ddc59b]">Fuente única y persistente</h3><p className="mt-3 text-sm leading-7 text-[#877b69]">Los certificados se emitirán desde la base de datos, sin números de muestra ni registros simulados.</p></Card>
        </div>
      </div>
      <Card className="mt-5 flex flex-col items-start justify-between gap-5 border-[#795a34]/55 p-6 sm:flex-row sm:items-center">
        <div className="flex gap-4"><ShieldCheck className="mt-1 shrink-0 text-[#c69951]"/><div><h3 className="font-serif text-xl text-[#d9c095]">Verificación aún no habilitada</h3><p className="mt-1 text-sm leading-6 text-[#807565]">Se activará cuando existan unidades físicas numeradas y el registro definitivo esté conectado.</p></div></div>
        <Badge>SISTEMA EN PREPARACIÓN</Badge>
      </Card>
    </Section>
  </>;
}
