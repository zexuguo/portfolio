"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * «Construcción» de un bloque por un cursor con nombre (código propio; la idea
 * está inspirada en Swarm de Joel Califa, sin copiar código de nadie).
 *
 * rect: un cursor llega, arrastra un recuadro con su medida (An × Al), lo coloca
 *       con un clic y el contenido aparece dentro.
 * text: un cursor «escribe» el texto de izquierda a derecha.
 *
 * Se dispara al hacer scroll (ScrollTrigger) o, si se pasa `play`, cuando éste
 * pasa a true (se repite cada vez). Con prefers-reduced-motion no hace nada:
 * la página se ve completa. Solo anima transform/opacity/clip-path.
 */
export const CURSORES = [
  { name: "Ana", color: "#FF6B6B" },
  { name: "Biel", color: "#FFB020" },
  { name: "Carla", color: "#34C759" },
  { name: "Dani", color: "#2EC4B6" },
  { name: "Eva", color: "#4F8CFF" },
  { name: "Hugo", color: "#8B5CF6" },
  { name: "Irene", color: "#FF5FA2" },
];

export const cursorDe = (seed: number | string) => {
  const n = typeof seed === "number" ? seed : [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return CURSORES[n % CURSORES.length];
};

interface Props {
  children: ReactNode;
  /** índice o texto para elegir el cursor (nombre y color) */
  seed?: number | string;
  kind?: "rect" | "text";
  /** segundos de espera antes de empezar */
  delay?: number;
  /** modo controlado: construye cuando pasa a true y se reinicia al pasar a false */
  play?: boolean;
  start?: string;
  className?: string;
}

const hidden = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Build({ children, seed = 0, kind = "rect", delay = 0, play, start = "top 90%", className = "" }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const ghost = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLSpanElement>(null);
  const cur = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const { name, color } = cursorDe(seed);

  const reset = () => {
    tl.current?.kill();
    tl.current = null;
    gsap.set(content.current, kind === "text" ? { opacity: 1, clipPath: "inset(-4px 100% -4px 0)", y: 0 } : { opacity: 0, y: 0 });
    gsap.set([ghost.current, cur.current], { opacity: 0 });
    content.current?.classList.remove("build-init");
  };
  const show = () => {
    tl.current?.kill();
    gsap.set(content.current, { opacity: 1, clipPath: "none", y: 0 });
    gsap.set([ghost.current, cur.current], { opacity: 0 });
    content.current?.classList.remove("build-init");
  };

  const build = () => {
    const r = root.current, c = content.current, g = ghost.current, b = box.current, cu = cur.current, bd = badge.current;
    if (!r || !c || !g || !b || !cu || !bd) return;
    const w = r.offsetWidth, h = r.offsetHeight;
    if (!w || !h) return show(); // bloque oculto (otra versión responsive): sin animar
    tl.current?.kill();
    reset();
    const t = gsap.timeline({ delay: delay + 0.05 });
    tl.current = t;
    const fromX = w * (0.25 + Math.random() * 0.5);
    gsap.set(cu, { x: fromX, y: -80, scale: 1, opacity: 0 });
    if (kind === "text") {
      const dur = Math.min(0.35 + w / 900, 1.1);
      const y = Math.min(h * 0.7, h - 4);
      t.to(cu, { opacity: 1, x: 0, y, duration: 0.45, ease: "power3.out" })
        .to(c, { clipPath: "inset(-4px 0% -4px 0)", duration: dur, ease: "none" }, ">0.05")
        .to(cu, { x: w, duration: dur, ease: "none" }, "<")
        .set(c, { clipPath: "none" })
        .to(cu, { opacity: 0, y: y + 14, duration: 0.35, ease: "power2.in" }, ">0.1");
    } else {
      const k = { p: 0 };
      gsap.set(b, { scaleX: 0, scaleY: 0 });
      gsap.set(bd, { opacity: 0, xPercent: -100, x: 0, y: 8 });
      t.to(cu, { opacity: 1, x: 0, y: 0, duration: 0.5, ease: "power3.out" })
        .set(g, { opacity: 1 })
        .set(bd, { opacity: 1 })
        .to(b, { scaleX: 1, scaleY: 1, duration: 0.75, ease: "power2.inOut" })
        .to(cu, { x: w, y: h, duration: 0.75, ease: "power2.inOut" }, "<")
        .to(bd, { x: w, y: h + 8, duration: 0.75, ease: "power2.inOut" }, "<")
        .to(k, { p: 1, duration: 0.75, ease: "power2.inOut", onUpdate: () => { bd.textContent = `${Math.round(w * k.p)} × ${Math.round(h * k.p)}`; } }, "<")
        .to(cu, { scale: 0.8, duration: 0.09, yoyo: true, repeat: 1, transformOrigin: "0 0" }) // clic
        .to(g, { opacity: 0, duration: 0.4 }, "<0.05")
        .fromTo(c, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "<")
        .to(cu, { opacity: 0, duration: 0.35, ease: "power2.in" }, ">0.25");
    }
  };

  // estado inicial: oculto (antes de pintar) salvo con reduced-motion
  useLayoutEffect(() => {
    if (hidden()) return;
    gsap.registerPlugin(ScrollTrigger);
    reset();
    if (play !== undefined) return;
    const st = ScrollTrigger.create({ trigger: root.current, start, once: true, onEnter: build });
    return () => { st.kill(); tl.current?.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // modo controlado
  useEffect(() => {
    if (play === undefined || hidden()) return;
    if (play) build(); else reset();
    return () => { tl.current?.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play]);

  return (
    <div ref={root} className={`relative ${className}`}>
      <div ref={content} className="build-init h-full">{children}</div>
      <div ref={ghost} aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0">
        <div ref={box} className="absolute inset-0 origin-top-left rounded-xl border" style={{ borderColor: color, background: `${color}1f` }} />
        <span
          ref={badge}
          className="absolute left-0 top-0 rounded px-1.5 py-0.5 font-mono text-[10px] leading-none text-neutral-900"
          style={{ background: color }}
        />
      </div>
      <div ref={cur} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-20 opacity-0 will-change-transform">
        <svg width="18" height="18" viewBox="0 0 18 18" className="drop-shadow">
          <path d="M0 0v15l4-3.5 3 5.5 2.5-1.2-2.9-5.4h4.9z" fill={color} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        <span className="absolute left-3.5 top-4 whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium leading-none text-neutral-900" style={{ background: color }}>
          {name}
        </span>
      </div>
    </div>
  );
}
