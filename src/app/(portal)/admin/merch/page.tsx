import Image from "next/image";
import { BadgeCheck, Check, PackageCheck, Shirt, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CollaborationGallery } from "@/features/collaboration/components/collaboration-gallery";
import { collaboration, collaborationArtwork } from "@/features/collaboration/collaboration.config";
import { Sidebar } from "@/layouts/sidebar";

export const metadata = { title: "Merch privado" };

export default function AdminMerchPage() {
  return <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
    <Sidebar/>
    <section className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge>BORRADOR PRIVADO</Badge>
          <h1 className="display-title mt-4 text-4xl text-[#dec69b] md:text-5xl">{collaboration.name}</h1>
          <p className="mt-3 max-w-2xl font-serif leading-7 text-[#948773]">Ficha interna de la colaboración {collaboration.partners}. La tienda pública permanece oculta mientras se confirman producción, precio y existencias.</p>
        </div>
        <span className="inline-flex items-center gap-2 border border-[#7f6038]/60 bg-[#8b5e28]/10 px-4 py-3 text-xs font-bold tracking-widest text-[#caa467] uppercase"><Sparkles size={15}/>{collaboration.status}</span>
      </div>

      <Card className="mt-8 overflow-hidden">
        <div className="grid lg:grid-cols-[1.25fr_.75fr]">
          <div className="relative min-h-72 bg-black md:min-h-[430px]">
            <Image src="/assets/collaboration/niebla/shirt-presentation.webp" alt="Presentación oficial de la camiseta El legado del Rey Helado" fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" priority/>
          </div>
          <div className="p-7 md:p-9">
            <div className="flex items-center gap-3 text-[#caa15f]"><Shirt/><span className="eyebrow">PRODUCTO PRINCIPAL</span></div>
            <h2 className="mt-5 font-serif text-3xl text-[#e0c89e]">Camiseta oficial</h2>
            <p className="mt-3 text-sm leading-7 text-[#90836f]">Algodón premium, ilustración frontal, identidad SotaKun en la espalda y emblema corregido de Niebla Tattooer en la manga.</p>
            <dl className="mt-7 divide-y divide-[#665039]/35 border-y border-[#665039]/35 text-sm">
              <div className="flex justify-between gap-4 py-3"><dt className="text-[#756a5b]">Precio</dt><dd className="text-[#cbb38a]">Por definir</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-[#756a5b]">Stock</dt><dd className="text-[#cbb38a]">No publicado</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-[#756a5b]">Colección</dt><dd className="text-[#cbb38a]">Primera edición</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-[#756a5b]">Diseñador</dt><dd className="text-[#cbb38a]">{collaboration.artistHandle}</dd></div>
            </dl>
            <div className="mt-7 flex items-center gap-3 text-sm text-[#9b8d76]"><PackageCheck className="text-[#b98c4e]"/> Publicación bloqueada hasta completar la ficha.</div>
          </div>
        </div>
      </Card>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Card className="p-7">
          <h2 className="font-serif text-2xl text-[#ddc59b]">Contenido del pack</h2>
          <ul className="mt-5 space-y-4">{collaboration.pack.map((item) => <li className="flex gap-3 text-sm leading-6 text-[#958773]" key={item}><Check className="mt-1 shrink-0 text-[#bd9354]" size={16}/>{item}</li>)}</ul>
        </Card>
        <Card className="p-7">
          <h2 className="font-serif text-2xl text-[#ddc59b]">Control antes de publicar</h2>
          <ul className="mt-5 space-y-4 text-sm leading-6 text-[#958773]">
            <li className="flex gap-3"><BadgeCheck className="mt-1 shrink-0 text-[#789065]" size={16}/>Arte y materiales gráficos recibidos.</li>
            <li className="flex gap-3"><BadgeCheck className="mt-1 shrink-0 text-[#789065]" size={16}/>Nombre TATTOOER corregido en el arte de manga.</li>
            <li className="flex gap-3"><span className="mt-2 size-2 shrink-0 rounded-full bg-[#b1783d]"/>Pendiente confirmar tallas, unidades y costes.</li>
            <li className="flex gap-3"><span className="mt-2 size-2 shrink-0 rounded-full bg-[#b1783d]"/>Pendiente activar pedidos y certificado QR.</li>
          </ul>
        </Card>
      </div>

      <div className="mt-10">
        <span className="eyebrow">ARCHIVO VISUAL</span>
        <h2 className="display-title mb-6 mt-3 text-3xl text-[#dec69b]">Galería de la colaboración</h2>
        <CollaborationGallery artwork={collaborationArtwork}/>
      </div>
    </section>
  </div>;
}
