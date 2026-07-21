import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { href?: string; variant?: "primary" | "secondary" | "ghost"; size?: "sm" | "md" | "lg" };
export function Button({ className, href, variant = "primary", size = "md", children, ...props }: Props) {
  const styles = cn("relative inline-flex items-center justify-center gap-2 font-serif font-bold tracking-[.12em] uppercase transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7a95e] disabled:opacity-50", {
    "fantasy-button text-[#f3dfb6] hover:-translate-y-0.5": variant === "primary",
    "fantasy-button fantasy-button-secondary text-[#dac7a5] hover:-translate-y-0.5 hover:text-[#f3dfb6]": variant === "secondary",
    "border-transparent bg-transparent text-[#9c8e77] hover:text-[#e0bd79]": variant === "ghost",
    "h-11 min-w-32 px-6 text-[10px]": size === "sm", "h-13 min-w-40 px-7 text-[11px]": size === "md", "h-16 min-w-52 px-9 text-xs": size === "lg",
  }, className);
  if (href) return <Link className={styles} href={href}>{children}</Link>;
  return <button className={styles} {...props}>{children}</button>;
}
