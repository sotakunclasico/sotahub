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

export const highestConfirmedMilestone = 400;

export const giveawayHistory = [
  {
    milestone: 300,
    label: "300 suscriptores",
    title: "Hito de 300 suscriptores",
    prize: "1 mes de World of Warcraft",
    status: "completed",
    winner: "Mariano",
    username: "@marianoreppc6136",
    alternates: [],
    note: "Ganador del sorteo y actual número 1 del ranking de participación.",
  },
  {
    milestone: 400,
    label: "400 suscriptores",
    title: "Hito de 400 suscriptores",
    prize: "1 mes de World of Warcraft",
    status: "completed",
    winner: "franciscorodriguez-p8k",
    username: "@franciscorodriguez-p8k",
    alternates: ["@segundo.1", "@ghelsonoviedo", "@afroosamuray"],
    note: "La extracción realizada el 23 de agosto de 2026 seleccionó a @franciscorodriguez-p8k entre 79 usuarios elegibles y 177 participaciones. Tras la resolución final, el premio fue entregado a Afro Gaming.",
    fulfillment: {
      status: "delivered",
      recipient: "Afro Gaming",
      username: "@afroosamuray",
      reward: "Jump King",
      evidenceImage: "/assets/giveaways/400-prize-delivered.webp",
      evidenceAlt: "Comprobante de entrega del premio del sorteo de 400 suscriptores a Afro Gaming, que eligió Jump King",
    },
  },
  {
    milestone: 500,
    label: "500 suscriptores",
    title: "Hito de 500 suscriptores",
    prize: "1 mes de World of Warcraft",
    status: "pending",
    winner: null,
    username: null,
    alternates: [],
    note: "Próximo sorteo del Camino a los 1000. Se celebrará cuando el canal alcance los 500 suscriptores.",
  },
  {
    milestone: 350,
    label: "Sorteo especial",
    title: "Sorteo especial SotaKun × Niebla Tattooer",
    prize: "Pack de merchandising o sesión con Niebla Tattooer",
    status: "completed",
    winner: "Mariano",
    username: "@marianoreppc6136",
    alternates: ["@gabrielduarte766", "@simonkofoed1826", "@kuroi448"],
    note: "Sorteo realizado el 31 de agosto de 2026 a las 22:01, hora de Madrid, con 81 usuarios elegibles y 183 participaciones. El ganador tenía 204,4 puntos y 40 participaciones.",
  },
] as const;

export const pointsRules = [
  { label: "Comentar un vídeo", points: "+2", detail: "Participación mediante un comentario válido." },
  { label: "Comentar un vídeo diferente", points: "+3", detail: "Se premia descubrir y participar en contenido distinto." },
  { label: "Mensaje en directo", points: "+0,1", detail: "Por cada mensaje válido; el spam no aporta valor." },
  { label: "Participar en otro directo", points: "+1", detail: "Bonificación por cada directo diferente." },
] as const;

export function getCurrentMilestone(subscribers: number): GiveawayMilestone {
  const effectiveSubscribers = Math.max(subscribers, highestConfirmedMilestone);
  return giveawayMilestones.find((milestone) => milestone.subscribers > effectiveSubscribers)
    ?? giveawayMilestones[giveawayMilestones.length - 1];
}

export function isGiveawayMilestoneReached(subscribers: number, milestone: number): boolean {
  return milestone <= highestConfirmedMilestone || subscribers >= milestone;
}

export function getMilestoneProgress(subscribers: number, target: number): number {
  const previous = [...giveawayMilestones].reverse().find((milestone) => milestone.subscribers < target)?.subscribers ?? 0;
  return Math.min(100, Math.max(0, ((subscribers - previous) / (target - previous)) * 100));
}
