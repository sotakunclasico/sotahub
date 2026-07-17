import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { href?: string; variant?: "primary" | "secondary" | "ghost"; size?: "sm" | "md" | "lg" };
export function Button({ className, href, variant = "primary", size = "md", children, ...props }: Props) {
  const styles = cn("inline-flex items-center justify-center gap-2 rounded-xl border font-bold tracking-wide transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-50", {
    "border-blue-400/30 bg-blue-600 text-white shadow-[0_0_28px_rgba(37,99,235,.28)] hover:-translate-y-0.5 hover:bg-blue-500": variant === "primary",
    "border-white/12 bg-white/[.06] text-white backdrop-blur-xl hover:border-sky-400/40 hover:bg-white/[.1]": variant === "secondary",
    "border-transparent bg-transparent text-slate-300 hover:bg-white/[.06] hover:text-white": variant === "ghost",
    "h-9 px-4 text-xs": size === "sm", "h-11 px-5 text-sm": size === "md", "h-14 px-7 text-sm": size === "lg",
  }, className);
  if (href) return <Link className={styles} href={href}>{children}</Link>;
  return <button className={styles} {...props}>{children}</button>;
}
