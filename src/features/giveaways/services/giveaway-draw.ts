import "server-only";

import { createHash, randomInt, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { getCommunityRanking } from "@/features/ranking/services/community-ranking";
import type { GiveawayCandidate, GiveawayDrawResult } from "../giveaway-draw.types";
import { getGiveawayEntryCount } from "../giveaway-rules";
import { nieblaGiveaway } from "../niebla-giveaway.config";

const drawHistoryPath = path.join(process.cwd(), "data", "giveaway-draws.json");
const cloudflareDrawHistoryKey = "giveaways/draw-history.json";

type GiveawayBucketBinding = {
  get(key: string): Promise<{ json(): Promise<unknown> } | null>;
  put(
    key: string,
    value: string,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown>;
};

function canonical(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function getGiveawayCandidates(exclusions: string[]): Promise<{ candidates: GiveawayCandidate[]; totalEntries: number }> {
  const excluded = exclusions.map(canonical).filter(Boolean);
  const ranking = await getCommunityRanking();
  const weighted = ranking
    .map((entry) => ({ username: entry.username, points: entry.points, entries: getGiveawayEntryCount(entry.points), probability: 0 }))
    .filter((entry) => entry.entries > 0 && !excluded.some((value) => canonical(entry.username).includes(value)));
  const totalEntries = weighted.reduce((total, entry) => total + entry.entries, 0);
  return { candidates: weighted.map((entry) => ({ ...entry, probability: totalEntries ? entry.entries / totalEntries * 100 : 0 })), totalEntries };
}

async function getCloudflareGiveawayBucket() {
  if (process.env.SOTAHUB_RUNTIME !== "cloudflare") return null;
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = await getCloudflareContext({ async: true });
  const bucket = (env as typeof env & { RANKING_BUCKET?: GiveawayBucketBinding }).RANKING_BUCKET;
  if (!bucket) throw new Error("El almacenamiento de sorteos no está configurado.");
  return bucket;
}

async function readLocalHistory(): Promise<GiveawayDrawResult[]> {
  try { return JSON.parse(await readFile(drawHistoryPath, "utf8")) as GiveawayDrawResult[]; }
  catch { return []; }
}

async function readCloudflareHistory(bucket: GiveawayBucketBinding): Promise<GiveawayDrawResult[]> {
  const object = await bucket.get(cloudflareDrawHistoryKey);
  if (!object) return [];
  const history = await object.json();
  return Array.isArray(history) ? history as GiveawayDrawResult[] : [];
}

async function saveResult(result: GiveawayDrawResult) {
  const bucket = await getCloudflareGiveawayBucket();
  if (bucket) {
    const history = await readCloudflareHistory(bucket);
    await bucket.put(
      cloudflareDrawHistoryKey,
      `${JSON.stringify([result, ...history], null, 2)}\n`,
      { httpMetadata: { contentType: "application/json; charset=utf-8" } },
    );
    return;
  }
  await mkdir(path.dirname(drawHistoryPath), { recursive: true });
  const temporary = `${drawHistoryPath}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify([result, ...await readLocalHistory()], null, 2)}\n`, "utf8");
  await rename(temporary, drawHistoryPath);
}

export async function runGiveawayDraw(
  title: string,
  exclusions: string[],
  options: { persist?: boolean } = {},
): Promise<GiveawayDrawResult> {
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
    id: randomUUID(), title, createdAt: new Date().toISOString(), persisted: options.persist !== false, winner,
    eligibleUsers: candidates.length, totalEntries, exclusions: appliedExclusions, rankingFingerprint: fingerprint, alternates,
  };
  if (result.persisted) await saveResult(result);
  return result;
}
