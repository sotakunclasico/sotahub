import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SotaKun · Comunidad oficial",
    short_name: "SotaKun",
    description: "Ranking, sorteos, contenido y comunidad oficial de SotaKun.",
    start_url: "/",
    display: "standalone",
    background_color: "#080909",
    theme_color: "#0A0F1E",
    icons: [{ src: "/assets/sotakun/logo-mark.png", sizes: "512x512", type: "image/png" }],
  };
}
