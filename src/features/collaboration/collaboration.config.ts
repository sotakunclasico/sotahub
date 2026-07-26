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
    "Una colección limitada nacida de un dibujo original de Niebla Tattooer y desarrollada junto a SotaKun para convertir una historia de la comunidad en piezas físicas.",
  origin:
    "La colaboración parte de una ilustración dibujada a mano por Niebla Tattooer. A partir de ese boceto se construyó la identidad de El legado del Rey Helado: una pieza oscura, inspirada en la fantasía y pensada para representar el universo de SotaKun fuera de la pantalla.",
  partnersDetail: [
    {
      name: "Niebla Tattooer",
      role: "Arte original y lenguaje visual",
      description:
        "Firma el dibujo original, la estética de tinta y el tratamiento de las piezas gráficas. Su trabajo aporta el carácter artesanal y la fuerza visual de la colección.",
    },
    {
      name: "SotaKun",
      role: "Concepto, dirección y comunidad",
      description:
        "Conecta la obra con la historia del canal, dirige su aplicación al producto y prepara la experiencia de colección, numeración y certificación.",
    },
  ],
  process: [
    {
      title: "Boceto original",
      description: "La idea comienza en papel, dibujada a mano y con una composición creada expresamente para la colaboración.",
    },
    {
      title: "Arte final",
      description: "El dibujo se limpia y adapta respetando el trazo, el contraste y la identidad original de Niebla Tattooer.",
    },
    {
      title: "Aplicación a la colección",
      description: "El arte se distribuye entre camiseta, póster, pegatinas y cartas para que cada soporte tenga una función propia.",
    },
    {
      title: "Edición certificada",
      description: "La colección se prepara para incorporar unidades numeradas y un certificado verificable mediante QR.",
    },
  ],
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
