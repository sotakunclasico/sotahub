import { cn } from "@/utils/cn";
import { Badge } from "./badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";

  return <header className="shell relative overflow-hidden py-20 md:py-28">
    <div className={cn("orb top-0", centered ? "left-1/2 -translate-x-1/2" : "-left-32")}/>
    <div className={cn("relative max-w-3xl", centered && "mx-auto text-center")}>
      <Badge>{eyebrow}</Badge>
      <h1 className="display-title mt-6 text-5xl text-[#dec69b] md:text-7xl">{title}</h1>
      <p className={cn(
        "mt-5 max-w-2xl font-serif text-lg leading-8 text-[#998b75]",
        centered && "mx-auto",
      )}>{description}</p>
    </div>
  </header>;
}
