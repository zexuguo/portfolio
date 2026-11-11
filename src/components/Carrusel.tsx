"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { PROYECTOS } from "@/data/proyectos";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-300";
const INTERVALO = 7000;

/**
 * Carrusel accesible de proyectos (código propio).
 * - scroll-snap: el deslizar con el dedo funciona de serie en móvil.
 * - Flechas, puntos y teclas ← →. Cada tarjeta muestra su caso de estudio completo.
 * - Rota solo si no hay prefers-reduced-motion; se detiene al pasar el ratón, con el foco
 *   dentro, con la pestaña oculta o si la persona pulsa «Pausar» (o usa los controles).
 */
export default function Carrusel() {
  const track = useRef<HTMLUListElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [activo, setActivo] = useState(0);
  const [reduced, setReduced] = useState(true); // true hasta saber la preferencia: no rotar de más
  const [usuarioPausa, setUsuarioPausa] = useState(false);
  const [encima, setEncima] = useState(false);
  const [visible, setVisible] = useState(false);
  const n = PROYECTOS.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const upd = () => setReduced(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);

  // slide activo = el más visible
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting && e.intersectionRatio > 0.6) setActivo(Number((e.target as HTMLElement).dataset.i)); }),
      { root: t, threshold: [0.6] },
    );
    t.querySelectorAll(":scope > li").forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, []);

  // ¿el carrusel está en pantalla?
  useEffect(() => {
    const r = root.current;
    if (!r) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(r);
    return () => io.disconnect();
  }, []);

  const ir = useCallback((i: number) => {
    const t = track.current;
    const li = t?.children[((i % n) + n) % n] as HTMLElement | undefined;
    if (!t || !li) return;
    t.scrollTo({ left: li.offsetLeft - (t.clientWidth - li.clientWidth) / 2, behavior: reduced ? "auto" : "smooth" });
  }, [n, reduced]);

  const rotando = !reduced && !usuarioPausa && !encima && visible;
  useEffect(() => {
    if (!rotando) return;
    const id = setInterval(() => { if (!document.hidden) ir(activo + 1); }, INTERVALO);
    return () => clearInterval(id);
  }, [rotando, activo, ir]);

  const manual = (i: number) => { setUsuarioPausa(true); ir(i); };
  const btn = `flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900 ${focus}`;

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Proyectos destacados"
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      onFocus={() => setEncima(true)}
      onBlur={() => setEncima(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); manual(activo + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); manual(activo - 1); }
      }}
    >
      <ul
        ref={track}
        tabIndex={0}
        aria-label="Lista de proyectos; usa las flechas izquierda y derecha"
        className={`relative flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${focus}`}
      >
        {PROYECTOS.map((p, i) => (
          <li
            key={p.nombre}
            data-i={i}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${n}: ${p.nombre}`}
            className={`w-[92%] shrink-0 snap-center transition-opacity duration-300 md:w-[88%] ${i === activo ? "opacity-100" : "opacity-60"}`}
          >
            <article className="grid h-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 md:grid-cols-[1fr_1.1fr]">
              <div className="flex flex-col border-b border-neutral-200 dark:border-neutral-800 md:border-b-0 md:border-r">
                <figure>
                  <Image src={p.imagen} alt={p.alt} width={960} height={600} unoptimized className="aspect-[16/10] w-full object-cover" />
                  <figcaption className="px-4 py-2 font-mono text-xs text-neutral-600 dark:text-neutral-400">{p.nota}</figcaption>
                </figure>
                <div className="flex flex-1 flex-col justify-end gap-3 px-4 pb-4 pt-1">
                  <ul className="flex flex-wrap gap-1.5">
                    {p.stack.map((s) => (
                      <li key={s} className="rounded-full border border-neutral-300 px-2.5 py-1 font-mono text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">{s}</li>
                    ))}
                  </ul>
                  {p.href && (
                    <a href={p.href} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 w-fit items-center text-sm font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-300 ${focus}`}>
                      Ver proyecto ↗
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-col p-5 md:p-6">
                <h3 className="text-xl font-semibold leading-7 text-neutral-900 dark:text-neutral-50">{p.nombre}</h3>
                <p className="mt-1.5 text-base leading-6 text-neutral-700 dark:text-neutral-300">{p.resumen}</p>
                <dl className="mt-4 space-y-2.5 text-base leading-6">
                  {([["Problema", p.caso.problema], ["Qué hice", p.caso.hice], ["Reto técnico", p.caso.reto], ["Resultado", p.caso.resultado]] as const).map(([k, v]) =>
                    v ? (
                      <div key={k}>
                        <dt className="font-mono text-xs uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-400">{k}</dt>
                        <dd className="text-neutral-700 dark:text-neutral-300">{v}</dd>
                      </div>
                    ) : null,
                  )}
                </dl>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <p className="sr-only" aria-live={rotando ? "off" : "polite"}>{`Proyecto ${activo + 1} de ${n}: ${PROYECTOS[activo].nombre}`}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="flex items-center gap-2">
          <button type="button" className={btn} aria-label="Proyecto anterior" onClick={() => manual(activo - 1)}>←</button>
          <button type="button" className={btn} aria-label="Proyecto siguiente" onClick={() => manual(activo + 1)}>→</button>
          {!reduced && (
            <button
              type="button"
              className={`ml-1 min-h-11 rounded-full px-3 py-2 font-mono text-xs text-neutral-700 hover:underline dark:text-neutral-300 ${focus}`}
              aria-pressed={usuarioPausa}
              onClick={() => setUsuarioPausa((v) => !v)}
            >
              {usuarioPausa ? "Reanudar rotación" : "Pausar rotación"}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1" role="group" aria-label="Elegir proyecto">
          {PROYECTOS.map((p, i) => (
            <button
              key={p.nombre}
              type="button"
              aria-label={`Ir al proyecto ${i + 1}: ${p.nombre}`}
              aria-current={i === activo ? "true" : undefined}
              onClick={() => manual(i)}
              className={`flex h-11 w-11 items-center justify-center rounded-full ${focus}`}
            >
              <span className={`block h-2 rounded-full transition-all ${i === activo ? "w-5 bg-indigo-600 dark:bg-indigo-300" : "w-2 bg-neutral-400 dark:bg-neutral-600"}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
