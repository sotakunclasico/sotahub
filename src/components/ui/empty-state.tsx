import { Sparkles } from "lucide-react";
import { Button } from "./button";
export function EmptyState({ title, description }: { title: string; description: string }) { return <div className="glass-panel grid min-h-64 place-items-center rounded-2xl p-8 text-center"><div><Sparkles className="mx-auto mb-4 text-sky-300"/><h3 className="text-xl font-bold text-white">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{description}</p><Button href="/community" variant="secondary" className="mt-6">Explorar comunidad</Button></div></div>; }
