"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Dice5, Plus, ShieldCheck, Trash2, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { GiveawayCandidate, GiveawayDrawResult } from "../giveaway-draw.types";
import { nieblaGiveaway } from "../niebla-giveaway.config";

export function GiveawayAdminPanel({ initialCandidates }: { initialCandidates: GiveawayCandidate[] }) {
  const [title, setTitle] = useState("Sorteo especial SotaKun × Niebla Tattooer");
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [newExclusion, setNewExclusion] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [result, setResult] = useState<GiveawayDrawResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const normalizedExclusions = useMemo(() => exclusions.map(value => value.toLowerCase().replace(/[^a-z0-9]/g, "")), [exclusions]);
  const candidates = useMemo(() => initialCandidates.filter(candidate => !normalizedExclusions.some(value => candidate.username.toLowerCase().replace(/[^a-z0-9]/g, "").includes(value))), [initialCandidates, normalizedExclusions]);
  const totalEntries = candidates.reduce((total, candidate) => total + candidate.entries, 0);

  function addExclusion() {
    const value = newExclusion.trim().replace(/^@/, "");
    if (value && !exclusions.includes(value)) setExclusions([...exclusions, value]);
    setNewExclusion("");
  }

  async function draw() {
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/giveaways/draw", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, exclusions, confirmation }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setResult(payload as GiveawayDrawResult); setConfirmation("");
    } catch (drawError) { setError(drawError instanceof Error ? drawError.message : "No se pudo realizar el sorteo."); }
    finally { setLoading(false); }
  }

  return <Card className="ornate-frame p-6 md:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><Badge><ShieldCheck size={12} className="mr-1"/> HERRAMIENTA ADMINISTRATIVA</Badge><h3 className="mt-4 font-serif text-3xl text-[#dec69d]">Realizar un sorteo</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-[#847969]">Cada 5 puntos generan una participación completa. Por ejemplo, 50 puntos equivalen a 10 participaciones.</p></div><div className="text-right"><p className="font-serif text-3xl text-[#d7b678]">{totalEntries}</p><p className="text-[10px] tracking-widest text-[#746854] uppercase">participaciones · {candidates.length} usuarios</p></div></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-2"><div><label className="eyebrow" htmlFor="draw-title">NOMBRE DEL SORTEO</label><input id="draw-title" value={title} onChange={event => setTitle(event.target.value)} className="mt-2 h-12 w-full border border-[#725633]/60 bg-black/50 px-4 text-sm text-[#d6c09c] outline-none focus:border-[#b88a49]"/><p className="eyebrow mt-6">EXCLUSIONES OBLIGATORIAS</p><div className="mt-2 flex flex-wrap gap-2">{nieblaGiveaway.mandatoryExclusions.map(username => <span key={username} className="inline-flex items-center gap-2 border border-[#744b35]/50 bg-[#542618]/20 px-3 py-2 text-xs text-[#c58d6c]">@{username}<ShieldCheck size={13}/></span>)}</div><p className="eyebrow mt-6">EXCLUSIONES ADICIONALES</p><div className="mt-2 flex"><input value={newExclusion} onChange={event => setNewExclusion(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addExclusion(); } }} placeholder="Solo fraude o error acreditado" className="h-11 min-w-0 flex-1 border border-[#725633]/60 bg-black/50 px-4 text-sm text-[#d6c09c] outline-none"/><Button type="button" onClick={addExclusion} size="sm" className="h-11"><Plus size={15}/> Añadir</Button></div><div className="mt-3 flex flex-wrap gap-2">{exclusions.map(username => <span key={username} className="inline-flex items-center gap-2 border border-[#744b35]/50 bg-[#542618]/20 px-3 py-2 text-xs text-[#c58d6c]">@{username}<button type="button" aria-label={`Eliminar ${username}`} onClick={() => setExclusions(exclusions.filter(value => value !== username))}><Trash2 size={13}/></button></span>)}</div></div>
      <div><p className="eyebrow">VISTA PREVIA DE PROBABILIDADES</p><div className="mt-2 max-h-60 overflow-auto border border-[#654d30]/50 bg-black/30"><table className="w-full text-left text-xs"><thead className="sticky top-0 bg-[#12100c] text-[#796d5a]"><tr><th className="p-3">Usuario</th><th className="p-3">Puntos</th><th className="p-3">Participaciones</th><th className="p-3">Prob.</th></tr></thead><tbody>{candidates.slice(0,100).map(candidate => <tr className="border-t border-[#4f412d]/35 text-[#a99a84]" key={candidate.username}><td className="p-3 text-[#d0b98f]">{candidate.username}</td><td className="p-3">{candidate.points}</td><td className="p-3">{candidate.entries}</td><td className="p-3">{totalEntries ? (candidate.entries / totalEntries * 100).toFixed(2) : "0"}%</td></tr>)}</tbody></table></div></div></div>
    <div className="mt-7 border-t border-[#665035]/40 pt-6"><div className="flex gap-3 text-sm text-[#a48268]"><AlertTriangle size={18} className="shrink-0 text-[#cc7d4d]"/><p>La extracción es definitiva y se guarda con la huella del ranking. Escribe <strong className="text-[#d8b178]">REALIZAR SORTEO</strong> para habilitar el botón.</p></div><div className="mt-4 flex flex-col gap-3 sm:flex-row"><input value={confirmation} onChange={event => setConfirmation(event.target.value)} placeholder="REALIZAR SORTEO" className="h-12 flex-1 border border-[#725633]/60 bg-black/50 px-4 text-sm text-[#d6c09c] outline-none"/><Button type="button" onClick={draw} disabled={loading || confirmation !== "REALIZAR SORTEO" || !title.trim()}><Dice5 size={17}/>{loading ? "Seleccionando…" : "Elegir ganador"}</Button></div>{error && <p className="mt-4 text-sm text-[#d57b63]">{error}</p>}</div>
    {result && <div className="mt-7 border border-[#a67c40]/60 bg-[radial-gradient(circle_at_center,rgba(173,118,47,.16),transparent_65%)] p-7 text-center"><Trophy className="mx-auto text-[#e0b765]" size={32}/><span className="eyebrow mt-3 block">GANADOR PROVISIONAL</span><p className="mt-3 font-serif text-4xl text-[#ead0a0]">{result.winner.username}</p><p className="mt-2 text-sm text-[#9d8a6d]">{result.winner.points} puntos · {result.winner.entries} participaciones</p><p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-[#8d806d]">Comprueba que continúa suscrito al canal antes de confirmar el premio. Si no cumple los requisitos o no puede localizarse, utiliza los suplentes por orden.</p><div className="mx-auto mt-6 max-w-2xl border-t border-[#715737]/45 pt-5"><span className="eyebrow">SUPLENTES POR ORDEN</span><div className="mt-3 grid gap-2 sm:grid-cols-3">{result.alternates.map((alternate, index) => <div className="border border-[#654e34]/45 bg-black/25 p-3" key={alternate.username}><p className="text-[10px] text-[#756957]">#{index + 1}</p><p className="mt-1 truncate font-serif text-[#d5ba8c]">{alternate.username}</p></div>)}</div></div><p className="mt-4 font-mono text-[10px] text-[#665d50]">Huella: {result.rankingFingerprint}</p></div>}
  </Card>;
}
