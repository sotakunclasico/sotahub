import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";
export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("rounded-2xl border border-white/[.08] bg-[#0d1425]/75 p-5", className)} {...props}/>; }
