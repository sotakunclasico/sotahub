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
  persisted: boolean;
  winner: GiveawayCandidate;
  eligibleUsers: number;
  totalEntries: number;
  exclusions: string[];
  rankingFingerprint: string;
  alternates: GiveawayCandidate[];
}
