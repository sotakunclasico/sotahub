import "server-only";

import { spawn } from "node:child_process";
import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import bundledRankingJson from "../../../../data/community_ranking.json";
import bundledStateJson from "../../../../data/community-ranking-state.json";
import { isRankingExcluded } from "@/config/ranking";

const rankingEntrySchema = z.object({
  username: z.string().min(1),
  points: z.number().nonnegative(),
  comments: z.number().int().nonnegative(),
  live_messages: z.number().int().nonnegative(),
  unique_videos: z.number().int().nonnegative(),
  unique_lives: z.number().int().nonnegative(),
});

const rankingSchema = z.array(rankingEntrySchema);
const stateSchema = z.object({
  lastAttemptAt: z.string().datetime().nullable(),
  lastSuccessfulRunAt: z.string().datetime().nullable(),
  lastIncrementalSuccessfulRunAt: z.string().datetime().nullable().default(null),
  lastFullSuccessfulRunAt: z.string().datetime().nullable().default(null),
  runMode: z.enum(["incremental", "full"]).nullable().default(null),
  status: z.enum(["idle", "running", "success", "failed"]),
  entries: z.number().int().nonnegative(),
  error: z.string().nullable(),
});

const bundledRankingSnapshot = rankingSchema.parse(bundledRankingJson);
const bundledStateSnapshot = stateSchema.parse(bundledStateJson);

export type CommunityRankingEntry = z.infer<typeof rankingEntrySchema>;
export type CommunityRankingState = z.infer<typeof stateSchema>;

const rankingPath = path.join(/* turbopackIgnore: true */ process.cwd(), "data", "community_ranking.json");
const partialRankingPath = path.join(/* turbopackIgnore: true */ process.cwd(), "data", "community_ranking.partial.json");
const statePath = path.join(/* turbopackIgnore: true */ process.cwd(), "data", "community-ranking-state.json");
const projectDataDirectory = path.dirname(rankingPath);
const legacyRankingPath = "C:\\SotakunJson\\V_Codex\\community_ranking.json";
const bundledScriptPath = path.join(/* turbopackIgnore: true */ process.cwd(), "scripts", "community-ranking", "community_ranking.py");

function positiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const communityRankingIncrementalIntervalMs = Math.max(5, positiveNumber(process.env.COMMUNITY_RANKING_INCREMENTAL_MINUTES, 10)) * 60 * 1_000;
const fullRefreshIntervalMs = positiveNumber(process.env.COMMUNITY_RANKING_FULL_INTERVAL_DAYS, 30) * 24 * 60 * 60 * 1_000;

declare global {
  var __sotahubRankingRefresh: Promise<CommunityRankingState> | undefined;
}

async function fileExists(filePath: string) {
  try { await access(filePath); return true; } catch { return false; }
}

async function writeJsonAtomic(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

export async function getCommunityRankingState(): Promise<CommunityRankingState> {
  if (process.env.SOTAHUB_RUNTIME === "cloudflare") return bundledStateSnapshot;
  if (!(await fileExists(statePath))) return bundledStateSnapshot;
  try {
    const raw: unknown = JSON.parse(await readFile(statePath, "utf8"));
    const state = stateSchema.parse(raw);
    if (raw && typeof raw === "object" && !("lastFullSuccessfulRunAt" in raw)) {
      state.lastFullSuccessfulRunAt = state.lastSuccessfulRunAt;
    }
    return state;
  }
  catch { return bundledStateSnapshot; }
}

export async function getCommunityRanking(): Promise<CommunityRankingEntry[]> {
  if (process.env.SOTAHUB_RUNTIME === "cloudflare") {
    return normalizeRankingSnapshot(bundledRankingSnapshot);
  }
  const snapshots = await Promise.all([rankingPath, partialRankingPath, legacyRankingPath].map(async (source) => {
    if (!(await fileExists(source))) return [];
    try { return rankingSchema.parse(JSON.parse(await readFile(source, "utf8"))); } catch { return []; }
  }));
  const authoritativeSnapshot = snapshots.find((snapshot) => snapshot.length > 0) ?? bundledRankingSnapshot;
  return normalizeRankingSnapshot(authoritativeSnapshot);
}

function normalizeRankingSnapshot(snapshot: CommunityRankingEntry[]) {
  const users = new Map<string, CommunityRankingEntry>();
  for (const entry of snapshot) {
    if (isRankingExcluded(entry.username)) continue;
    const comments = entry.comments;
    const liveMessages = entry.live_messages;
    const uniqueVideos = entry.unique_videos;
    const uniqueLives = entry.unique_lives;
    users.set(entry.username, {
      username: entry.username,
      comments,
      live_messages: liveMessages,
      unique_videos: uniqueVideos,
      unique_lives: uniqueLives,
      points: Math.round((comments * 2 + uniqueVideos * 3 + liveMessages * 0.1 + uniqueLives) * 100) / 100,
    });
  }
  return [...users.values()].sort((left, right) => right.points - left.points);
}

async function runPythonRankingEngine(mode: "incremental" | "full") {
  const configuredScriptPath = process.env.COMMUNITY_RANKING_SCRIPT_PATH;
  if (configuredScriptPath && !path.isAbsolute(configuredScriptPath)) {
    throw new Error("COMMUNITY_RANKING_SCRIPT_PATH debe ser una ruta absoluta.");
  }
  const scriptPath = configuredScriptPath ?? bundledScriptPath;
  if (!path.isAbsolute(scriptPath) || path.extname(scriptPath).toLowerCase() !== ".py") {
    throw new Error("COMMUNITY_RANKING_SCRIPT_PATH debe apuntar a un archivo Python absoluto.");
  }
  if (!(await fileExists(scriptPath))) throw new Error(`No se encuentra el motor de ranking: ${scriptPath}`);
  await mkdir(projectDataDirectory, { recursive: true });
  const pythonCommand = process.env.COMMUNITY_RANKING_PYTHON ?? "python";

  await new Promise<void>((resolve, reject) => {
    const child = spawn(pythonCommand, [scriptPath, "--mode", mode], {
      cwd: projectDataDirectory,
      env: { ...process.env, PYTHONUTF8: "1", PYTHONIOENCODING: "utf-8" },
      stdio: ["ignore", "inherit", "inherit"],
      windowsHide: true,
    });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`El motor terminó con código ${code ?? "desconocido"}.`)));
  });
}

async function performRefresh(mode: "incremental" | "full"): Promise<CommunityRankingState> {
  const runningState: CommunityRankingState = { ...await getCommunityRankingState(), lastAttemptAt: new Date().toISOString(), runMode: mode, status: "running", error: null };
  await writeJsonAtomic(statePath, runningState);
  try {
    await runPythonRankingEngine(mode);
    const ranking = await getCommunityRanking();
    await writeJsonAtomic(rankingPath, ranking);
    const completedAt = new Date().toISOString();
    const successState: CommunityRankingState = {
      ...runningState,
      lastSuccessfulRunAt: completedAt,
      lastIncrementalSuccessfulRunAt: mode === "incremental" ? completedAt : runningState.lastIncrementalSuccessfulRunAt,
      lastFullSuccessfulRunAt: mode === "full" ? completedAt : runningState.lastFullSuccessfulRunAt,
      status: "success",
      entries: ranking.length,
    };
    await writeJsonAtomic(statePath, successState);
    return successState;
  } catch (error) {
    const failedState: CommunityRankingState = { ...runningState, status: "failed", error: error instanceof Error ? error.message : "Error desconocido" };
    await writeJsonAtomic(statePath, failedState);
    return failedState;
  }
}

export function isFullCommunityRankingRefreshDue(state: CommunityRankingState, now = Date.now()) {
  const lastFullRun = state.lastFullSuccessfulRunAt ? Date.parse(state.lastFullSuccessfulRunAt) : 0;
  return !lastFullRun || now - lastFullRun >= fullRefreshIntervalMs;
}

export async function refreshCommunityRanking(options: { force?: boolean; mode?: "incremental" | "full" } = {}) {
  if (globalThis.__sotahubRankingRefresh) return globalThis.__sotahubRankingRefresh;
  const mode = options.mode ?? "incremental";
  const state = await getCommunityRankingState();
  const lastRunAt = mode === "full" ? state.lastFullSuccessfulRunAt : state.lastIncrementalSuccessfulRunAt ?? state.lastSuccessfulRunAt;
  const intervalMs = mode === "full" ? fullRefreshIntervalMs : communityRankingIncrementalIntervalMs;
  const lastRun = lastRunAt ? Date.parse(lastRunAt) : 0;
  if (!options.force && Date.now() - lastRun < intervalMs) return state;
  globalThis.__sotahubRankingRefresh = performRefresh(mode).finally(() => { globalThis.__sotahubRankingRefresh = undefined; });
  return globalThis.__sotahubRankingRefresh;
}
