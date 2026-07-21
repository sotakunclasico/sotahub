import { GiveawaysPage } from "@/features/giveaways/components/giveaways-page";
import { GiveawayAdminPanel } from "@/features/giveaways/components/giveaway-admin-panel";
import { getGiveawayCandidates } from "@/features/giveaways/services/giveaway-draw";
import { youtubeService } from "@/features/youtube/youtube.service";
import { auth } from "@/lib/auth";
import { LockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Sorteos · El Camino a los 1000" };

export default async function Page() {
  const [youtube, session] = await Promise.all([youtubeService.getChannel(), auth().catch(() => null)]);
  const isAdmin = session?.user?.role === "ADMIN";
  const candidates = isAdmin ? (await getGiveawayCandidates([])).candidates : [];
  const adminPanel = isAdmin
    ? <GiveawayAdminPanel initialCandidates={candidates} />
    : <Card className="p-7 text-center md:p-10"><LockKeyhole className="mx-auto text-[#a47b43]" size={30}/><Badge className="mt-5">ACCESO PROTEGIDO</Badge><h3 className="mt-4 font-serif text-2xl text-[#dbc39a]">Solo SotaKun puede realizar la extracción</h3><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#817667]">Inicia sesión con la cuenta de Discord configurada como administradora para abrir el censo, gestionar exclusiones y elegir al ganador.</p><Button href="/login" className="mt-6">Acceder como administrador</Button></Card>;
  return <GiveawaysPage youtube={youtube} adminPanel={adminPanel} />;
}
