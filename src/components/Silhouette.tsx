export default function Silhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 800"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g id="camera">
        {/* connective body — not an interactive zone, just holds the figure together */}
        <g id="figura-base" fill="none" stroke="currentColor" strokeWidth="3.5" opacity={0.9}>
          <rect x="140" y="175" width="120" height="230" rx="45" />
          <line x1="200" y1="150" x2="200" y2="178" strokeWidth="3.5" />
          <line x1="150" y1="230" x2="120" y2="330" />
          <line x1="250" y1="230" x2="280" y2="330" />
        </g>

        <g id="cerebro">
          <circle cx="200" cy="108" r="54" fill="none" stroke="currentColor" strokeWidth="3.5" />
        </g>

        <g id="ojos">
          <circle cx="181" cy="100" r="6.5" fill="currentColor" />
          <circle cx="219" cy="100" r="6.5" fill="currentColor" />
        </g>

        <g id="corazon">
          <path
            d="M200 248 C194 231 163 231 163 260 C163 288 200 309 200 325 C200 309 237 288 237 260 C237 231 206 231 200 248 Z"
            fill="currentColor"
          />
        </g>

        <g id="manos" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
          <path d="M150 230 L108 268 L64 322" />
          <circle cx="58" cy="336" r="26" fill="currentColor" stroke="none" />
          <path d="M250 230 L292 268 L336 322" />
          <circle cx="342" cy="336" r="26" fill="currentColor" stroke="none" />
        </g>

        <g id="piernas" fill="none" stroke="currentColor" strokeWidth="3.5">
          <rect x="152" y="400" width="46" height="330" rx="22" />
          <rect x="202" y="400" width="46" height="330" rx="22" />
        </g>
      </g>
    </svg>
  );
}
