/** Textos del portfolio. Salen de las notas de zexu (YO, Hobbies, Académico y Proyectos); sin datos personales. */

/** URL del CV descargable. null = oculto hasta tener una versión sin teléfono ni código postal. */
export const CV_URL: string | null = null;
export const EMAIL = "zexuguo34@gmail.com";
export const LINKEDIN = "https://www.linkedin.com/in/zexu-guo-b4517740a/";
export const GITHUB = "https://github.com/zexuguo";

export const SECCIONES = [
  { id: "presentacion", label: "Presentación" },
  { id: "tecnico", label: "Técnico" },
  { id: "proyectos", label: "Proyectos" },
  { id: "sobre-mi", label: "Sobre mí" },
  { id: "contacto", label: "Contacto" },
] as const;

export const PRESENTACION = {
  rol: "Desarrollador junior · Barcelona",
  frase: "Construyo aplicaciones web y herramientas para pequeños negocios, de la base de datos a la pantalla.",
  texto:
    "Estudio Desarrollo de Aplicaciones Multiplataforma (DAM) y programación en 42 Barcelona. Trabajo con C, Java, Python y JavaScript/TypeScript, hago webs con Next.js y React, y las publico en la nube sin gastar un euro. Busco prácticas o un primer puesto junior en remoto.",
  datos: ["DAM + 42 Barcelona", "Español y catalán nativos", "Inglés B1-B2 · Chino A2"],
};

export const TECNICO = {
  intro:
    "Empecé por el hardware y las redes y fui acabando en el software, así que me manejo igual con una base de datos que con un servidor Linux. Casi todo lo que sé lo he aprendido montando proyectos reales.",
  stack: [
    { grupo: "Lenguajes", items: ["C", "Java", "Python", "JavaScript", "TypeScript", "SQL", "HTML y CSS"] },
    { grupo: "Web", items: ["Next.js", "React", "Tailwind CSS", "GSAP", "Three.js"] },
    { grupo: "Datos y nube", items: ["PostgreSQL", "Supabase", "Redis", "Prisma", "Vercel"] },
    { grupo: "Sistemas y herramientas", items: ["Linux", "Shell", "Git y GitHub", "APIs REST", "Ollama (IA local)"] },
  ],
  formacion: [
    {
      titulo: "DAM · Desarrollo de Aplicaciones Multiplataforma",
      lugar: "ITIC Barcelona · 1.er curso, en marcha",
      texto: "Programación, bases de datos, sistemas informáticos, lenguajes de marcas, gestión empresarial (ERP/CRM) e inglés profesional.",
    },
    {
      titulo: "42 Barcelona",
      lugar: "Escuela de programación · en marcha",
      texto: "No hay profesores ni horarios: se aprende haciendo proyectos y corrigiéndose entre estudiantes. Piscine de Shell y C terminada y Libft hecha (43 funciones de la librería estándar de C).",
    },
    {
      titulo: "SMX · Sistemas Microinformáticos y Redes",
      lugar: "Escola del Treball · ciclo medio",
      texto: "Montaje y mantenimiento de equipos, redes, sistemas operativos y seguridad informática.",
    },
  ],
  hackathons: "Me preparo para hackathons (NASA Space Apps y Talent Arena) con proyectos completos de un fin de semana.",
};

export const SOBRE_MI = {
  texto:
    "Soy Zexu, de Barcelona. Entré en la informática por el hardware y las redes y he ido acabando en el software. He trabajado como técnico de soporte y de sistemas, en Barcelona y en Portugal (Erasmus). Me gusta aprender construyendo cosas que se puedan usar.",
  intereses: [
    { titulo: "Escalada", texto: "Rocódromo y bloque." },
    { titulo: "Juegos de gestión y construcción", texto: "Factorio, Cities: Skylines, Kerbal Space Program." },
    { titulo: "Manga, anime y cine", texto: "Y mucha música." },
    { titulo: "Deporte", texto: "Entreno para triatlón: gimnasio, running y ciclismo." },
  ],
  ahora: [
    "Terminando Libft y preparando su defensa en 42.",
    "Cursando 1.º de DAM: programación, bases de datos y sistemas.",
    "Puliendo este portfolio y mis proyectos (plataforma educativa y vídeo automático).",
    "Practicando con proyectos de un fin de semana para hackathons.",
  ],
  actualizado: "noviembre de 2026",
};
