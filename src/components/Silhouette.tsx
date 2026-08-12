// Silueta placeholder de depuración — colores fuertes por zona para verificar
// visualmente hacia dónde apunta la cámara en cada sección del scroll.
// viewBox = 0 0 400 800. Coordenadas de centro de cada zona (para transform-origin / cálculo de cámara):
//   corazon  -> x=200 (50%),  y=260 (32.5%)
//   cerebro  -> x=200 (50%),  y=110 (13.75%)
//   ojos     -> x=200 (50%),  y=100 (12.5%)   [dentro de cerebro]
//   manos    -> x=60/340 (15% / 85%), y=340 (42.5%)  [centro combinado x=200, 50%]
//   piernas  -> x=200 (50%),  y=565 (70.6%)  [tramo y=405 a y=725]
export default function Silhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 800"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g id="camera">
        {/* estructura neutra — solo conecta el muñeco, no es una zona interactiva */}
        <g
          id="figura-base"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="4"
          strokeLinecap="round"
        >
          {/* columna / torso */}
          <line x1="200" y1="165" x2="200" y2="400" />
          {/* hombros */}
          <line x1="120" y1="200" x2="280" y2="200" />
          {/* brazos (hombro -> mano) */}
          <line x1="120" y1="200" x2="60" y2="340" />
          <line x1="280" y1="200" x2="340" y2="340" />
        </g>

        {/* cerebro — cabeza. centro aprox: x=50%, y=13.75% */}
        <g id="cerebro">
          <circle cx="200" cy="110" r="58" fill="#2563eb" fillOpacity="0.55" stroke="#2563eb" strokeWidth="4" />
        </g>

        {/* ojos — dentro de la cabeza. centro aprox: x=50%, y=12.5% */}
        <g id="ojos">
          <circle cx="182" cy="102" r="8" fill="#16a34a" />
          <circle cx="218" cy="102" r="8" fill="#16a34a" />
        </g>

        {/* corazon — centro del pecho. centro aprox: x=50%, y=32.5% */}
        <g id="corazon">
          <circle cx="200" cy="260" r="34" fill="#dc2626" />
        </g>

        {/* manos — extremos de ambos brazos. centro combinado aprox: x=50%, y=42.5% */}
        <g id="manos">
          <circle cx="60" cy="340" r="30" fill="#f97316" />
          <circle cx="340" cy="340" r="30" fill="#f97316" />
        </g>

        {/* piernas — de la cadera a los pies. centro aprox: x=50%, y=70.6% */}
        <g id="piernas">
          <rect x="155" y="405" width="42" height="320" rx="18" fill="#9333ea" />
          <rect x="203" y="405" width="42" height="320" rx="18" fill="#9333ea" />
        </g>
      </g>
    </svg>
  );
}
