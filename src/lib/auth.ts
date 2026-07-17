import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Discord],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    authorized: async ({ auth: session }) => Boolean(session),
    jwt: async ({ token }) => ({ ...token, role: token.role ?? "USER" }),
    session: async ({ session, token }) => ({ ...session, user: { ...session.user, id: token.sub ?? "", role: token.role ?? "USER" } }),
  },
});
