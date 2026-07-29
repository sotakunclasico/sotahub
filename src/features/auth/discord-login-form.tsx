"use client";

import { useState } from "react";
import { LoaderCircle, MessageCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function DiscordLoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn("discord", { redirectTo: "/dashboard" });
    } catch {
      setError("No se pudo abrir Discord. Comprueba la conexión e inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return <form onSubmit={login}>
    <Button type="submit" size="lg" className="w-full" disabled={loading}>
      {loading ? <LoaderCircle className="animate-spin" size={19}/> : <MessageCircle size={19}/>}
      {loading ? "Abriendo Discord…" : "Continuar con Discord"}
    </Button>
    {error && <p className="mt-4 text-center text-sm leading-6 text-[#d98a73]" role="alert">{error}</p>}
  </form>;
}
