import { cn } from "@/utils/cn";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center";
};

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  align = "center",
}: SectionProps) {
  const centered = align === "center";

  return <section id={id} className={cn("shell py-14 md:py-20", className)}>
    <div className={cn(
      "mb-7 flex max-w-3xl flex-col gap-3",
      centered && "mx-auto items-center text-center",
    )}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="display-title text-3xl text-[#dec69b] md:text-5xl">{title}</h2>
      {description && <p className={cn(
        "max-w-2xl font-serif text-base leading-7 text-[#948773]",
        centered && "mx-auto",
      )}>{description}</p>}
      <div className={cn(
        "section-divider-art mt-1",
        centered ? "mx-auto" : "-ml-6",
      )} aria-hidden="true"/>
    </div>
    {children}
  </section>;
}
