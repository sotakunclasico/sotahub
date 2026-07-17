import Link from "next/link";
import { Hexagon } from "lucide-react";
export function Logo() { return <Link href="/" className="flex items-center gap-3 font-black tracking-tight text-white"><span className="relative grid size-10 place-items-center text-sky-300"><Hexagon className="absolute" size={38}/><span className="text-sm">S</span></span><span className="text-xl">SOTA<span className="text-sky-400">KUN</span></span></Link>; }
