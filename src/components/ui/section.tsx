import { cn } from "@/utils/cn";
export function Section({ id, eyebrow, title, description, children, className }: { id?: string; eyebrow?: string; title: string; description?: string; children: React.ReactNode; className?: string }) {
  return <section id={id} className={cn("shell py-16 md:py-24", className)}><div className="mb-9 flex max-w-3xl flex-col gap-3"><span className="eyebrow">{eyebrow}</span><h2 className="display-title text-3xl text-white md:text-5xl">{title}</h2>{description && <p className="max-w-2xl text-base leading-7 text-slate-400">{description}</p>}</div>{children}</section>;
}
