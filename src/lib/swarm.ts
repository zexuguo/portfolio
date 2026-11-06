/** Puente entre los bloques (Build) y el enjambre de cursores (SwarmCursors). Código propio. */
export const CURSORES = [
  { name: "Ana", color: "#FF6B6B" },
  { name: "Biel", color: "#FFB020" },
  { name: "Carla", color: "#34C759" },
  { name: "Dani", color: "#2EC4B6" },
  { name: "Eva", color: "#4F8CFF" },
  { name: "Hugo", color: "#8B5CF6" },
  { name: "Irene", color: "#FF5FA2" },
];

export interface BuildRequest {
  el: Element;
  kind: "rect" | "text";
  /** segundos de espera antes de empezar */
  delay: number;
  /** 0→1 mientras los cursores construyen (el bloque va ganando opacidad) */
  onProgress: (p: number) => void;
  /** se llama siempre, también si no hay cursores libres (se muestra al instante) */
  onDone: () => void;
}

export const swarmBridge: {
  request: ((r: BuildRequest) => void) | null;
  waiting: BuildRequest[];
} = { request: null, waiting: [] };

/** Pide a los cursores que construyan un bloque; si el enjambre aún no está listo, espera. */
export function pedirConstruccion(r: BuildRequest) {
  if (swarmBridge.request) swarmBridge.request(r);
  else swarmBridge.waiting.push(r);
}
