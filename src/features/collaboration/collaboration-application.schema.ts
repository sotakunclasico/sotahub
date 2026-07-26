import { z } from "zod";

export const collaborationTypes = [
  "Artista o ilustrador",
  "Tattooer",
  "Marca o producto",
  "Creador de contenido",
  "Evento o comunidad",
  "Otro",
] as const;

export const collaborationApplicationSchema = z.object({
  name: z.string().trim().min(2, "Indica tu nombre.").max(80),
  project: z.string().trim().min(2, "Indica el nombre de tu proyecto.").max(100),
  email: z.email("Introduce un email válido.").max(160),
  type: z.enum(collaborationTypes),
  link: z.union([z.literal(""), z.url("Introduce una URL completa, incluido https://.")]).default(""),
  title: z.string().trim().min(5, "Resume la propuesta en al menos 5 caracteres.").max(120),
  message: z.string().trim().min(40, "Cuéntanos un poco más sobre la propuesta.").max(3000),
  accepted: z.literal("on", { error: "Debes aceptar el tratamiento de los datos para enviar la propuesta." }),
  website: z.string().max(0, "Solicitud no válida.").default(""),
  turnstileToken: z.string().max(2048).default(""),
});

export type CollaborationApplication = z.infer<typeof collaborationApplicationSchema>;
