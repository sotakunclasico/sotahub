import { CommunityRankingPage } from "@/features/ranking/components/community-ranking-page";
import { auth } from "@/lib/auth";
export const metadata={title:"Ranking"};
export const dynamic = "force-dynamic";
export default async function Page(){
  const session = await auth().catch(() => null);
  return <CommunityRankingPage showAdminControls={session?.user?.role === "ADMIN"}/>;
}
