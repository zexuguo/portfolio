// Figura en línea (versión genérica). Pendiente de sustituir por un trazado
// hecho a partir de una foto real.
//
// viewBox = 0 0 400 800. ScrollStory centra la cámara en el bbox de cada
// grupo con id de zona, así que los ids (y su posición aproximada) importan:
//   cerebro  -> cabeza, centro ~ (200, 106)
//   ojos     -> dentro de la cabeza, ~ (200, 102)
//   corazon  -> pecho, ~ (200, 260)
//   manos    -> ~ (66, 342) y (334, 342), centro combinado x=200
//   piernas  -> de y=405 a y=730
// El trazo no escala con el zoom (non-scaling-stroke) para que la línea se
// vea igual de fina en el plano general y en el zoom a los ojos.

const TORSO =
  "M188,164 L186,186 Q162,192 134,202 Q114,210 108,234 L66,316 L86,326 L134,252 Q142,300 150,340 Q154,378 154,405 Q176,414 200,414 Q224,414 246,405 Q246,378 250,340 Q258,300 266,252 L314,326 L334,316 L292,234 Q286,210 266,202 Q238,192 214,186 L212,164";
const LEG_L =
  "M154,405 Q146,480 158,560 Q162,640 166,708 L148,722 Q144,730 154,730 L194,730 L192,708 Q196,640 194,580 Q198,480 200,416";
const LEG_R =
  "M246,405 Q254,480 242,560 Q238,640 234,708 L252,722 Q256,730 246,730 L206,730 L208,708 Q204,640 206,580 Q202,480 200,416";
const HAND_L =
  "M66,316 C56,330 46,348 50,362 C54,372 66,370 72,360 C76,354 80,348 84,344 L94,346 Q98,340 90,336 L86,326";
const HAND_R =
  "M334,316 C344,330 354,348 350,362 C346,372 334,370 328,360 C324,354 320,348 316,344 L306,346 Q302,340 310,336 L314,326";

export default function Silhouette({ className }: { className?: string }) {
  const line = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    vectorEffect: "non-scaling-stroke" as const,
  };

  return (
    <svg
      viewBox="0 0 400 800"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g id="camera">
        {/* cuello, hombros, brazos y torso — conecta las zonas */}
        <g id="figura-base" {...line}>
          <path d={TORSO} />
        </g>

        <g id="cerebro" {...line}>
          <ellipse cx="200" cy="108" rx="44" ry="56" />
          {/* línea del pelo */}
          <path d="M157,96 Q156,56 192,52 Q232,48 243,92" />
        </g>

        <g id="ojos" {...line}>
          <path d="M173,102 Q182,95 191,102 Q182,108 173,102 Z" />
          <path d="M209,102 Q218,95 227,102 Q218,108 209,102 Z" />
          <circle cx="182" cy="102" r="2.2" fill="currentColor" />
          <circle cx="218" cy="102" r="2.2" fill="currentColor" />
        </g>

        <g id="corazon" {...line} stroke="#e11d48">
          <path d="M200,276 C186,266 178,258 178,249 C178,242 183,238 189,238 C194,238 198,241 200,246 C202,241 206,238 211,238 C217,238 222,242 222,249 C222,258 214,266 200,276 Z" />
        </g>

        <g id="manos" {...line}>
          <path d={HAND_L} />
          <path d={HAND_R} />
        </g>

        <g id="piernas" {...line}>
          <path d={LEG_L} />
          <path d={LEG_R} />
        </g>
      </g>
    </svg>
  );
}
