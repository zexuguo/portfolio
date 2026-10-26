// Figura en línea trazada a partir de un vídeo de Zexu (proporciones del
// fotograma frontal, detalles simplificados). Generada con un script y
// ajustada a mano.
//
// viewBox = 0 0 400 800. ScrollStory centra la cámara en el bbox de cada
// grupo con id de zona, así que los ids (y su posición aproximada) importan:
//   cerebro  -> cabeza, ~ (200, 100)
//   ojos     -> ~ (200, 108)
//   corazon  -> pecho, ~ (200, 256)
//   manos    -> ~ (107, 400) y (293, 400)
//   piernas  -> pantalón y zapatillas, de y=372 a y=732
// El trazo no escala con el zoom (non-scaling-stroke) para que la línea se
// vea igual de fina en el plano general y en el zoom a los ojos.

const BASE = [
  "M189,154 L189,170",
  "M211,154 L211,170",
  "M189,170 L200,194",
  "M211,170 L200,194",
  "M187,169 L178,186 L196,189",
  "M213,169 L222,186 L204,189",
  "M189,169 Q160,176 134,186 Q114,194 112,214 C104,250 98,310 95,364",
  "M211,169 Q240,176 266,186 Q286,194 288,214 C296,250 302,310 305,364",
  "M136,236 C130,280 124,330 120,364",
  "M264,236 C270,280 276,330 280,364",
  "M95,356 L120,358",
  "M305,356 L280,358",
  "M136,236 Q141,300 138,362",
  "M264,236 Q259,300 262,362",
  "M138,362 Q200,370 262,362",
];
const HEAD = [
  "M172,100 C172,118 176,142 188,153 Q194,158 200,158 Q206,158 212,153 C224,142 228,118 228,100",
  "M172,108 Q165,108 165,117 Q166,126 174,127",
  "M228,108 Q235,108 235,117 Q234,126 226,127",
  "M174,114 C158,110 152,90 158,74 C162,62 172,52 186,48 C198,42 216,44 228,52 C242,60 248,80 242,98 C240,106 234,112 226,114",
  "M172,98 Q182,80 196,88 Q206,76 220,86 Q228,88 232,100",
  "M184,56 Q194,62 192,76",
  "M210,52 Q222,60 220,78",
  "M160,82 Q166,88 166,96",
  "M200,113 L197,125 Q200,128 204,126",
  "M192,138 Q200,141 208,138",
];
const EYES = [
  "M181,110 Q187,105 193,110 Q187,114 181,110 Z",
  "M219,110 Q213,105 207,110 Q213,114 219,110 Z",
  "M180,102 Q187,98 194,101",
  "M220,102 Q213,98 206,101",
];
const HANDS = [
  "M96,364 C94,378 95,396 98,410 C100,422 104,432 110,432 C115,432 117,424 118,414 C119,404 120,390 120,364",
  "M304,364 C306,378 305,396 302,410 C300,422 296,432 290,432 C285,432 283,424 282,414 C281,404 280,390 280,364",
  "M119,376 C125,382 126,392 121,400",
  "M281,376 C275,382 274,392 279,400",
];
const LEGS = [
  "M138,372 Q200,380 262,372",
  "M138,372 Q130,420 128,488 Q124,600 124,715 L194,715 L195,600 Q196,570 200,570",
  "M262,372 Q270,420 272,488 Q276,600 276,715 L206,715 L205,600 Q204,570 200,570",
  "M164,404 Q162,560 160,712",
  "M236,404 Q238,560 240,712",
  "M138,715 C132,720 132,732 146,732 L184,732 C190,732 191,722 188,715",
  "M262,715 C268,720 268,732 254,732 L216,732 C210,732 209,722 212,715",
];

const LINE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};

function Paths({ d }: { d: string[] }) {
  return (
    <>
      {d.map((p) => (
        <path key={p} d={p} />
      ))}
    </>
  );
}

export default function Silhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 800"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g id="camera">
        {/* cuello, cuello del polo, hombros, brazos y jersey */}
        <g id="figura-base" {...LINE}>
          <Paths d={BASE} />
        </g>

        <g id="cerebro" {...LINE}>
          <Paths d={HEAD} />
        </g>

        <g id="ojos" {...LINE}>
          <Paths d={EYES} />
          <circle cx="187" cy="109.5" r="1.8" fill="currentColor" />
          <circle cx="213" cy="109.5" r="1.8" fill="currentColor" />
        </g>

        <g id="corazon" {...LINE} stroke="#e11d48">
          <path d="M200,272 C188,263 181,256 181,248 C181,242 185,238 191,238 C195,238 198,241 200,245 C202,241 205,238 209,238 C215,238 219,242 219,248 C219,256 212,263 200,272 Z" />
        </g>

        <g id="manos" {...LINE}>
          <Paths d={HANDS} />
        </g>

        <g id="piernas" {...LINE}>
          <Paths d={LEGS} />
        </g>
      </g>
    </svg>
  );
}
