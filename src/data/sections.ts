export type SectionId = "corazon" | "cerebro" | "manos" | "piernas" | "ojos";

export interface Project {
  name: string;
  description: string;
  stack: string[];
  href?: string;
}

export interface Section {
  id: SectionId;
  /** id of the SVG <g> this section's camera zooms into */
  target: SectionId;
  /** how tight the zoom is on the target group (higher = closer) */
  zoom: number;
  eyebrow: string;
  title: string;
  /** placeholder body copy — replace with real voice later */
  body: string;
  side: "left" | "right";
  projects?: Project[];
  cta?: { label: string; href: string }[];
}

export const SECTIONS: Section[] = [
  {
    id: "corazon",
    target: "corazon",
    zoom: 2.4,
    eyebrow: "01 — El porqué",
    title: "Quién soy",
    body: "Placeholder: escribe aquí quién eres y por qué haces lo que haces — constancia, curiosidad, autodidacta. Este es el bloque de apertura, con tu voz, sin filtros.",
    side: "right",
  },
  {
    id: "cerebro",
    target: "cerebro",
    zoom: 2.0,
    eyebrow: "02 — Lo técnico",
    title: "Lo que sé",
    body: "Estudiante en 42 Barcelona — metodología peer-to-peer, sin profesores, actualmente en la piscina de C. Graduado del CFGM en Sistemes Microinformàtics i Xarxes (SMX) en EDT Barcelona.",
    side: "left",
    projects: [
      { name: "C", description: "Fundamentos, algoritmia, gestión de memoria", stack: ["C"] },
      { name: "Python", description: "Scripting y automatización", stack: ["Python"] },
      { name: "Java", description: "Programación orientada a objetos", stack: ["Java"] },
      { name: "HTML / CSS", description: "Maquetación e interfaces web", stack: ["HTML", "CSS"] },
    ],
  },
  {
    id: "manos",
    target: "manos",
    zoom: 0.68,
    eyebrow: "03 — Lo que construyo",
    title: "Proyectos",
    body: "Una muestra de lo que he construido — de menor a mayor escala.",
    side: "right",
    projects: [
      {
        name: "OpsHub OS",
        description: "Plataforma SaaS de gestión empresarial. Tech lead del proyecto.",
        stack: ["Next.js", "TypeScript", "Postgres"],
        href: "#",
      },
      {
        name: "Proyecto placeholder 2",
        description: "Descripción corta del proyecto y el problema que resuelve.",
        stack: ["Stack"],
        href: "#",
      },
      {
        name: "Proyecto placeholder 3",
        description: "Descripción corta del proyecto y el problema que resuelve.",
        stack: ["Stack"],
        href: "#",
      },
      {
        name: "Proyecto placeholder 4",
        description: "Descripción corta del proyecto y el problema que resuelve.",
        stack: ["Stack"],
        href: "#",
      },
    ],
  },
  {
    id: "piernas",
    target: "piernas",
    zoom: 1.9,
    eyebrow: "04 — Disciplina",
    title: "Constancia",
    body: "Entreno para triatlón — objetivo a largo plazo: Ironman, empezando por distancia Sprint. Combino gimnasio, running y ciclismo. La misma disciplina que aplico entrenando la aplico aprendiendo a programar desde cero.",
    side: "left",
  },
  {
    id: "ojos",
    target: "ojos",
    zoom: 4.2,
    eyebrow: "05 — Adelante",
    title: "Hacia dónde voy",
    body: "Placeholder: hacia dónde vas, qué tipo de rol buscas. Cierra con tu propia voz antes del CTA.",
    side: "right",
    cta: [
      { label: "Contactar", href: "#" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/zexu-guo-b4517740a/" },
      { label: "Descargar CV", href: "#" },
    ],
  },
];
