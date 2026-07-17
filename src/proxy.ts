export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: ["/perfil/:path*", "/dashboard/:path*", "/settings/:path*", "/admin/:path*"],
};
