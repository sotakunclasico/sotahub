import "server-only";

import { createHash, randomInt, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { getCommunityRanking } from "@/features/ranking/services/community-ranking";
import type { GiveawayCandidate, GiveawayDrawResult } from "../giveaway-draw.types";
import { nieblaGiveaway } from "../niebla-giveaway.config";

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
  const remainingCandidates = [...candidates];

  function selectCandidate() {
    const remainingEntries = remainingCandidates.reduce((total, candidate) => total + candidate.entries, 0);
    if (remainingEntries < 1) return undefined;
    const selectedTicket = randomInt(remainingEntries);
    let cursor = 0;
    const selectedIndex = remainingCandidates.findIndex((candidate) => {
      cursor += candidate.entries;
      return selectedTicket < cursor;
    });
    if (selectedIndex < 0) return undefined;
    return remainingCandidates.splice(selectedIndex, 1)[0];
  }

  const winner = selectCandidate();
  if (!winner) throw new Error("No se pudo seleccionar un ganador.");
  const alternates = Array.from(
    { length: Math.min(nieblaGiveaway.alternateWinners, remainingCandidates.length) },
    () => selectCandidate(),
  ).filter((candidate): candidate is GiveawayCandidate => Boolean(candidate));
  const fingerprint = createHash("sha256").update(JSON.stringify(candidates)).digest("hex");
  const appliedExclusions = [...new Set(exclusions)];
  const result: GiveawayDrawResult = {
    id: randomUUID(), title, createdAt: new Date().toISOString(), winner,
    eligibleUsers: candidates.length, totalEntries, exclusions: appliedExclusions, rankingFingerprint: fingerprint, alternates,
  };
  await saveResult(result);
  return result;
}
