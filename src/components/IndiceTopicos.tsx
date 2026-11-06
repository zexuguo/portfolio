"use client";

import { useEffect, useRef, useState } from "react";
import { SECCIONES } from "@/data/contenido";

/**
 * Índice lateral por tópicos: nombre de cada sección, resalta la activa y una barra
 * de progreso dentro de cada una. Clicable. En móvil: píldora compacta abajo.
 */
export default function IndiceTopicos() {
  const [activo, setActivo] = useState(0);
  const barras = useRef<(HTMLSpanElement | null)[]>([]);
  const barrasM = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const ref = window.innerHeight * 0.4;
      let act = 0;
      SECCIONES.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.top <= ref) act = i;
        const p = Math.min(Math.max((ref - r.top) / Math.max(r.height, 1), 0), 1);
        const sc = `scaleX(${p})`;
        if (barras.current[i]) barras.current[i]!.style.transform = sc;
        if (barrasM.current[i]) barrasM.current[i]!.style.transform = sc;
      });
      setActivo(act);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(calc); };
    calc();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-300";

  return (
    <>
      <nav aria-label="Índice de la página" className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 min-[1400px]:block">
        <ol className="flex flex-col items-end gap-3">
          {SECCIONES.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} aria-current={i === activo ? "true" : undefined} className={`group flex items-center gap-3 rounded py-0.5 ${focus}`}>
                <span className={`font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${i === activo ? "text-neutral-900 dark:text-neutral-50" : "text-neutral-500 group-hover:text-neutral-800 dark:text-neutral-400 dark:group-hover:text-neutral-200"}`}>
                  {s.label}
                </span>
                <span aria-hidden="true" className="relative block h-0.5 w-8 overflow-hidden rounded bg-neutral-300 dark:bg-neutral-700">
                  <span ref={(el) => { barras.current[i] = el; }} className="absolute inset-0 origin-left bg-indigo-600 dark:bg-indigo-300" style={{ transform: "scaleX(0)" }} />
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <nav aria-label="Índice de la página" className="fixed bottom-3 left-1/2 z-40 -translate-x-1/2 min-[1400px]:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white/90 px-3 py-1.5 shadow-md backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/90">
          <span className="hidden min-w-[5.5rem] font-mono min-[360px]:block text-[11px] uppercase tracking-[0.1em] text-neutral-900 dark:text-neutral-50" aria-hidden="true">{SECCIONES[activo].label}</span>
          <ol className="flex items-center">
            {SECCIONES.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} aria-label={s.label} aria-current={i === activo ? "true" : undefined} className={`flex h-11 w-11 items-center justify-center rounded ${focus}`}>
                  <span className="relative block h-1 w-5 overflow-hidden rounded bg-neutral-300 dark:bg-neutral-600">
                    <span ref={(el) => { barrasM.current[i] = el; }} className="absolute inset-0 origin-left bg-indigo-600 dark:bg-indigo-300" style={{ transform: "scaleX(0)" }} />
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
}
