import "next-auth";
import type { DefaultSession } from "next-auth";
import type { Role } from "@/types/domain";

declare module "next-auth" {
  interface Session { user: DefaultSession["user"] & { id: string; role: Role } }
}

declare module "next-auth/jwt" { interface JWT { role?: Role } }
