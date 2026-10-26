export type SectionId = "corazon" | "cerebro" | "manos" | "piernas" | "ojos";

export interface Project {
  name: string;
  description: string;
  stack: string[];
  href?: string;
}

export interface Section {
  id: SectionId;
  /** body part the 3D camera frames (see VIEWS in Figure3D) */
  target: SectionId;
  eyebrow: string;
  title: string;
  /** placeholder body copy — replace with real voice later */
  body: string;
  side: "left" | "right";
  projects?: Project[];
  /** CTAs without href are hidden until the link exists */
  cta?: { label: string; href?: string }[];
}

export const SECTIONS: Section[] = [
  {
    id: "corazon",
    target: "corazon",
    eyebrow: "01 — El porqué",
    title: "Quién soy",
    // Borrador hecho a partir de tus notas y tu CV: revísalo y ajústalo a tu voz.
    body: "Soy Zexu Guo, de Barcelona. Empecé por el hardware y las redes, y ya he trabajado como técnico de soporte y de sistemas en Barcelona y en Portugal (Erasmus). Desde ahí he acabado enganchado a construir software. Aprendo haciendo: casi todo lo que sé lo he sacado de montar proyectos propios, desde un juego para aprender a programar hasta CRMs para pequeños negocios.",
    side: "right",
  },
  {
    id: "cerebro",
    target: "cerebro",
    eyebrow: "02 — Lo técnico",
    title: "Lo que sé",
    body: "Compagino el CFGS de Desarrollo de Aplicaciones Multiplataforma (DAM) en el ITIC Barcelona con el cursus de 42 Barcelona: C y Unix, peer-to-peer y sin profesores, ahora con Libft. Antes, CFGM en Sistemes Microinformàtics i Xarxes (SMX) en l'Escola del Treball. Idiomas: español y catalán nativos, inglés B1-B2 y chino A2.",
    side: "left",
    projects: [
      { name: "C", description: "Fundamentos, algoritmia, gestión de memoria", stack: ["C"] },
      { name: "Python", description: "Scripting y automatización", stack: ["Python"] },
      { name: "Java", description: "Programación orientada a objetos", stack: ["Java"] },
      { name: "HTML / CSS", description: "Maquetación e interfaces web", stack: ["HTML", "CSS"] },
      { name: "JavaScript / Next.js", description: "Aplicaciones web completas, desplegadas en Vercel", stack: ["JS", "TS", "Next.js"] },
      { name: "SQL / Postgres", description: "Modelado de datos y backends con Supabase y Neon", stack: ["SQL", "Postgres"] },
    ],
  },
  {
    id: "manos",
    target: "manos",
    eyebrow: "03 — Lo que construyo",
    title: "Proyectos",
    body: "Una muestra de lo que he construido — de menor a mayor escala.",
    side: "right",
    projects: [
      {
        name: "Granja del Código",
        description: "Juego para aprender Java y C programando un dron granjero. Compila el código de verdad (javac y gcc) en un sandbox, con cuentas, progresión, retos tipo Moulinette de 42 y liga.",
        stack: ["JavaScript", "Three.js", "Postgres", "Vercel"],
        href: "https://granja-codigo.vercel.app",
      },
      {
        name: "Taller CRM",
        description: "CRM para talleres de reparación de móviles: clientes, reparaciones, pagos, resguardo con QR y seguimiento público para el cliente. Multi-taller.",
        stack: ["Next.js", "React", "Supabase"],
        // TODO: ¿enlazar la web en producción o un repo/demo?
      },
      {
        name: "Trading Bot",
        description: "Bot de cripto en modo demo donde un LLM analiza el mercado y decide, siempre filtrado por una capa de riesgo escrita en código que no puede saltarse.",
        stack: ["Python", "OKX API", "Claude API"],
      },
    ],
  },
  {
    id: "piernas",
    target: "piernas",
    eyebrow: "04 — Disciplina",
    title: "Constancia",
    body: "Entreno para triatlón — objetivo a largo plazo: Ironman, empezando por distancia Sprint. Combino gimnasio, running y ciclismo. La misma disciplina que aplico entrenando la aplico aprendiendo a programar desde cero.",
    side: "left",
  },
  {
    id: "ojos",
    target: "ojos",
    eyebrow: "05 — Adelante",
    title: "Hacia dónde voy",
    body: "Busco prácticas o un primer puesto junior en remoto, abierto a desarrollo web, backend o sistemas. Mientras, sigo avanzando en el cursus de 42 y en DAM, y compito en hackathons como NASA Space Apps y Talent Arena. Si tienes un proyecto donde pueda aprender rápido y aportar desde el primer día, hablemos.",
    side: "right",
    cta: [
      { label: "Contactar", href: "mailto:zexuguo34@gmail.com" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/zexu-guo-b4517740a/" },
      { label: "Descargar CV", href: "/cv-zexu-guo.pdf" },
    ],
  },
];
