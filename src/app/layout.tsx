import type { Metadata, Viewport } from "next";
import { AppProvider } from "@/providers/app-provider";
import "@/styles/globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: "SotaKun",
  title: { default: "SotaKun · Tu comunidad, tu legado", template: "%s · SotaKun" },
  description: "La plataforma oficial de la comunidad SotaKun: vídeos, ranking, sorteos y piezas certificadas.",
  keywords: ["SotaKun", "gaming", "YouTube", "comunidad", "ranking", "sorteos"],
  creator: "SotaKun",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "SotaKun · Tu comunidad, tu legado",
    description: "Vídeos, ranking, sorteos y comunidad oficial de SotaKun.",
    type: "website",
    locale: "es_ES",
    siteName: "SotaKun",
    url: "/",
  },
  twitter: { card: "summary", title: "SotaKun", description: "Tu comunidad. Tu legado." },
};

export const viewport: Viewport = { themeColor: "#0A0F1E", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body><a className="skip-link" href="#main-content">Saltar al contenido</a><AppProvider>{children}</AppProvider></body></html>;
}
