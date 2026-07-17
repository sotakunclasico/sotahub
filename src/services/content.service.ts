import type { ContentCard, RankingEntry } from "@/types/domain";

export interface ContentService {
  getLatestVideos(): Promise<ContentCard[]>;
  getRanking(): Promise<RankingEntry[]>;
}

export const contentService: ContentService = {
  async getLatestVideos() {
    return [
      { eyebrow: "NUEVO VÍDEO", title: "El secreto mejor guardado de Santuario", description: "Build, estrategia y una noche que acabó haciendo historia.", meta: "18:42 · Hace 2 horas", accent: "blue" },
      { eyebrow: "MEJORES MOMENTOS", title: "La raid imposible", description: "La comunidad se enfrentó al reto más brutal de la temporada.", meta: "12:08 · Ayer", accent: "cyan" },
      { eyebrow: "GUÍA", title: "De cero a leyenda", description: "Todo lo que necesitas para dominar la nueva temporada.", meta: "24:16 · Hace 3 días", accent: "gold" },
    ];
  },
  async getRanking() {
    return [
      { position: 1, name: "KaelStorm", points: 18420, badge: "Fundador", accent: "#FFD54A" },
      { position: 2, name: "NyxValkyrie", points: 16980, badge: "Élite", accent: "#C7D2FE" },
      { position: 3, name: "RagnarBlue", points: 15730, badge: "Veterano", accent: "#FB923C" },
    ];
  },
};
