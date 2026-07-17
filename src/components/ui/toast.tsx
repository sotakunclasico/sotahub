import { CheckCircle2 } from "lucide-react";
export function Toast({ message }: { message: string }) { return <div role="status" className="glass-panel flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white"><CheckCircle2 className="text-emerald-400" size={18}/>{message}</div>; }
