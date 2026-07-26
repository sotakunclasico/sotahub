import type { NavItem } from "@/types/domain";

export const siteConfig = {
  name: "SotaKun",
  description: "El nexo oficial de la comunidad SotaKun.",
  navigation: [
    { label: "Comunidad", href: "/community" },
    { label: "Ranking", href: "/ranking" },
    { label: "Sorteos", href: "/sorteos" },
    { label: "Merch", href: "/merch" },
    { label: "Colaboraciones", href: "/colaboradores" },
    { label: "Certificados", href: "/certificados" },
    { label: "Noticias", href: "/noticias" },
  ] satisfies NavItem[],
  social: {
    discord: "https://discord.com",
    twitch: "https://twitch.tv",
    youtube: "https://www.youtube.com/channel/UCJ-vmk0-j_GC8bB_RK2vA9A",
    youtubeSubscribe: "https://www.youtube.com/channel/UCJ-vmk0-j_GC8bB_RK2vA9A?sub_confirmation=1",
  },
} as const;
