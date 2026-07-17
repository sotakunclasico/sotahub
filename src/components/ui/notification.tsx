import { Bell } from "lucide-react";
export function Notification() { return <button aria-label="Notificaciones" className="relative grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[.04] text-slate-300"><Bell size={18}/><span className="absolute right-2 top-2 size-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]"/></button>; }
