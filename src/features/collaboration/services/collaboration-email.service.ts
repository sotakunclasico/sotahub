import type { CollaborationApplication } from "../collaboration-application.schema";

type SendResult =
  | { ok: true; id: string }
  | { ok: false; reason: "not-configured" | "provider-error" };

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);

export function isCollaborationEmailConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY
    && process.env.COLLABORATION_EMAIL_TO
    && process.env.COLLABORATION_EMAIL_FROM,
  );
}

export async function sendCollaborationApplication(
  application: CollaborationApplication,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.COLLABORATION_EMAIL_TO;
  const from = process.env.COLLABORATION_EMAIL_FROM;

  if (!apiKey || !to || !from) return { ok: false, reason: "not-configured" };

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: application.email,
        subject: `[SotaKun · Colaboración] ${application.title}`,
        text: [
          `Nueva propuesta de colaboración`,
          ``,
          `Nombre: ${application.name}`,
          `Proyecto: ${application.project}`,
          `Email: ${application.email}`,
          `Tipo: ${application.type}`,
          `Enlace: ${application.link || "No indicado"}`,
          `Propuesta: ${application.title}`,
          ``,
          application.message,
        ].join("\n"),
        html: `
          <h1>Nueva propuesta de colaboración</h1>
          <p><strong>Nombre:</strong> ${escapeHtml(application.name)}</p>
          <p><strong>Proyecto:</strong> ${escapeHtml(application.project)}</p>
          <p><strong>Email:</strong> ${escapeHtml(application.email)}</p>
          <p><strong>Tipo:</strong> ${escapeHtml(application.type)}</p>
          <p><strong>Enlace:</strong> ${escapeHtml(application.link || "No indicado")}</p>
          <p><strong>Propuesta:</strong> ${escapeHtml(application.title)}</p>
          <hr>
          <p>${escapeHtml(application.message).replaceAll("\n", "<br>")}</p>
        `,
      }),
    });
  } catch (error) {
    console.error("Collaboration email provider is unreachable.", error instanceof Error ? error.message : "unknown error");
    return { ok: false, reason: "provider-error" };
  }

  if (!response.ok) {
    console.error("Collaboration email provider rejected the request.", response.status);
    return { ok: false, reason: "provider-error" };
  }

  const result = await response.json() as { id?: string };
  return result.id
    ? { ok: true, id: result.id }
    : { ok: false, reason: "provider-error" };
}
