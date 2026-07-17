import { MessageCircle } from "lucide-react";
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
export function DiscordLoginForm(){return <form action={async()=>{"use server";await signIn("discord",{redirectTo:"/dashboard"})}}><Button type="submit" size="lg" className="w-full"><MessageCircle/> Continuar con Discord</Button></form>}
