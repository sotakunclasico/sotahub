export const nieblaGiveaway = {
  name: "Sorteo especial SotaKun × Niebla Tattooer",
  slug: "niebla-tattooer",
  status: "open",
  drawDate: "2026-08-15",
  drawTime: "22:00",
  timeZone: "Europe/Madrid",
  liveUrl: null,
  startsAt: "2026-07-29T00:00:00+02:00",
  closesAt: "2026-08-15T22:00:00+02:00",
  organizer: "SotaKun",
  collaborator: "Niebla Tattooer",
  contactEmail: "sotakun.clasico@gmail.com",
  contactChannels: ["Discord", "correo electrónico"],
  territory: "Países de Europa y Latinoamérica",
  minimumAge: 0,
  tattooMinimumAge: 18,
  youtubeSubscriptionRequired: true,
  discordMembershipRequired: false,
  minimumPointsExclusive: 5,
  pointsPerEntry: 5,
  maximumEntries: null,
  winners: 1,
  alternateWinners: 3,
  shirtSizes: "Todas las tallas disponibles",
  shippingDeadline: null,
  mandatoryExclusions: ["sotakun", "nieblatattoo"],
  youtubeContestPolicyUrl: "https://support.google.com/youtube/answer/1620498?hl=es-419",
  pack: [
    "1 camiseta oficial de la colaboración",
    "4 pegatinas seleccionadas de la colección",
    "2 pósteres: versión azul y versión monocroma",
    "Certificado de autenticidad, exclusividad y numeración",
  ],
  pendingDecisions: [
    "Enlace del directo del 15 de agosto",
    "Nombre y ubicación del estudio de Niebla Tattooer",
    "Condiciones completas de privacidad y conservación de datos",
  ],
} as const;

export const nieblaPrizeArtwork = [
  {
    title: "Camiseta oficial",
    description: "Una camiseta de la colaboración. El ganador escogerá su talla después del sorteo hablando con el administrador.",
    src: "/assets/collaboration/niebla/shirt-presentation.webp",
    alt: "Presentación de la camiseta oficial SotaKun y Niebla Tattooer",
  },
  {
    title: "Cuatro pegatinas",
    description: "El premio incluye cuatro pegatinas seleccionadas, aunque la imagen muestre el catálogo completo de diseños.",
    src: "/assets/collaboration/niebla/stickers.webp",
    alt: "Catálogo de pegatinas de la colaboración SotaKun y Niebla Tattooer",
  },
  {
    title: "Dos pósteres",
    description: "Se entregan las versiones azul y monocroma del arte El legado del Rey Helado.",
    src: "/assets/collaboration/niebla/poster-blue.webp",
    alt: "Póster azul El legado del Rey Helado",
  },
  {
    title: "Sesión de tatuaje",
    description: "Alternativa para mayores de 18 años. Tamaño, zona, retoques y plazos se acordarán directamente con el tatuador.",
    src: "/assets/collaboration/niebla/original-render.webp",
    alt: "Diseño de referencia para la sesión con Niebla Tattooer",
  },
] as const;

export const nieblaGiveawayFaq = [
  {
    question: "¿Cómo consigo puntos?",
    answer: "Los puntos proceden de comentarios válidos, participación en vídeos diferentes y mensajes auténticos en los directos. El spam, los bots y la actividad artificial no cuentan.",
  },
  {
    question: "¿Cuántos puntos necesito?",
    answer: "Debes tener más de 5 puntos cuando se cierre el censo. Con la regla actual, 5 puntos exactos no son suficientes; 5,1 puntos sí superan el mínimo.",
  },
  {
    question: "¿Tengo que estar suscrito o pertenecer al Discord?",
    answer: "Debes estar suscrito al canal oficial de SotaKun. Pertenecer al Discord no es obligatorio para entrar en el censo, aunque Discord y el correo electrónico se utilizarán para intentar contactar con el ganador.",
  },
  {
    question: "¿Cómo aumentan mis posibilidades?",
    answer: "Cada bloque completo de 5 puntos genera una participación: 6 puntos son 1 participación, 15 puntos son 3 y 50 puntos son 10.",
  },
  {
    question: "¿Puedo elegir entre el pack y el tatuaje?",
    answer: "Sí. El ganador elegirá una de las dos opciones, nunca ambas.",
  },
  {
    question: "¿Puedo participar desde mi país?",
    answer: "Pueden participar residentes en Europa y Latinoamérica. Si el ganador reside en Latinoamérica, la entrega del merchandising se coordinará personalmente porque la logística será diferente.",
  },
  {
    question: "¿Tengo que ser mayor de edad?",
    answer: "No hay una edad mínima general para participar. La sesión de tatuaje solo puede elegirse si el ganador tiene 18 años o más; los menores podrán escoger el pack de merchandising.",
  },
  {
    question: "¿Está incluido el viaje al estudio?",
    answer: "No se incluirán viaje, alojamiento ni otros gastos de desplazamiento, salvo que las bases definitivas indiquen expresamente lo contrario.",
  },
  {
    question: "¿Quién paga el envío y las aduanas?",
    answer: "La forma de entrega se acordará con el ganador según su zona. Para Latinoamérica se contactará personalmente con el ganador porque el envío y sus condiciones serán diferentes.",
  },
  {
    question: "¿Cómo elijo la talla?",
    answer: "Todas las tallas están disponibles. Si eliges el pack, acordarás la talla con SotaKun después del sorteo mediante contacto directo con el administrador.",
  },
  {
    question: "¿Cómo sabré si he ganado?",
    answer: "La extracción se realizará en directo el 15 de agosto de 2026 a las 22:00, hora de Madrid. Se contactará mediante Discord y correo electrónico. Si no se localiza al ganador, se acudirá por orden a los tres suplentes elegidos en el mismo sorteo.",
  },
  {
    question: "¿Puedo recibir dinero en lugar del premio?",
    answer: "No. El premio no se puede canjear por dinero.",
  },
] as const;

export function getNieblaDrawDaysRemaining(now = Date.now()) {
  return Math.max(0, Math.ceil((Date.parse(nieblaGiveaway.closesAt) - now) / 86_400_000));
}

export function getNieblaGiveawayStatus(now = Date.now()) {
  if (now < Date.parse(nieblaGiveaway.startsAt)) return "upcoming";
  if (now >= Date.parse(nieblaGiveaway.closesAt)) return "closed";
  return "open";
}
