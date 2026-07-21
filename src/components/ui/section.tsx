import { cn } from "@/utils/cn";
export function Section({ id, eyebrow, title, description, children, className }: { id?: string; eyebrow?: string; title: string; description?: string; children: React.ReactNode; className?: string }) {
  return <section id={id} className={cn("shell py-14 md:py-20", className)}><div className="mb-7 flex max-w-3xl flex-col gap-3"><span className="eyebrow">{eyebrow}</span><h2 className="display-title text-3xl text-[#dec69b] md:text-5xl">{title}</h2>{description && <p className="max-w-2xl font-serif text-base leading-7 text-[#948773]">{description}</p>}<div className="section-divider-art -ml-6 mt-1" aria-hidden="true"/></div>{children}</section>;
}
