/** Proyectos mostrados en la web. Las imágenes son esquemas o fotogramas propios: sin datos reales. */
export interface Proyecto {
  nombre: string;
  descripcion: string;
  stack: string[];
  imagen: string;
  alt: string;
  href?: string;
  /** caso de estudio corto: solo hechos comprobados; los campos vacíos no se muestran */
  caso?: { problema?: string; hice?: string; reto?: string; resultado?: string };
}

export const PROYECTOS: Proyecto[] = [
  {
    nombre: "CRM de captación de leads",
    descripcion:
      "Herramienta para encontrar negocios locales sin web, puntuarlos y llevarlos por un embudo de ventas con agenda y facturas.",
    stack: ["JavaScript", "Vercel Functions", "Redis", "OpenStreetMap"],
    imagen: "/proyectos/crm-leads.svg",
    alt: "Esquema: búsqueda de negocios, puntuación del lead, embudo de ventas, agenda y facturas",
    caso: {
      problema: "Buscar negocios locales sin web y hacerles seguimiento era un trabajo manual y disperso.",
      hice: "Un buscador sobre datos abiertos de OpenStreetMap, una puntuación de leads, un embudo de ventas, agenda y facturas.",
      reto: "Hacerlo sin framework ni npm (HTML y JavaScript con funciones serverless) y guardar los datos en Redis en producción o en ficheros en local.",
      resultado: "Funciona en local; todavía sin clientes reales. Siguiente paso: verificar producción y endurecer la API.",
    },
  },
  {
    nombre: "Plataforma educativa de programación",
    descripcion:
      "Juego para aprender Java y C programando un dron. El código se compila de verdad en un sandbox, con cuentas, retos tipo Moulinette y liga.",
    stack: ["JavaScript", "Three.js", "Postgres", "Vercel"],
    imagen: "/proyectos/granja.svg",
    alt: "Esquema: editor en el navegador, compilación en sandbox, retos con corrección automática, cuentas y liga",
    href: "https://granja-codigo.vercel.app",
    caso: {
      problema: "Practicar Java y C sin instalar nada y con corrección parecida a la de 42.",
      hice: "Un editor en el navegador, 10 mundos con retos, cuentas, partida en la nube y liga.",
      reto: "Ejecutar código ajeno sin riesgo y con una cuota gratuita compartida: usuario sin privilegios, cola, y límites de 10 ejecuciones simultáneas y una cada 3 s por persona.",
      resultado: "Desplegada, con 30 tests automáticos pasando. Falta probarla con una clase real.",
    },
  },
  {
    nombre: "Bot de trading algorítmico (demo)",
    descripcion:
      "Bot de cripto que opera solo en cuenta demo: un LLM propone y una capa de riesgo escrita en código valida cada orden.",
    stack: ["Python", "OKX API", "Claude API", "Tests"],
    imagen: "/proyectos/trading.svg",
    alt: "Esquema: datos de mercado, propuesta del LLM, capa de riesgo en código y orden en cuenta demo",
    caso: {
      problema: "Usar un modelo de lenguaje en decisiones de inversión sin que pueda arriesgar de más.",
      hice: "El LLM propone y una capa de riesgo escrita en código valida cada orden. Solo opera en cuenta demo.",
      reto: "Que la cartera local coincida siempre con la del exchange: reconciliación automática y alertas de estado.",
      resultado: "170 tests automáticos. Los resultados en demo son una muestra pequeña y no concluyentes.",
    },
  },
  {
    nombre: "Pipeline de vídeo con IA",
    descripcion:
      "Prototipo que genera vídeos verticales de 60–75 s con un personaje 3D propio: guion, voz, escenas y render.",
    stack: ["Three.js", "Remotion", "Python"],
    imagen: "/proyectos/videos.webp",
    alt: "Tres fotogramas de un vídeo de animación 3D con un personaje de gorra naranja en un tren",
    caso: {
      problema: "Producir vídeos cortos verticales sin gastar en herramientas de pago.",
      hice: "Un flujo de guion, voz, escenas 3D con un personaje propio y render automático.",
      reto: "Mantener sincronizados voz, subtítulos y animación.",
      resultado: "Primer vídeo completo de 70 s generado de principio a fin; sin publicar y con detalles por pulir.",
    },
  },
  {
    nombre: "Agenda web personal",
    descripcion:
      "Agenda con calendario propio, hábitos, recuerdos con fotos, estudio de chino y notificaciones push. Uso privado.",
    stack: ["Next.js", "Prisma", "Supabase", "Tailwind"],
    imagen: "/proyectos/agenda.svg",
    alt: "Esquema: calendario, hábitos y recuerdos, estudio de chino y notificaciones push",
    caso: {
      problema: "Una agenda propia que junte calendario, hábitos y recuerdos en un solo sitio.",
      hice: "Calendario con eventos recurrentes, hábitos y gimnasio, recuerdos con fotos, estudio de chino y notificaciones push.",
      reto: "Mantener coste 0: la base de datos gratuita se pausa por inactividad, así que hay una copia de seguridad automática.",
      resultado: "Publicada, con registro cerrado y 105 tests automáticos pasando.",
    },
  },
  {
    nombre: "CRM para talleres de reparación",
    descripcion:
      "Clientes, reparaciones, pagos, resguardo con QR y seguimiento público para el cliente. Multi-taller.",
    stack: ["Next.js", "React", "Supabase"],
    imagen: "/proyectos/taller-crm.svg",
    alt: "Esquema: clientes y reparaciones, pagos, resguardo con QR y seguimiento público",
    caso: {
      problema: "Un taller necesita controlar clientes, reparaciones y cobros sin hojas de cálculo.",
      hice: "Fichas de cliente y reparación, pagos, resguardo con QR y una página pública de seguimiento. Multi-taller.",
    },
  },
  {
    nombre: "IA local con Ollama",
    descripcion:
      "Experimentos con modelos abiertos (Qwen 3B y 7B) en mi propio equipo y personalización con Modelfile.",
    stack: ["Ollama", "Qwen", "Modelfile"],
    imagen: "/proyectos/ia-local.svg",
    alt: "Esquema: modelos abiertos en local, personalización con Modelfile y pruebas de rendimiento",
    caso: {
      problema: "Probar modelos de lenguaje sin enviar datos a la nube.",
      hice: "Cuatro modelos Qwen de 3B y 7B en mi equipo y un personaje definido con Modelfile.",
      reto: "Solo 8 GB de RAM: hay que medir qué modelo cabe y a qué velocidad.",
      resultado: "En pruebas; todavía sin conclusiones.",
    },
  },
];
