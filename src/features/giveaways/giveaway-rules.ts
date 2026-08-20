export const giveawayMinimumPoints = 5;
export const giveawayPointsPerEntry = 5;

export function getGiveawayEntryCount(points: number) {
  if (!Number.isFinite(points) || points < giveawayMinimumPoints) return 0;
  return Math.floor(points / giveawayPointsPerEntry);
}
