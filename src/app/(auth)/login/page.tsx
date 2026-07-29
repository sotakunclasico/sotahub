import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DiscordLoginForm } from "@/features/auth/discord-login-form";

export const metadata = { title: "Acceder" };

const authErrors: Record<string, string> = {
  AccessDenied: "Discord no autorizó el acceso o la solicitud fue cancelada.",
  Configuration: "La conexión con Discord no está disponible temporalmente.",
  OAuthCallback: "Discord devolvió la autorización, pero no se pudo completar la sesión.",
  OAuthCallbackError: "La comprobación temporal de Discord caducó o se abrió en otro navegador.",
  OAuthSignin: "No se pudo iniciar la conexión segura con Discord.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const errorMessage = error
    ? authErrors[error] ?? "No se pudo completar el acceso con Discord."
    : null;

  return <Card className="p-7 sm:p-9">
    <p className="eyebrow text-center">ACCESO A SOTAKUN</p>
    <h1 className="display-title mt-4 text-center text-4xl text-white">Tu legado continúa</h1>
    <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-slate-400">Conecta tu cuenta de Discord. Si todavía no estás en el servidor, podrás unirte automáticamente y recibir el rol de miembro.</p>
    {errorMessage && <div className="mt-6 border border-[#814735]/60 bg-[#672b20]/15 p-4 text-center" role="alert">
      <AlertTriangle className="mx-auto text-[#d98a73]" size={20}/>
      <p className="mt-3 text-sm leading-6 text-[#d6a08f]">{errorMessage}</p>
      <p className="mt-2 text-xs leading-5 text-[#8f756b]">En móvil, completa todo el proceso en la misma pestaña del navegador. Si se abre la aplicación de Discord, vuelve después a esa misma pestaña.</p>
    </div>}
    <div className="my-8"><DiscordLoginForm/></div>
    <p className="flex items-center justify-center gap-2 text-xs text-slate-600"><ShieldCheck size={14}/> Acceso seguro · Discord OAuth 2.0</p>
  </Card>;
}
