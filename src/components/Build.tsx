"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { pedirConstruccion } from "@/lib/swarm";

/**
 * Bloque que construyen los cursores del enjambre (los mismos que orbitan).
 * El contenido está siempre presente con poca opacidad (.15) y sube a 1 mientras
 * 2–3 cursores lo «dibujan» (≈0,5 s). Si el scroll es rápido o no hay cursores
 * libres, salta al estado final. Con prefers-reduced-motion no se anima nada.
 * Código propio; idea inspirada en Swarm de Joel Califa (sin copiar código).
 */
interface Props {
  children: ReactNode;
  kind?: "rect" | "text";
  /** segundos de espera antes de empezar */
  delay?: number;
  /** modo controlado: construye cuando pasa a true y se reinicia al pasar a false */
  play?: boolean;
  start?: string;
  className?: string;
}

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Build({ children, kind = "rect", delay = 0, play, start = "top 96%", className = "" }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setP = (p: number) => {
    const c = content.current;
    if (!c || done.current) return;
    c.style.opacity = String(0.15 + 0.85 * p);
    c.style.transform = p < 1 ? `translateY(${(1 - p) * 5}px)` : "";
  };
  const reveal = () => {
    const c = content.current;
    if (timer.current) clearTimeout(timer.current);
    done.current = true;
    if (!c) return;
    c.classList.remove("build-init");
    c.style.opacity = "";
    c.style.transform = "";
  };
  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    done.current = false;
    const c = content.current;
    if (!c) return;
    c.classList.add("build-init");
    c.style.opacity = "";
    c.style.transform = "";
  };
  const run = (instant = false) => {
    if (done.current) return;
    if (instant) return reveal();
    // red de seguridad: si algo falla, el contenido se muestra igualmente
    timer.current = setTimeout(reveal, 1800 + delay * 1000);
    pedirConstruccion({ el: root.current!, kind, delay, onProgress: setP, onDone: reveal });
  };

  useLayoutEffect(() => {
    if (reduced()) { content.current?.classList.remove("build-init"); return; }
    gsap.registerPlugin(ScrollTrigger);
    reset();
    if (play !== undefined) return;
    const st = ScrollTrigger.create({
      trigger: root.current,
      start,
      once: true,
      onEnter: (self) => run(Math.abs(self.getVelocity()) > 2200), // scroll rápido: estado final
    });
    return () => { st.kill(); if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (play === undefined || reduced()) return;
    if (play) { reset(); run(); } else reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play]);

  return (
    <div ref={root} className={className}>
      <div ref={content} className="build-init h-full">{children}</div>
    </div>
  );
}
