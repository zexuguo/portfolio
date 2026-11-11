/** Puente entre los bloques (Build) y los cursores constructores (SwarmCursors). Código propio. */
export const CURSORES = [
  { name: "Carla", color: "#34C759" },
  { name: "Dani", color: "#2EC4B6" },
  { name: "Eva", color: "#4F8CFF" },
  { name: "Hugo", color: "#8B5CF6" },
];

/**
 * Un bloque de la página que solo se ve cuando un cursor lo ha construido.
 * Estados: pendiente (invisible, con esqueleto) → construyendo (el cursor lo va descubriendo)
 * → listo (visible para siempre). Si la construcción se cancela, vuelve a pendiente.
 */
export interface Bloque {
  el: Element;
  kind: "rect" | "text";
  estado: "pendiente" | "construyendo" | "listo";
  /** false = el bloque no debe construirse ahora (p. ej. un tema de la figura que no está activo) */
  activo: () => boolean;
  /** 0→1: cuánto del bloque ha descubierto ya el cursor */
  progreso: (p: number) => void;
  /** el cursor ha terminado: el bloque queda visible */
  listo: () => void;
  /** se cancela: el bloque vuelve a estar invisible, sin dejar nada a medias */
  cancelar: () => void;
}

export const swarmBridge: {
  blocks: Set<Bloque>;
  /** true cuando SwarmCursors está montado y puede construir */
  listo: boolean;
  /** avisa a SwarmCursors de que algo ha cambiado (nuevo bloque, tema activo…) */
  despertar: () => void;
  /** cuántos cursores hay trabajando ahora mismo (para pausar las paradas de scroll) */
  ocupados: () => number;
} = { blocks: new Set(), listo: false, despertar: () => {}, ocupados: () => 0 };
