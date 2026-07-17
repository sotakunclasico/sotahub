"use client";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export function Navbar() { const [open,setOpen]=useState(false); return <header className="sticky top-0 z-40 border-b border-white/[.06] bg-[#070b15]/75 backdrop-blur-2xl"><nav className="shell flex h-18 items-center justify-between"><Logo/><div className="hidden items-center gap-7 lg:flex">{siteConfig.navigation.map(item=><Link className="text-xs font-bold tracking-wider text-slate-400 uppercase transition hover:text-white" href={item.href} key={item.href}>{item.label}</Link>)}</div><div className="hidden items-center gap-3 sm:flex"><Button href="/login" variant="ghost" size="sm">Acceder</Button><Button href={siteConfig.social.youtubeSubscribe} size="sm">Suscríbete en YouTube</Button></div><button className="text-white lg:hidden" aria-label="Abrir navegación" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></nav>{open&&<div className="shell border-t border-white/[.06] py-4 lg:hidden">{siteConfig.navigation.map(item=><Link onClick={()=>setOpen(false)} className="block py-3 text-sm font-bold text-slate-300" href={item.href} key={item.href}>{item.label}</Link>)}<Button href={siteConfig.social.youtubeSubscribe} className="mt-3 w-full">Suscríbete en YouTube</Button></div>}</header>; }
