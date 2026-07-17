import { cn } from "@/utils/cn";
export function Avatar({ name, className }: { name: string; className?: string }) {
  return <span aria-label={name} className={cn("inline-grid size-10 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-blue-500 to-cyan-300 text-sm font-black text-white shadow-lg", className)}>{name.slice(0, 2).toUpperCase()}</span>;
}
