import { Badge } from "./badge";
export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="shell relative overflow-hidden py-20 md:py-28"><div className="orb -left-32 top-0"/><div className="relative max-w-3xl"><Badge>{eyebrow}</Badge><h1 className="display-title mt-6 text-5xl text-white md:text-7xl">{title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">{description}</p></div></header>;
}
