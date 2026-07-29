"use client";

import { useState } from "react";
import { CheckCircle2, DatabaseBackup, LoaderCircle, ScanSearch, ShieldCheck, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CommunityRankingState } from "../services/community-ranking";

type ScanMode = "incremental" | "full";

function formatRunDate(value: string | null) {
  if (!value) return "Nunca";
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  }).format(new Date(value));
}

export function RankingAdminControls({ initialState }: { initialState: CommunityRankingState }) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [activeMode, setActiveMode] = useState<ScanMode | null>(state.status === "running" ? state.runMode : null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(state.status === "failed" ? state.error ?? "" : "");
  const isRunning = activeMode !== null;

  async function runScan(mode: ScanMode) {
    setActiveMode(mode);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/ranking/refresh?mode=${mode}`, {
        method: "POST",
        headers: { accept: "application/json" },
      });
      const payload = await response.json() as CommunityRankingState | { error?: string };
      if (!response.ok) {
        throw new Error("error" in payload && payload.error ? payload.error : "No se pudo iniciar el análisis.");
      }

      const nextState = payload as CommunityRankingState;
      setState(nextState);
      if (nextState.status === "failed") {
        throw new Error(nextState.error ?? "El motor terminó con errores.");
      }

      setMessage(mode === "full"
        ? `Análisis completo terminado: ${nextState.entries} usuarios procesados.`
        : `Actualización desde backup terminada: ${nextState.entries} usuarios procesados.`);
      router.refresh();
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "No se pudo ejecutar el análisis.");
    } finally {
      setActiveMode(null);
    }
  }

  return <Card className="ornate-frame mt-6 p-6 md:p-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <Badge><ShieldCheck className="mr-1" size={12}/> SOLO ADMINISTRADOR</Badge>
        <h2 className="mt-4 font-serif text-3xl text-[#dec69d]">Escáner del ranking</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#817566]">Ejecuta el motor real de Community Ranking. Solo puede iniciarlo una sesión autenticada con rol ADMIN; la API vuelve a comprobar el permiso antes de comenzar.</p>
      </div>
      <div className="text-right">
        <p className="font-serif text-3xl text-[#d7b678]">{state.entries.toLocaleString("es-ES")}</p>
        <p className="text-[10px] tracking-widest text-[#746854] uppercase">usuarios en el último resultado</p>
      </div>
    </div>

    <div className="mt-7 grid gap-4 lg:grid-cols-2">
      <div className="border border-[#6d5334]/50 bg-black/25 p-6">
        <DatabaseBackup className="text-[#b89963]" size={25}/>
        <h3 className="mt-4 font-serif text-2xl text-[#d8bd91]">Actualizar desde backup</h3>
        <p className="mt-3 text-sm leading-7 text-[#807565]">Reutiliza los vídeos y chats que ya tienen checkpoint, revisa los vídeos recientes y añade los cambios encontrados. Es la opción habitual y más rápida.</p>
        <p className="mt-4 text-xs text-[#6f6557]">Última incremental: {formatRunDate(state.lastIncrementalSuccessfulRunAt)}</p>
        <Button className="mt-6" type="button" variant="secondary" onClick={() => runScan("incremental")} disabled={isRunning}>
          {activeMode === "incremental" ? <LoaderCircle className="animate-spin" size={17}/> : <DatabaseBackup size={17}/>}
          {activeMode === "incremental" ? "Analizando…" : "Usar backup"}
        </Button>
      </div>

      <div className="border border-[#80603a]/60 bg-[#5b3518]/10 p-6">
        <ScanSearch className="text-[#cf9d51]" size={25}/>
        <h3 className="mt-4 font-serif text-2xl text-[#dfc499]">Escaneo completo</h3>
        <p className="mt-3 text-sm leading-7 text-[#877967]">Recorre todos los vídeos únicos del canal y vuelve a consultar sus comentarios. Conserva los chats ya completados para no perder directos verticales u horizontales ni repetir descargas innecesarias.</p>
        <p className="mt-4 text-xs text-[#746858]">Último completo: {formatRunDate(state.lastFullSuccessfulRunAt)}</p>
        <Button className="mt-6" type="button" onClick={() => runScan("full")} disabled={isRunning}>
          {activeMode === "full" ? <LoaderCircle className="animate-spin" size={17}/> : <ScanSearch size={17}/>}
          {activeMode === "full" ? "Escaneando…" : "Escanear todo"}
        </Button>
      </div>
    </div>

    {isRunning && <div className="mt-5 flex gap-3 border border-[#80623c]/50 bg-[#70481e]/10 p-4 text-sm leading-6 text-[#a38b6c]">
      <LoaderCircle className="mt-0.5 shrink-0 animate-spin text-[#d0a05a]" size={18}/>
      <p>El análisis está trabajando. Un escaneo completo puede tardar bastante; no pulses de nuevo ni reinicies el servidor.</p>
    </div>}
    {message && <div className="mt-5 flex gap-3 border border-[#587044]/55 bg-[#48612f]/10 p-4 text-sm text-[#a4b88b]"><CheckCircle2 className="shrink-0" size={18}/>{message}</div>}
    {error && <div className="mt-5 flex gap-3 border border-[#814735]/60 bg-[#672b20]/15 p-4 text-sm leading-6 text-[#d28b76]"><TriangleAlert className="mt-0.5 shrink-0" size={18}/>{error}</div>}
  </Card>;
}
