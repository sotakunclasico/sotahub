import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
export function FeaturePage({eyebrow,title,description,items,icon:Icon}:{eyebrow:string;title:string;description:string;items:{title:string;description:string}[];icon:LucideIcon}){return <><PageHeader eyebrow={eyebrow} title={title} description={description}/><section className="shell pb-24"><div className="grid gap-5 md:grid-cols-3">{items.map(item=><Card className="p-6" key={item.title}><Icon className="text-sky-300"/><h2 className="mt-6 text-xl font-black text-white">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p></Card>)}</div>{items.length===0&&<EmptyState title="Próximamente" description="Estamos preparando esta sección para la comunidad."/>}</section></>}
