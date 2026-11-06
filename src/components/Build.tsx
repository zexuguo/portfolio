"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { swarmBridge, type Bloque } from "@/lib/swarm";

/**
 * Bloque que construyen los cursores (código propio; idea inspirada en Swarm de Joel Califa,
 * sin copiar código de nadie).
 *
 * Reglas: un bloque no construido es INVISIBLE pero reserva su hueco (sin saltos) y enseña solo
 * un esqueleto fino con su medida. Se descubre únicamente dentro del recuadro que arrastra un
 * cursor. Si la construcción se cancela (sale de pantalla, scroll rápido, redimensionar) vuelve
 * a ser invisible y se construye cuando se pueda. Con prefers-reduced-motion todo se ve sin cursores.
 */
interface Props {
  children: ReactNode;
  kind?: "rect" | "text";
  /** modo controlado: solo se construye mientras sea true (y se reinicia al pasar a false) */
  play?: boolean;
  className?: string;
}

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Build({ children, kind = "rect", play, className = "" }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const medida = useRef<HTMLSpanElement>(null);
  const playRef = useRef(play);
  const bloque = useRef<Bloque | null>(null);

  const setEstado = (e: Bloque["estado"]) => {
    if (bloque.current) bloque.current.estado = e;
    if (root.current) root.current.dataset.estado = e;
  };

  useLayoutEffect(() => {
    const el = root.current, c = content.current;
    if (!el || !c) return;
    if (reduced()) { el.dataset.estado = "listo"; return; } // todo visible, sin cursores
    const b: Bloque = {
      el, kind, estado: "pendiente",
      activo: () => playRef.current !== false,
      progreso: (p) => {
        if (b.estado !== "construyendo") setEstado("construyendo");
        const r = `${(1 - p) * 100}%`;
        // el contenido solo se ve dentro del recuadro que el cursor va dibujando
        c.style.clipPath = kind === "text" ? `inset(-4px ${r} -4px 0)` : `inset(0 ${r} ${r} 0 round 12px)`;
      },
      listo: () => { c.style.clipPath = ""; setEstado("listo"); el.dataset.construido = "cursor"; },
      cancelar: () => { c.style.clipPath = ""; setEstado("pendiente"); },
    };
    bloque.current = b;
    el.dataset.estado = "pendiente";
    swarmBridge.blocks.add(b);
    swarmBridge.despertar();

    // esqueleto: muestra la medida real del hueco
    const ro = new ResizeObserver(() => {
      if (medida.current) medida.current.textContent = `${Math.round(el.offsetWidth)} × ${Math.round(el.offsetHeight)}`;
    });
    ro.observe(el);

    // red de seguridad: si los cursores no llegan a montarse nunca, no dejar la página vacía
    const t = setTimeout(() => { if (!swarmBridge.listo && b.estado === "pendiente") b.listo(); }, 3000);
    return () => { clearTimeout(t); ro.disconnect(); swarmBridge.blocks.delete(b); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // modo controlado (temas de la figura): al desactivarse vuelve a pendiente y cancela lo que haya
  useEffect(() => {
    playRef.current = play;
    const b = bloque.current;
    if (!b || play === undefined) return;
    if (!play && b.estado !== "pendiente") b.cancelar();
    if (!play) b.estado = "pendiente";
    swarmBridge.despertar();
  }, [play]);

  return (
    <div ref={root} className={`build relative ${className}`} data-estado="pendiente">
      <div ref={content} className="build-content h-full">{children}</div>
      <div aria-hidden="true" className="build-skel pointer-events-none absolute inset-0 rounded-xl border border-dashed border-neutral-400/40 dark:border-neutral-500/40">
        <span ref={medida} className="absolute bottom-1 right-2 font-mono text-[10px] text-neutral-500 dark:text-neutral-400" />
      </div>
    </div>
  );
}
