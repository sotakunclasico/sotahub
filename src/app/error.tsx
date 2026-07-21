"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorPage({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <section className="shell grid min-h-[65vh] place-items-center py-20">
    <div className="glass-panel ornate-frame w-full max-w-2xl p-8 text-center md:p-12">
      <AlertTriangle className="mx-auto text-[#c86f52]" size={34}/>
      <span className="eyebrow mt-5 block">INTERRUPCIÓN INESPERADA</span>
      <h1 className="display-title mt-4 text-4xl text-[#e0c89e]">El nexo necesita recuperarse</h1>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#887d6c]">No se han perdido tus datos. Puedes intentar renderizar de nuevo esta sección.</p>
      <button type="button" onClick={unstable_retry} className="fantasy-button mt-8 inline-flex h-13 min-w-48 items-center justify-center gap-2 px-7 font-serif text-xs font-bold tracking-wider text-[#f3dfb6] uppercase"><RefreshCw size={16}/> Intentar de nuevo</button>
    </div>
  </section>;
}
