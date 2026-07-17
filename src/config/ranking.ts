export const defaultRankingExclusions = [
  "sotakun",
  "joseantoniodiazllamas",
  "streamelement",
] as const;

function canonicalizeUsername(username: string) {
  return username
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function isRankingExcluded(username: string) {
  const configuredExclusions = process.env.COMMUNITY_RANKING_EXCLUDED_USERS
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean) ?? [];
  const canonicalUsername = canonicalizeUsername(username);
  return [...defaultRankingExclusions, ...configuredExclusions]
    .map(canonicalizeUsername)
    .some((excluded) => canonicalUsername.includes(excluded));
}
