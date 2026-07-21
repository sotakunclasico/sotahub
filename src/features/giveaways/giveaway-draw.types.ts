export interface GiveawayCandidate {
  username: string;
  points: number;
  entries: number;
  probability: number;
}

export interface GiveawayDrawResult {
  id: string;
  title: string;
  createdAt: string;
  winner: GiveawayCandidate;
  eligibleUsers: number;
  totalEntries: number;
  exclusions: string[];
  rankingFingerprint: string;
}
