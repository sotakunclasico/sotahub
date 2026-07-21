export type Role = "ADMIN" | "MODERATOR" | "USER";

export type NavItem = { label: string; href: string };

export type RankingEntry = {
  position: number;
  name: string;
  points: number;
  badge: string;
  accent: string;
};
