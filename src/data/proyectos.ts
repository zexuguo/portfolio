/** Proyectos mostrados en la web. Las imágenes son esquemas o fotogramas propios: sin datos reales. */
export interface Proyecto {
  nombre: string;
  descripcion: string;
  stack: string[];
  imagen: string;
  alt: string;
  href?: string;
}

export const PROYECTOS: Proyecto[] = [
  {
    nombre: "CRM de captación de leads",
    descripcion:
      "Herramienta para encontrar negocios locales sin web, puntuarlos y llevarlos por un embudo de ventas con agenda y facturas.",
    stack: ["JavaScript", "Vercel Functions", "Redis", "OpenStreetMap"],
    imagen: "/proyectos/crm-leads.svg",
    alt: "Esquema: búsqueda de negocios, puntuación del lead, embudo de ventas, agenda y facturas",
  },
  {
    nombre: "Plataforma educativa de programación",
    descripcion:
      "Juego para aprender Java y C programando un dron. El código se compila de verdad en un sandbox, con cuentas, retos tipo Moulinette y liga.",
    stack: ["JavaScript", "Three.js", "Postgres", "Vercel"],
    imagen: "/proyectos/granja.svg",
    alt: "Esquema: editor en el navegador, compilación en sandbox, retos con corrección automática, cuentas y liga",
    href: "https://granja-codigo.vercel.app",
  },
  {
    nombre: "Bot de trading algorítmico (demo)",
    descripcion:
      "Bot de cripto que opera solo en cuenta demo: un LLM propone y una capa de riesgo escrita en código valida cada orden.",
    stack: ["Python", "OKX API", "Claude API", "Tests"],
    imagen: "/proyectos/trading.svg",
    alt: "Esquema: datos de mercado, propuesta del LLM, capa de riesgo en código y orden en cuenta demo",
  },
  {
    nombre: "Pipeline de vídeo con IA",
    descripcion:
      "Prototipo que genera vídeos verticales de 60–75 s con un personaje 3D propio: guion, voz, escenas y render.",
    stack: ["Three.js", "Remotion", "Python"],
    imagen: "/proyectos/videos.webp",
    alt: "Tres fotogramas de un vídeo de animación 3D con un personaje de gorra naranja en un tren",
  },
  {
    nombre: "Agenda web personal",
    descripcion:
      "Agenda con calendario propio, hábitos, recuerdos con fotos, estudio de chino y notificaciones push. Uso privado.",
    stack: ["Next.js", "Prisma", "Supabase", "Tailwind"],
    imagen: "/proyectos/agenda.svg",
    alt: "Esquema: calendario, hábitos y recuerdos, estudio de chino y notificaciones push",
  },
  {
    nombre: "CRM para talleres de reparación",
    descripcion:
      "Clientes, reparaciones, pagos, resguardo con QR y seguimiento público para el cliente. Multi-taller.",
    stack: ["Next.js", "React", "Supabase"],
    imagen: "/proyectos/taller-crm.svg",
    alt: "Esquema: clientes y reparaciones, pagos, resguardo con QR y seguimiento público",
  },
  {
    nombre: "IA local con Ollama",
    descripcion:
      "Experimentos con modelos abiertos (Qwen 3B y 7B) en mi propio equipo y personalización con Modelfile.",
    stack: ["Ollama", "Qwen", "Modelfile"],
    imagen: "/proyectos/ia-local.svg",
    alt: "Esquema: modelos abiertos en local, personalización con Modelfile y pruebas de rendimiento",
  },
];
