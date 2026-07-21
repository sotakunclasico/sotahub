export type CollaborationArtwork = {
  src: string;
  alt: string;
  title: string;
  description: string;
  aspect: "landscape" | "portrait" | "square";
};

export const collaboration = {
  name: "El legado del Rey Helado",
  partners: "SotaKun × Niebla Tattooer",
  artistHandle: "@niebla_tattooer",
  status: "En preparación",
  summary:
    "Una edición limitada nacida de un dibujo original de Niebla Tattooer y desarrollada para la comunidad de SotaKun.",
  pack: [
    "Camiseta de algodón premium con arte frontal, trasera y manga",
    "Póster de la colaboración",
    "Set de pegatinas de colección, con variante foil",
    "Cartas de SotaKun y Niebla Tattooer",
    "Certificado numerado con verificación QR",
  ],
} as const;

export const collaborationArtwork: readonly CollaborationArtwork[] = [
  {
    src: "/assets/collaboration/niebla/shirt-presentation.webp",
    alt: "Presentación de la camiseta El legado del Rey Helado por SotaKun y Niebla Tattooer",
    title: "Camiseta edición limitada",
    description: "Vista frontal, trasera y detalles de la manga.",
    aspect: "landscape",
  },
  {
    src: "/assets/collaboration/niebla/poster-blue.webp",
    alt: "Póster azul del Rey Helado de SotaKun y Niebla Tattooer",
    title: "Póster azul",
    description: "Interpretación a color del arte principal.",
    aspect: "portrait",
  },
  {
    src: "/assets/collaboration/niebla/poster-monochrome.webp",
    alt: "Póster monocromo del Rey Helado de SotaKun y Niebla Tattooer",
    title: "Póster monocromo",
    description: "Versión en tinta negra con marco ornamental.",
    aspect: "portrait",
  },
  {
    src: "/assets/collaboration/niebla/stickers.webp",
    alt: "Colección de pegatinas del Rey Helado",
    title: "Pegatinas de colección",
    description: "Seis diseños, incluido el acabado foil.",
    aspect: "landscape",
  },
  {
    src: "/assets/collaboration/niebla/collector-cards.webp",
    alt: "Cartas de colección de Niebla Tattooer y SotaKun",
    title: "Cartas de autor",
    description: "Identidad de ambos creadores en formato coleccionable.",
    aspect: "landscape",
  },
  {
    src: "/assets/collaboration/niebla/sleeve-logo-corrected.webp",
    alt: "Emblema de manga Niebla Tattooer corregido",
    title: "Emblema de la manga",
    description: "Arte oficial corregido con la denominación TATTOOER.",
    aspect: "square",
  },
  {
    src: "/assets/collaboration/niebla/original-sketch.webp",
    alt: "Boceto original a lápiz del Rey Helado realizado por Niebla Tattooer",
    title: "Boceto original",
    description: "El punto de partida dibujado a mano.",
    aspect: "portrait",
  },
  {
    src: "/assets/collaboration/niebla/original-render.webp",
    alt: "Arte original renderizado del Rey Helado",
    title: "Arte final",
    description: "La ilustración limpia antes de aplicarla a las piezas.",
    aspect: "portrait",
  },
];
