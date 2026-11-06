// Genera los esquemas SVG de la sección Proyectos (node scripts/proyectos/esquemas.mjs).
// Son diagramas de cómo funciona cada proyecto, no capturas: no llevan datos reales.
import { writeFileSync } from "node:fs";

const W = 960, H = 600;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function esquema({ file, accent, titulo, pasos, nota }) {
  const n = pasos.length, bw = 640, bh = 70, gap = 34;
  const total = n * bh + (n - 1) * gap, y0 = (H - total) / 2 + 22, x0 = (W - bw) / 2;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(titulo)}">`;
  s += `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f1115"/><stop offset="1" stop-color="#171a21"/></linearGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#g)"/>`;
  s += `<g stroke="#ffffff" stroke-opacity=".04">${Array.from({ length: 24 }, (_, i) => `<path d="M${i * 40} 0V${H}"/>`).join("")}${Array.from({ length: 15 }, (_, i) => `<path d="M0 ${i * 40}H${W}"/>`).join("")}</g>`;
  s += `<text x="40" y="52" font-family="ui-monospace,monospace" font-size="15" letter-spacing="2" fill="${accent}">${esc(titulo.toUpperCase())}</text>`;
  pasos.forEach((p, i) => {
    const y = y0 + i * (bh + gap);
    s += `<rect x="${x0}" y="${y}" width="${bw}" height="${bh}" rx="12" fill="#1c2029" stroke="${accent}" stroke-opacity="${i === n - 1 ? 1 : 0.45}" stroke-width="1.5"/>`;
    s += `<text x="${x0 + 24}" y="${y + 30}" font-family="system-ui,sans-serif" font-size="20" font-weight="600" fill="#f3f4f6">${esc(p[0])}</text>`;
    s += `<text x="${x0 + 24}" y="${y + 54}" font-family="system-ui,sans-serif" font-size="15" fill="#9ca3af">${esc(p[1])}</text>`;
    s += `<text x="${x0 + bw - 24}" y="${y + 42}" text-anchor="end" font-family="ui-monospace,monospace" font-size="22" fill="${accent}" fill-opacity=".6">0${i + 1}</text>`;
    if (i < n - 1) s += `<path d="M${W / 2} ${y + bh + 6}v${gap - 12}m-6 -7l6 7l6 -7" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  });
  s += `<text x="40" y="${H - 28}" font-family="system-ui,sans-serif" font-size="13" fill="#6b7280">${esc(nota)}</text></svg>`;
  writeFileSync(`public/proyectos/${file}.svg`, s);
}

esquema({ file: "trading", accent: "#10b981", titulo: "Bot de trading · cuenta demo",
  pasos: [["Datos de mercado", "Precios de BTC, ETH y SOL desde la API del exchange (OKX)"],
          ["Propuesta con un LLM", "Un modelo de lenguaje analiza y propone una operación"],
          ["Capa de riesgo en código", "Reglas fijas que el modelo no puede saltarse"],
          ["Orden en cuenta demo", "Solo dinero ficticio; el código rechaza cualquier otro modo"]],
  nota: "Esquema del funcionamiento. No muestra operaciones ni saldos." });
esquema({ file: "granja", accent: "#f97316", titulo: "Plataforma educativa de programación",
  pasos: [["Editor en el navegador", "El alumno escribe Java o C para mover un dron granjero"],
          ["Compilación real en sandbox", "javac / gcc en un entorno aislado, con límites de uso"],
          ["Retos tipo Moulinette", "10 mundos con corrección automática, como en 42"],
          ["Cuentas, progreso y liga", "Partida en la nube; la liga solo cuenta resultados verificados"]],
  nota: "Esquema del funcionamiento." });
esquema({ file: "crm-leads", accent: "#3b82f6", titulo: "CRM de captación de leads",
  pasos: [["Búsqueda de negocios locales", "Datos abiertos de OpenStreetMap (Overpass y Nominatim)"],
          ["Puntuación del lead", "Prioriza los negocios sin web propia"],
          ["Embudo de ventas", "Nuevo → contactado → ganado / perdido"],
          ["Agenda y facturas", "Seguimiento de cada cliente en una sola herramienta"]],
  nota: "Esquema del funcionamiento. Sin datos de clientes reales." });
esquema({ file: "agenda", accent: "#ec4899", titulo: "Agenda web personal",
  pasos: [["Calendario propio", "Eventos y tareas recurrentes"],
          ["Hábitos y recuerdos", "Seguimiento de hábitos, gimnasio y recuerdos con fotos"],
          ["Estudio de chino", "Lecciones y reto diario"],
          ["Notificaciones push", "Next.js + Prisma + Supabase, con tests automáticos"]],
  nota: "Esquema del funcionamiento. App privada de uso personal." });
esquema({ file: "ia-local", accent: "#a855f7", titulo: "IA local con Ollama",
  pasos: [["Modelos abiertos en mi equipo", "Qwen 2.5 de 3B y 7B parámetros, sin enviar datos a la nube"],
          ["Personalización con Modelfile", "Personaje, tono y parámetros de generación definidos"],
          ["Pruebas de rendimiento", "Comparar velocidad y calidad con 8 GB de RAM"]],
  nota: "Esquema del funcionamiento. Proyecto experimental en curso." });
esquema({ file: "taller-crm", accent: "#14b8a6", titulo: "CRM para talleres de reparación",
  pasos: [["Clientes y reparaciones", "Ficha de cada dispositivo y su estado"],
          ["Pagos", "Registro de cobros por reparación"],
          ["Resguardo con código QR", "El cliente recibe un comprobante imprimible"],
          ["Seguimiento público", "Página para que el cliente consulte su reparación (Next.js + Supabase)"]],
  nota: "Esquema del funcionamiento. Multi-taller; sin datos de clientes reales." });
console.log("ok");
