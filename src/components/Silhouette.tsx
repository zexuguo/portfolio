// Minifigura low-poly de Zexu. Los triángulos vienen de src/data/figure.ts.
//
// viewBox = 0 0 400 800. ScrollStory centra la cámara en el bbox de cada
// grupo con id de zona, así que los ids importan:
//   cerebro (cabeza), ojos (franja de los ojos), corazon (pecho),
//   manos, piernas (pantalón y zapatillas). El pecho incluye cuello y brazos.
import { FIGURE } from "@/data/figure";

const ZONES = ["piernas", "corazon", "manos", "cerebro", "ojos"];

export default function Silhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 800"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g id="camera" strokeLinejoin="round">
        {ZONES.map((zone) => (
          <g key={zone} id={zone}>
            {FIGURE[zone].map(([color, points]) => (
              // the same-colour hairline stroke hides seams between triangles
              <polygon
                key={points}
                points={points}
                fill={color}
                stroke={color}
                strokeWidth={0.6}
              />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
