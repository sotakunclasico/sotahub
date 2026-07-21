import "server-only";

import { createHash, randomInt, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { getCommunityRanking } from "@/features/ranking/services/community-ranking";
import type { GiveawayCandidate, GiveawayDrawResult } from "../giveaway-draw.types";

const drawHistoryPath = path.join(process.cwd(), "data", "giveaway-draws.json");
const minimumPoints = 5;

function canonical(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function getGiveawayCandidates(exclusions: string[]): Promise<{ candidates: GiveawayCandidate[]; totalEntries: number }> {
  const excluded = exclusions.map(canonical).filter(Boolean);
  const ranking = await getCommunityRanking();
  const weighted = ranking
    .filter((entry) => entry.points > minimumPoints && !excluded.some((value) => canonical(entry.username).includes(value)))
    .map((entry) => ({ username: entry.username, points: entry.points, entries: Math.floor(entry.points / minimumPoints), probability: 0 }));
  const totalEntries = weighted.reduce((total, entry) => total + entry.entries, 0);
  return { candidates: weighted.map((entry) => ({ ...entry, probability: totalEntries ? entry.entries / totalEntries * 100 : 0 })), totalEntries };
}

async function readHistory(): Promise<GiveawayDrawResult[]> {
  try { return JSON.parse(await readFile(drawHistoryPath, "utf8")) as GiveawayDrawResult[]; }
  catch { return []; }
}

async function saveResult(result: GiveawayDrawResult) {
  await mkdir(path.dirname(drawHistoryPath), { recursive: true });
  const temporary = `${drawHistoryPath}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify([result, ...await readHistory()], null, 2)}\n`, "utf8");
  await rename(temporary, drawHistoryPath);
}

export async function runGiveawayDraw(title: string, exclusions: string[]): Promise<GiveawayDrawResult> {
  const { candidates, totalEntries } = await getGiveawayCandidates(exclusions);
  if (!candidates.length || totalEntries < 1) throw new Error("No hay participantes elegibles.");
  const selectedTicket = randomInt(totalEntries);
  let cursor = 0;
  const winner = candidates.find((candidate) => {
    cursor += candidate.entries;
    return selectedTicket < cursor;
  });
  if (!winner) throw new Error("No se pudo seleccionar un ganador.");
  const fingerprint = createHash("sha256").update(JSON.stringify(candidates)).digest("hex");
  const result: GiveawayDrawResult = {
    id: randomUUID(), title, createdAt: new Date().toISOString(), winner,
    eligibleUsers: candidates.length, totalEntries, exclusions: [...new Set(exclusions)], rankingFingerprint: fingerprint,
  };
  await saveResult(result);
  return result;
}
