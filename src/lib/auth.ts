import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { ensureDiscordCommunityMember } from "@/features/auth/services/discord-community";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Discord({ authorization: { params: { scope: "identify email guilds.join" } } })],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    signIn: async ({ account, profile }) => {
      if (account?.provider !== "discord" || !account.access_token || !profile?.id) return false;
      await ensureDiscordCommunityMember(String(profile.id), account.access_token);
      return true;
    },
    authorized: async ({ auth: session, request }) => {
      if (!session) return false;
      if (request.nextUrl.pathname.startsWith("/admin")) return session.user.role === "ADMIN";
      return true;
    },
    jwt: async ({ token, account, profile }) => {
      const adminIds = process.env.ADMIN_DISCORD_IDS?.split(",").map((id) => id.trim()).filter(Boolean) ?? [];
      const bootstrapAdminUsername = process.env.ADMIN_DISCORD_USERNAME?.trim().toLowerCase();
      const discordUsername = typeof profile?.username === "string" ? profile.username.toLowerCase() : null;
      const isAdmin = token.role === "ADMIN"
        || Boolean(token.sub && adminIds.includes(token.sub))
        || Boolean(account?.provider === "discord" && bootstrapAdminUsername && discordUsername === bootstrapAdminUsername);
      return { ...token, role: isAdmin ? "ADMIN" : "USER" };
    },
    session: async ({ session, token }) => ({ ...session, user: { ...session.user, id: token.sub ?? "", role: token.role ?? "USER" } }),
  },
});
