import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "role" };

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <span className={cn(variant === "role" ? "role-badge" : "inline-flex items-center border border-[#9b7139]/40 bg-[#8d5e23]/10 px-2.5 py-1 font-serif text-[10px] font-bold tracking-[.16em] text-[#d6ad6b] uppercase", className)} {...props} />;
}
