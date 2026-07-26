import { NextResponse } from "next/server";
import { collaborationApplicationSchema } from "@/features/collaboration/collaboration-application.schema";
import { sendCollaborationApplication } from "@/features/collaboration/services/collaboration-email.service";
import { validateTurnstileToken } from "@/features/collaboration/services/turnstile.service";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ message: "Origen de la solicitud no válido." }, { status: 403 });
  }

  const formData = await request.formData();
  const parsed = collaborationApplicationSchema.safeParse({
    name: formData.get("name"),
    project: formData.get("project"),
    email: formData.get("email"),
    type: formData.get("type"),
    link: formData.get("link") ?? "",
    title: formData.get("title"),
    message: formData.get("message"),
    accepted: formData.get("accepted"),
    website: formData.get("website") ?? "",
    turnstileToken: formData.get("cf-turnstile-response") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json({
      message: parsed.error.issues[0]?.message ?? "Revisa los campos del formulario.",
    }, { status: 400 });
  }

  const remoteIp = request.headers.get("cf-connecting-ip") ?? undefined;
  const isHuman = await validateTurnstileToken(parsed.data.turnstileToken, remoteIp);
  if (!isHuman) {
    return NextResponse.json({ message: "No hemos podido validar la protección antispam. Inténtalo de nuevo." }, { status: 400 });
  }

  const result = await sendCollaborationApplication(parsed.data);
  if (!result.ok) {
    const message = result.reason === "not-configured"
      ? "El buzón de propuestas todavía no está configurado."
      : "No hemos podido enviar la propuesta. Inténtalo de nuevo más tarde.";
    return NextResponse.json({ message }, { status: 503 });
  }

  return NextResponse.json({ message: "Propuesta enviada. Gracias por querer crear algo con SotaKun." });
}
