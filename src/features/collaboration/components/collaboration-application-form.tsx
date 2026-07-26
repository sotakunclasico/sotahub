"use client";

import Script from "next/script";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { collaborationTypes } from "../collaboration-application.schema";

type FormState = { kind: "idle" | "loading" | "success" | "error"; message?: string };

const fieldClassName = "mt-2 min-h-12 w-full border border-[#725633]/60 bg-black/45 px-4 text-sm text-[#d6c09c] outline-none transition placeholder:text-[#625b50] focus:border-[#c0914e] focus:ring-1 focus:ring-[#c0914e]/30 disabled:opacity-50";

export function CollaborationApplicationForm({
  configured,
  turnstileSiteKey,
}: {
  configured: boolean;
  turnstileSiteKey?: string;
}) {
  const [state, setState] = useState<FormState>({ kind: "idle" });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState({ kind: "loading" });

    try {
      const response = await fetch("/api/collaborations/apply", {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message ?? "No hemos podido enviar la propuesta.");

      form.reset();
      setState({ kind: "success", message: result.message });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "No hemos podido enviar la propuesta.",
      });
    }
  }

  const disabled = state.kind === "loading" || !configured;

  return <form onSubmit={submit} className="grid gap-6" noValidate>
    {turnstileSiteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive"/>}
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="text-sm text-[#aa9a80]">Tu nombre
        <input className={fieldClassName} name="name" autoComplete="name" minLength={2} maxLength={80} required disabled={disabled}/>
      </label>
      <label className="text-sm text-[#aa9a80]">Proyecto, marca o nombre artístico
        <input className={fieldClassName} name="project" autoComplete="organization" minLength={2} maxLength={100} required disabled={disabled}/>
      </label>
      <label className="text-sm text-[#aa9a80]">Email de contacto
        <input className={fieldClassName} name="email" type="email" autoComplete="email" maxLength={160} required disabled={disabled}/>
      </label>
      <label className="text-sm text-[#aa9a80]">Tipo de colaboración
        <select className={fieldClassName} name="type" required defaultValue="" disabled={disabled}>
          <option value="" disabled>Selecciona una opción</option>
          {collaborationTypes.map((type) => <option value={type} key={type}>{type}</option>)}
        </select>
      </label>
    </div>
    <label className="text-sm text-[#aa9a80]">Web, portfolio o red social
      <input className={fieldClassName} name="link" type="url" inputMode="url" placeholder="https://" disabled={disabled}/>
    </label>
    <label className="text-sm text-[#aa9a80]">Título de la propuesta
      <input className={fieldClassName} name="title" minLength={5} maxLength={120} placeholder="Una frase que resuma la idea" required disabled={disabled}/>
    </label>
    <label className="text-sm text-[#aa9a80]">Cuéntanos la idea
      <textarea className={`${fieldClassName} min-h-44 resize-y py-4 leading-7`} name="message" minLength={40} maxLength={3000} placeholder="Qué quieres crear, qué aportarías y por qué encaja con la comunidad de SotaKun." required disabled={disabled}/>
    </label>
    <label className="sr-only" aria-hidden="true">No rellenar
      <input name="website" tabIndex={-1} autoComplete="off"/>
    </label>
    <label className="flex items-start gap-3 text-xs leading-6 text-[#847968]">
      <input className="mt-1 accent-[#b88a43]" type="checkbox" name="accepted" required disabled={disabled}/>
      <span>Acepto que SotaKun utilice estos datos únicamente para estudiar y responder a esta propuesta de colaboración.</span>
    </label>
    {turnstileSiteKey && <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="dark" data-action="collaboration_application"/>}

    {!configured && <div className="border border-[#8c6334]/50 bg-[#9a6425]/10 p-4 text-sm leading-6 text-[#c5a977]">
      El formulario ya está preparado, pero el buzón privado todavía no está conectado. Se habilitará en cuanto se configure el remitente y el email de destino.
    </div>}
    {state.kind === "error" && <p className="border border-[#7f3b2e]/60 bg-[#7f2e21]/15 p-4 text-sm text-[#dc8d79]" role="alert">{state.message}</p>}
    {state.kind === "success" && <p className="flex items-center gap-3 border border-[#536d42]/60 bg-[#4c6a38]/15 p-4 text-sm text-[#a9c68f]" role="status"><CheckCircle2 size={18}/>{state.message}</p>}

    <Button type="submit" size="lg" className="w-full sm:w-fit" disabled={disabled}>
      {state.kind === "loading" ? <LoaderCircle className="animate-spin" size={17}/> : <Send size={17}/>}
      {state.kind === "loading" ? "Enviando…" : "Enviar propuesta"}
    </Button>
  </form>;
}
