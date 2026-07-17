"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
export function Dropdown({ label, items }: { label: string; items: string[] }) { const [open,setOpen]=useState(false); return <div className="relative"><button className="flex items-center gap-2 text-sm text-slate-300" onClick={()=>setOpen(!open)}>{label}<ChevronDown size={14}/></button>{open&&<div className="glass-panel absolute right-0 top-8 z-40 min-w-40 rounded-xl p-2">{items.map(item=><button className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5" key={item}>{item}</button>)}</div>}</div>; }
