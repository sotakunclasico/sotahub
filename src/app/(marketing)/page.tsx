import { Hero } from "@/components/ui/hero";
import { HomeSections } from "@/features/home/components/home-sections";
import { youtubeService } from "@/features/youtube/youtube.service";

export default async function Home() {
  const youtube = await youtubeService.getChannel();
  return <><Hero youtube={youtube} /><HomeSections youtube={youtube} /></>;
}
