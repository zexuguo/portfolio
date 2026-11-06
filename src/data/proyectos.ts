/** Proyectos mostrados. Imágenes: una captura de una página pública, fotogramas propios y esquemas; sin datos reales. */
export interface Proyecto {
  nombre: string;
  resumen: string;
  stack: string[];
  imagen: string;
  alt: string;
  /** qué es la imagen (se muestra en pequeño bajo ella) */
  nota: string;
  href?: string;
  /** caso de estudio: solo hechos comprobados; los campos vacíos no se muestran */
  caso: { problema?: string; hice?: string; reto?: string; resultado?: string };
}

export const PROYECTOS: Proyecto[] = [
  {
    nombre: "Plataforma educativa de programación",
    resumen: "Juego para aprender Java y C programando un dron granjero. El código se compila de verdad.",
    stack: ["JavaScript", "Three.js", "Postgres", "Vercel"],
    imagen: "/proyectos/granja.webp",
    alt: "Pantalla de entrada de la plataforma: mapa de islas con 10 mundos y formulario para crear cuenta",
    nota: "Captura de la pantalla pública de entrada",
    href: "https://granja-codigo.vercel.app",
    caso: {
      problema: "Practicar Java y C sin instalar nada y con corrección parecida a la de 42.",
      hice: "Editor en el navegador, 40 niveles en 10 mundos, cuentas, partida en la nube y liga semanal.",
      reto: "Ejecutar código ajeno sin riesgo y con una cuota gratuita compartida: usuario sin privilegios, cola y límites de ejecuciones por persona.",
      resultado: "Desplegada, con 30 tests automáticos pasando. Falta probarla con una clase real.",
    },
  },
  {
    nombre: "CRM de captación de leads",
    resumen: "Herramienta para encontrar negocios locales sin web, puntuarlos y llevarlos por un embudo de ventas.",
    stack: ["JavaScript", "Vercel Functions", "Redis", "OpenStreetMap"],
    imagen: "/proyectos/crm-leads.svg",
    alt: "Esquema: búsqueda de negocios, puntuación del lead, embudo de ventas, agenda y facturas",
    nota: "Esquema de funcionamiento (sin datos reales)",
    caso: {
      problema: "Buscar negocios locales sin web y hacerles seguimiento era un trabajo manual y disperso.",
      hice: "Buscador sobre datos abiertos de OpenStreetMap, puntuación de leads, embudo de ventas, agenda y facturas.",
      reto: "Hacerlo sin framework ni npm (HTML y JavaScript con funciones serverless) y guardar los datos en Redis en producción o en ficheros en local.",
      resultado: "Funciona en local; todavía sin clientes reales. Siguiente paso: verificar producción y endurecer la API.",
    },
  },
  {
    nombre: "CRM para talleres de reparación",
    resumen: "Clientes, reparaciones, pagos, resguardo con QR y seguimiento público para el cliente. Multi-taller.",
    stack: ["Next.js", "React", "Supabase"],
    imagen: "/proyectos/taller-crm.svg",
    alt: "Esquema: clientes y reparaciones, pagos, resguardo con QR y seguimiento público",
    nota: "Esquema de funcionamiento (sin datos reales)",
    caso: {
      problema: "Un taller necesita controlar clientes, reparaciones y cobros sin hojas de cálculo.",
      hice: "Fichas de cliente y reparación, presupuesto, pagos y deuda, resguardo imprimible con QR y una página pública de seguimiento.",
    },
  },
  {
    nombre: "Bot de trading algorítmico (cuenta demo)",
    resumen: "Un modelo de lenguaje propone operaciones y una capa de riesgo escrita en código las valida. Solo dinero ficticio.",
    stack: ["Python", "OKX API", "Claude API", "Tests"],
    imagen: "/proyectos/trading.svg",
    alt: "Esquema: datos de mercado, propuesta del LLM, capa de riesgo en código y orden en cuenta demo",
    nota: "Esquema de funcionamiento (sin operaciones ni saldos)",
    caso: {
      problema: "Usar un modelo de lenguaje en decisiones de inversión sin que pueda arriesgar de más.",
      hice: "El LLM propone y las reglas de riesgo en código validan cada orden. El programa rechaza cualquier cuenta que no sea demo.",
      reto: "Que la cartera local coincida siempre con la del exchange: reconciliación automática y alertas de estado.",
      resultado: "170 tests automáticos. Los resultados en demo son una muestra pequeña y no concluyentes.",
    },
  },
  {
    nombre: "Pipeline de vídeo automatizado con IA",
    resumen: "Prototipo que genera vídeos verticales de 60–75 s con un personaje 3D propio: guion, voz, escenas y render.",
    stack: ["Three.js", "Remotion", "Python"],
    imagen: "/proyectos/videos.webp",
    alt: "Tres fotogramas de un vídeo de animación 3D con un personaje de gorra naranja en un tren",
    nota: "Fotogramas de un vídeo generado por el propio pipeline",
    caso: {
      problema: "Producir vídeos cortos verticales sin gastar en herramientas de pago.",
      hice: "Un flujo de guion, voz, escenas 3D con un personaje propio y render automático.",
      reto: "Mantener sincronizados voz, subtítulos y animación.",
      resultado: "Primer vídeo completo de 70 s generado de principio a fin; sin publicar y con detalles por pulir.",
    },
  },
];

/** Proyectos secundarios: una línea cada uno, fuera del carrusel. */
export const TAMBIEN = [
  "Agenda web personal (privada): calendario, hábitos y recuerdos con Next.js, Prisma y Supabase; 105 tests.",
  "IA local con Ollama: modelos Qwen de 3B y 7B en mi equipo, con un personaje definido con Modelfile.",
  "La Tierra ahora mismo: mapa con eventos de la NASA (API EONET), práctica para hackathons.",
];
