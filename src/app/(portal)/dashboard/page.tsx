import { redirect } from "next/navigation";
import { DashboardShell } from "@/features/dashboard/dashboard-shell";
import { getLinkedYouTubeChannel } from "@/features/connections/youtube/youtube-link.service";
import { auth } from "@/lib/auth";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user.id) redirect("/login?callbackUrl=/dashboard");
  const youtube = await getLinkedYouTubeChannel(session.user.id);
  return <DashboardShell name={session.user.name ?? "miembro"} role={session.user.role} youtube={youtube}/>;
}
