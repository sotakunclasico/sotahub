import { Sparkles } from "lucide-react";
import { Button } from "./button";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="glass-panel grid min-h-64 place-items-center p-8 text-center"><div><Sparkles className="mx-auto mb-4 text-[#c99b52]"/><h3 className="font-serif text-2xl text-[#ddc59b]">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#817667]">{description}</p><Button href="/community" variant="secondary" className="mt-6">Explorar comunidad</Button></div></div>;
}
