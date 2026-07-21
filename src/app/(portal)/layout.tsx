import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Navbar } from "@/layouts/navbar";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user.id) redirect("/login");
  return <div className="min-h-screen"><Navbar/><main id="main-content" className="shell py-10">{children}</main></div>;
}
