import Link from "next/link";
import { BarChart3, FileBadge, Gift, Newspaper, ScrollText, Settings, Shirt, ShoppingBag, Trophy, Users } from "lucide-react";

const items = [
  ["Resumen", "/admin", BarChart3],
  ["Usuarios", "/admin?view=users", Users],
  ["Merch", "/admin/merch", Shirt],
  ["Pedidos", "/admin?view=orders", ShoppingBag],
  ["Certificados", "/admin?view=certificates", FileBadge],
  ["Ranking", "/admin?view=ranking", Trophy],
  ["Sorteos", "/admin?view=giveaways", Gift],
  ["Noticias", "/admin?view=news", Newspaper],
  ["Logs", "/admin?view=logs", ScrollText],
  ["Configuración", "/settings", Settings],
] as const;

export function Sidebar() {
  return <aside className="glass-panel flex gap-1 overflow-x-auto rounded-2xl p-2 lg:sticky lg:top-24 lg:block lg:h-fit lg:overflow-visible lg:p-3">
    {items.map(([label, href, Icon]) => <Link className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm whitespace-nowrap text-slate-400 transition hover:bg-white/[.05] hover:text-white lg:w-full" href={href} key={label}><Icon size={17}/>{label}</Link>)}
  </aside>;
}
