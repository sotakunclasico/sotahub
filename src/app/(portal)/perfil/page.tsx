import { redirect } from "next/navigation";
import { BadgeCheck, History, LayoutDashboard, Shield, Trophy, Tv } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { getLinkedYouTubeChannel } from "@/features/connections/youtube/youtube-link.service";
import { auth } from "@/lib/auth";

export const metadata = { title: "Perfil" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user.id) redirect("/login?callbackUrl=/perfil");
  const youtube = await getLinkedYouTubeChannel(session.user.id);
  const name = session.user.name ?? "Miembro SotaKun";
  const canAccessAdmin = session.user.role === "ADMIN";

  return <>
    <Card className="ornate-frame overflow-hidden p-7 md:p-10">
      <div className="flex flex-col gap-7 sm:flex-row sm:items-center">
        <Avatar name={name} className="size-24 text-2xl"/>
        <div className="flex-1"><Badge>{session.user.role}</Badge><h1 className="display-title mt-4 text-4xl text-[#e0c89e] md:text-5xl">{name}</h1><p className="mt-2 text-sm text-[#857969]">Identidad protegida mediante Discord.</p></div>
        <div className="flex flex-col gap-3 sm:items-end">
          {canAccessAdmin ? <Button href="/admin"><LayoutDashboard size={16}/>Administración</Button> : null}
          <Button href="/settings" variant="secondary">Gestionar conexiones</Button>
          <SignOutButton/>
        </div>
      </div>
    </Card>
    <div className="mt-6 grid gap-5 md:grid-cols-3">
      <Card className="p-6"><Shield className="text-[#c69a55]"/><h2 className="mt-5 font-serif text-xl text-[#ddc59b]">Identidad</h2><p className="mt-2 text-sm leading-6 text-[#807565]">Cuenta Discord conectada con rol {session.user.role}.</p></Card>
      <Card className="p-6">{youtube ? <BadgeCheck className="text-[#8fa477]"/> : <Tv className="text-[#c69a55]"/>}<h2 className="mt-5 font-serif text-xl text-[#ddc59b]">YouTube</h2><p className="mt-2 text-sm leading-6 text-[#807565]">{youtube ? `Canal confirmado: ${youtube.title}.` : "Canal todavía sin vincular."}</p></Card>
      <Card className="p-6"><Trophy className="text-[#c69a55]"/><h2 className="mt-5 font-serif text-xl text-[#ddc59b]">Ranking</h2><p className="mt-2 text-sm leading-6 text-[#807565]">{youtube ? "Identidad lista para la futura reconciliación." : "Vincula YouTube antes de asociar una posición."}</p></Card>
    </div>
    <Card className="mt-6 flex gap-4 p-6"><History className="mt-1 shrink-0 text-[#9f7d4c]"/><p className="text-sm leading-7 text-[#827768]">El historial personal permanecerá vacío hasta que exista una asociación verificable. SotaHub no atribuirá actividad por coincidencias aproximadas de nombre.</p></Card>
  </>;
}
