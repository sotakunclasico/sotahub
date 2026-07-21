"use client";

import { SearchIcon } from "lucide-react";

export function Search({ placeholder = "Buscar..." }: { placeholder?: string }) {
  return <label className="flex h-11 items-center gap-3 border border-[#695136]/50 bg-black/30 px-4 text-[#8f8371] focus-within:border-[#c39857]/70"><SearchIcon size={17}/><input className="w-full bg-transparent text-sm text-[#d8c29c] outline-none placeholder:text-[#6f6659]" placeholder={placeholder}/></label>;
}
