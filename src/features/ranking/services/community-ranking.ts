import "server-only";

import { spawn } from "node:child_process";
import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
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
  status: z.enum(["idle", "running", "success", "failed"]),
  entries: z.number().int().nonnegative(),
  error: z.string().nullable(),
});

export type CommunityRankingEntry = z.infer<typeof rankingEntrySchema>;
export type CommunityRankingState = z.infer<typeof stateSchema>;

const rankingPath = path.join(process.cwd(), "data", "community_ranking.json");
const partialRankingPath = path.join(process.cwd(), "data", "community_ranking.partial.json");
const statePath = path.join(process.cwd(), "data", "community-ranking-state.json");
const projectDataDirectory = path.dirname(rankingPath);
const legacyRankingPath = "C:\\SotakunJson\\V_Codex\\community_ranking.json";
const bundledScriptPath = path.join(process.cwd(), "scripts", "community-ranking", "community_ranking.py");
const refreshIntervalMs = 24 * 60 * 60 * 1_000;

const defaultState: CommunityRankingState = {
  lastAttemptAt: null,
  lastSuccessfulRunAt: null,
  status: "idle",
  entries: 0,
  error: null,
};

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
  if (!(await fileExists(statePath))) return defaultState;
  try { return stateSchema.parse(JSON.parse(await readFile(statePath, "utf8"))); }
  catch { return defaultState; }
}

export async function getCommunityRanking(): Promise<CommunityRankingEntry[]> {
  const snapshots = await Promise.all([rankingPath, partialRankingPath, legacyRankingPath].map(async (source) => {
    if (!(await fileExists(source))) return [];
    try { return rankingSchema.parse(JSON.parse(await readFile(source, "utf8"))); } catch { return []; }
  }));
  return mergeRankingSnapshots(...snapshots);
}

function mergeRankingSnapshots(...snapshots: CommunityRankingEntry[][]) {
  const users = new Map<string, CommunityRankingEntry>();
  for (const snapshot of snapshots) for (const entry of snapshot) {
    if (isRankingExcluded(entry.username)) continue;
    const previous = users.get(entry.username);
    const comments = Math.max(previous?.comments ?? 0, entry.comments);
    const liveMessages = Math.max(previous?.live_messages ?? 0, entry.live_messages);
    const uniqueVideos = Math.max(previous?.unique_videos ?? 0, entry.unique_videos);
    const uniqueLives = Math.max(previous?.unique_lives ?? 0, entry.unique_lives);
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

async function runPythonRankingEngine() {
  const configuredScriptPath = process.env.COMMUNITY_RANKING_SCRIPT_PATH;
  const scriptPath = configuredScriptPath
    ? (path.isAbsolute(configuredScriptPath) ? configuredScriptPath : path.resolve(configuredScriptPath))
    : bundledScriptPath;
  if (!path.isAbsolute(scriptPath) || path.extname(scriptPath).toLowerCase() !== ".py") {
    throw new Error("COMMUNITY_RANKING_SCRIPT_PATH debe apuntar a un archivo Python absoluto.");
  }
  if (!(await fileExists(scriptPath))) throw new Error(`No se encuentra el motor de ranking: ${scriptPath}`);
  await mkdir(projectDataDirectory, { recursive: true });
  const pythonCommand = process.env.COMMUNITY_RANKING_PYTHON ?? "python";

  await new Promise<void>((resolve, reject) => {
    const child = spawn(pythonCommand, [scriptPath], {
      cwd: projectDataDirectory,
      env: { ...process.env, PYTHONUTF8: "1", PYTHONIOENCODING: "utf-8" },
      stdio: ["ignore", "inherit", "inherit"],
      windowsHide: true,
    });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`El motor terminó con código ${code ?? "desconocido"}.`)));
  });
}

async function performRefresh(): Promise<CommunityRankingState> {
  const runningState: CommunityRankingState = { ...await getCommunityRankingState(), lastAttemptAt: new Date().toISOString(), status: "running", error: null };
  await writeJsonAtomic(statePath, runningState);
  try {
    await runPythonRankingEngine();
    const ranking = await getCommunityRanking();
    await writeJsonAtomic(rankingPath, ranking);
    const successState: CommunityRankingState = { ...runningState, lastSuccessfulRunAt: new Date().toISOString(), status: "success", entries: ranking.length };
    await writeJsonAtomic(statePath, successState);
    return successState;
  } catch (error) {
    const failedState: CommunityRankingState = { ...runningState, status: "failed", error: error instanceof Error ? error.message : "Error desconocido" };
    await writeJsonAtomic(statePath, failedState);
    return failedState;
  }
}

export async function refreshCommunityRanking(options: { force?: boolean } = {}) {
  if (globalThis.__sotahubRankingRefresh) return globalThis.__sotahubRankingRefresh;
  const state = await getCommunityRankingState();
  const lastRun = state.lastSuccessfulRunAt ? Date.parse(state.lastSuccessfulRunAt) : 0;
  if (!options.force && Date.now() - lastRun < refreshIntervalMs) return state;
  globalThis.__sotahubRankingRefresh = performRefresh().finally(() => { globalThis.__sotahubRankingRefresh = undefined; });
  return globalThis.__sotahubRankingRefresh;
}
