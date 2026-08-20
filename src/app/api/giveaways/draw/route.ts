import { z } from "zod";
import { auth } from "@/lib/auth";
import { runGiveawayDraw } from "@/features/giveaways/services/giveaway-draw";

export const runtime = "nodejs";

const requestSchema = z.object({
  title: z.string().trim().min(3).max(120),
  exclusions: z.array(z.string().trim().min(1).max(100)).max(100),
  persist: z.boolean().default(true),
  confirmation: z.string(),
}).superRefine((data, context) => {
  if (data.persist && data.confirmation !== "REALIZAR SORTEO") {
    context.addIssue({ code: "custom", path: ["confirmation"], message: "Confirmación incorrecta." });
  }
});

export async function POST(request: Request) {
  const session = await auth().catch(() => null);
  if (session?.user?.role !== "ADMIN") return Response.json({ error: "Acceso reservado a administradores." }, { status: 403 });
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Datos de sorteo no válidos." }, { status: 400 });
  try {
    return Response.json(await runGiveawayDraw(
      parsed.data.title,
      parsed.data.exclusions,
      { persist: parsed.data.persist },
    ));
  }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No se pudo realizar el sorteo." }, { status: 500 }); }
}
