import type { Metadata, Viewport } from "next";
import { AppProvider } from "@/providers/app-provider";
import "@/styles/globals.css";
export const metadata: Metadata={metadataBase:new URL(process.env.NEXT_PUBLIC_APP_URL??"http://localhost:3000"),title:{default:"SotaKun · Tu comunidad, tu legado",template:"%s · SotaKun"},description:"La plataforma oficial de la comunidad SotaKun.",openGraph:{title:"SotaKun",description:"Tu comunidad. Tu legado.",type:"website"}};
export const viewport: Viewport={themeColor:"#0A0F1E",colorScheme:"dark"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body><AppProvider>{children}</AppProvider></body></html>}
