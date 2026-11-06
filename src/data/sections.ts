export type SectionId = "corazon" | "cerebro" | "manos" | "piernas" | "ojos";

export interface Section {
  id: SectionId;
  /** parte del cuerpo que enfoca la cámara (ver VIEWS en Figure) */
  target: SectionId;
  eyebrow: string;
  title: string;
  body: string;
  side: "left" | "right";
  /** botones sin href se ocultan */
  cta?: { label: string; href?: string }[];
}

/** Recorrido por la figura. Textos cortos a partir de las notas de zexu; los detalles están en los bloques de la página. */
export const SECTIONS: Section[] = [
  {
    id: "corazon",
    target: "corazon",
    eyebrow: "01 — El porqué",
    title: "Quién soy",
    body: "Soy Zexu, de Barcelona. Entré en la informática por el hardware y las redes y he ido acabando en el software. Me gusta aprender construyendo cosas que se puedan usar.",
    side: "right",
  },
  {
    id: "cerebro",
    target: "cerebro",
    eyebrow: "02 — Cómo aprendo",
    title: "Con la cabeza",
    body: "Estudio DAM y programo en 42 Barcelona, una escuela sin profesores donde se aprende con proyectos y corrigiéndose entre estudiantes. Casi todo lo que sé viene de montar proyectos reales.",
    side: "left",
  },
  {
    id: "manos",
    target: "manos",
    eyebrow: "03 — Lo que hago",
    title: "Con las manos",
    body: "Aplicaciones web, un juego educativo, un bot de trading en cuenta demo y un prototipo de vídeo con IA. Los tienes arriba, uno a uno, con su caso de estudio.",
    side: "right",
    cta: [{ label: "Ver proyectos", href: "#proyectos" }],
  },
  {
    id: "piernas",
    target: "piernas",
    eyebrow: "04 — Constancia",
    title: "Con las piernas",
    body: "Entreno para triatlón: gimnasio, running y ciclismo. La misma disciplina que aplico entrenando la aplico aprendiendo a programar desde cero.",
    side: "left",
  },
  {
    id: "ojos",
    target: "ojos",
    eyebrow: "05 — Adelante",
    title: "Hacia dónde voy",
    body: "Busco prácticas o un primer puesto junior en remoto (web, backend o sistemas). Mientras, sigo avanzando en 42 y en DAM y me preparo para hackathons.",
    side: "right",
    cta: [{ label: "Contactar", href: "#contacto" }],
  },
];
