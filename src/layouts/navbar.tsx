"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const accountHref = session ? "/dashboard" : "/login";
  const accountLabel = session?.user?.name ?? "Acceder";

  return <header className="sticky top-0 z-40 border-b border-[#7c5b31]/40 bg-[#070808]/90 backdrop-blur-2xl">
    <nav className="shell flex h-20 items-center justify-between" aria-label="Navegación principal">
      <Logo/>
      <div className="hidden items-center gap-2 xl:flex">
        {siteConfig.navigation.map((item) => {
          const active = pathname === item.href;
          return <Link aria-current={active ? "page" : undefined} className={`nav-art-link ${active ? "nav-art-link-active" : ""}`} href={item.href} key={item.href}>{item.label}</Link>;
        })}
      </div>
      <div className="hidden items-center gap-3 xl:flex">
        <Button href={accountHref} variant="secondary" size="sm"><span className="max-w-32 truncate">{accountLabel}</span></Button>
        <Button href={siteConfig.social.youtubeSubscribe} size="sm">Suscríbete en YouTube</Button>
      </div>
      <button className="text-[#d5b57b] xl:hidden" aria-label={open ? "Cerrar navegación" : "Abrir navegación"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    </nav>
    {open && <div id="mobile-navigation" className="shell border-t border-[#7c5b31]/25 py-4 xl:hidden">
      {siteConfig.navigation.map((item) => <Link onClick={() => setOpen(false)} aria-current={pathname === item.href ? "page" : undefined} className={`block border-b border-[#7c5b31]/15 py-3 font-serif text-sm tracking-wider ${pathname === item.href ? "text-[#efc879]" : "text-[#b3a48d]"}`} href={item.href} key={item.href}>{item.label}</Link>)}
      <div className="mt-4 grid gap-2 sm:grid-cols-2"><Button href={accountHref} variant="secondary" className="w-full">{accountLabel}</Button><Button href={siteConfig.social.youtubeSubscribe} className="w-full">Suscríbete en YouTube</Button></div>
    </div>}
  </header>;
}
