import type { RankingEntry } from "@/types/domain";
import { getCommunityRanking } from "@/features/ranking/services/community-ranking";

export interface ContentService {
  getRanking(): Promise<RankingEntry[]>;
}

export const contentService: ContentService = {
  async getRanking() {
    const ranking = await getCommunityRanking();
    const podium = [
      { badge: "Leyenda", accent: "#FFD54A" },
      { badge: "Élite", accent: "#C7D2FE" },
      { badge: "Veterano", accent: "#FB923C" },
    ] as const;

    return ranking.slice(0, 3).map((entry, index) => ({
      position: index + 1,
      name: entry.username,
      points: entry.points,
      ...podium[index],
    }));
  },
};
