"use client";
import { SearchIcon } from "lucide-react";
export function Search({ placeholder = "Buscar..." }: { placeholder?: string }) { return <label className="flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 text-slate-400 focus-within:border-sky-400/40"><SearchIcon size={17}/><input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder={placeholder}/></label>; }
