import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/config/site";

export function Footer() {
  return <footer className="mt-16 border-t border-[#77562d]/40 bg-[#070808]/85">
    <div className="shell grid gap-10 py-12 md:grid-cols-[1.3fr_2fr]">
      <div><Logo/><p className="mt-4 max-w-sm font-serif text-sm leading-6 text-[#776d5e]">Un punto de encuentro creado para jugar, competir y construir historias juntos.</p></div>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">{["Plataforma","Comunidad","Legal"].map((group,i)=><div key={group}><p className="mb-4 font-serif text-xs font-bold tracking-widest text-[#c6a56b] uppercase">{group}</p>{siteConfig.navigation.slice(i*2,i*2+2).map(item=><Link className="mb-3 block text-sm text-[#776d5e] hover:text-[#d9b675]" href={item.href} key={item.href}>{item.label}</Link>)}</div>)}</div>
    </div>
    <div className="shell flex flex-col gap-2 border-t border-[#77562d]/20 py-6 text-xs text-[#5f574b] sm:flex-row sm:justify-between"><span>© 2026 SotaKun. Hecho para la comunidad.</span><span>No afiliado a Blizzard, Valve ni Discord.</span></div>
  </footer>;
}
