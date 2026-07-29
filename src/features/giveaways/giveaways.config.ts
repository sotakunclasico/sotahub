export interface GiveawayMilestone {
  subscribers: number;
  prize: string;
}

export const giveawayMilestones: GiveawayMilestone[] = [
  { subscribers: 300, prize: "1 mes de World of Warcraft" },
  { subscribers: 400, prize: "1 mes de World of Warcraft" },
  { subscribers: 500, prize: "1 mes de World of Warcraft" },
  { subscribers: 750, prize: "2 meses de World of Warcraft" },
  { subscribers: 1000, prize: "World of Warcraft: Midnight — edición básica" },
];

export const giveawayHistory = [
  {
    milestone: 300,
    label: "300 suscriptores",
    title: "Hito de 300 suscriptores",
    prize: "1 mes de World of Warcraft",
    status: "completed",
    winner: "Mariano",
    username: "@marianoreppc6136",
    note: "Ganador del sorteo y actual número 1 del ranking de participación.",
  },
  {
    milestone: 350,
    label: "Sorteo especial",
    title: "Sorteo especial SotaKun × Niebla Tattooer",
    prize: "Pack de merchandising o sesión con Niebla Tattooer",
    status: "pending",
    winner: null,
    username: "@niebla_tattooer",
    note: "Participación abierta. Sorteo en directo el 15 de agosto de 2026 a las 22:00, hora de Madrid. El ganador elegirá una de las dos opciones.",
  },
] as const;

export const pointsRules = [
  { label: "Comentar un vídeo", points: "+2", detail: "Participación mediante un comentario válido." },
  { label: "Comentar un vídeo diferente", points: "+3", detail: "Se premia descubrir y participar en contenido distinto." },
  { label: "Mensaje en directo", points: "+0,1", detail: "Por cada mensaje válido; el spam no aporta valor." },
  { label: "Participar en otro directo", points: "+1", detail: "Bonificación por cada directo diferente." },
] as const;

export function getCurrentMilestone(subscribers: number): GiveawayMilestone {
  return giveawayMilestones.find((milestone) => milestone.subscribers > subscribers)
    ?? giveawayMilestones[giveawayMilestones.length - 1];
}

export function getMilestoneProgress(subscribers: number, target: number): number {
  const previous = [...giveawayMilestones].reverse().find((milestone) => milestone.subscribers < target)?.subscribers ?? 0;
  return Math.min(100, Math.max(0, ((subscribers - previous) / (target - previous)) * 100));
}
