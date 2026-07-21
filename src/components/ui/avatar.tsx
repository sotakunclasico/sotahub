import { cn } from "@/utils/cn";
export function Avatar({ name, className }: { name: string; className?: string }) {
  return <span aria-label={name} className={cn("fantasy-avatar inline-grid size-10 place-items-center rounded-full border border-[#9b7139] bg-[radial-gradient(circle,#312a20,#090a09_70%)] font-serif text-sm font-bold text-[#d8bb82] shadow-[inset_0_0_0_3px_#111,0_0_18px_rgba(184,138,67,.18)]", className)}><span>{name.slice(0, 2).toUpperCase()}</span></span>;
}
