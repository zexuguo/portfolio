"use client";

// Figura de Zexu, animada por capas (cuerpo, brazos, cabeza, párpados).
// Las capas salen de scripts/figura/preparar.py a partir del render.
//
// ScrollStory anima `rig` (encuadre de cámara) y fija `pose` (el tema que
// se está contando); este componente lo pinta en cada fotograma.

import { useEffect, useRef } from "react";
import type { SectionId } from "@/data/sections";

/** Medidas de las capas (imagen ampliada x2). */
const IMG = { w: 714, h: 1674, pxPerM: 917, cx: 354, floorY: 1656 };
const PIVOT = {
  head: [352, 288],
  armL: [206, 382],
  armR: [512, 382],
} as const;
/** Campo de visión vertical equivalente, para que `dist` se lea como una cámara. */
const TAN_HALF_FOV = Math.tan((30 / 2) * (Math.PI / 180));

export interface CameraRig {
  /** punto encuadrado, en metros (x desde el eje, y desde el suelo) */
  tx: number;
  ty: number;
  /** distancia de cámara: menos = más zoom */
  dist: number;
}

export type Pose = SectionId | null;

export const VIEWS: Record<SectionId | "intro", CameraRig> = {
  intro: { tx: 0, ty: 0.9, dist: 4.2 },
  corazon: { tx: 0, ty: 1.15, dist: 2.9 },
  cerebro: { tx: 0, ty: 1.62, dist: 1.4 },
  manos: { tx: 0, ty: 0.95, dist: 3.7 },
  piernas: { tx: 0, ty: 0.75, dist: 3.6 },
  ojos: { tx: 0, ty: 1.62, dist: 1.05 },
};

const SIDE_SHIFT = 0.2;

export function rigFor(zone: SectionId | "intro", side: "left" | "right" | null): CameraRig {
  const v = VIEWS[zone];
  // texto a la derecha -> figura a la izquierda
  const dir = side === "right" ? 1 : side === "left" ? -1 : 0;
  return { ...v, tx: v.tx + dir * v.dist * SIDE_SHIFT };
}

interface Motion {
  armL: number; // grados, + = hacia fuera
  armR: number;
  head: number; // grados, + = inclina a su izquierda (derecha de pantalla)
  lift: number; // píxeles de imagen hacia arriba
  pulse: number; // escala extra (latido)
  blink: boolean;
}

const REST: Motion = { armL: 0, armR: 0, head: 0, lift: 0, pulse: 0, blink: false };

/** latido doble cada segundo, 0..1 */
function heartbeat(t: number) {
  const p = t % 1;
  const bump = (c: number) => Math.max(0, 1 - Math.abs(p - c) / 0.07);
  return bump(0.1) + 0.6 * bump(0.3);
}

/** Lo que hace el personaje en cada tema. */
const POSES: Record<SectionId, (t: number) => Motion> = {
  // Quién soy: saluda con la mano y late el corazón
  corazon: (t) => ({
    ...REST,
    armR: 32 + 10 * Math.sin(t * 7),
    head: 3,
    pulse: 0.012 * heartbeat(t),
  }),
  // Lo que sé: inclina la cabeza, pensando
  cerebro: (t) => ({
    ...REST,
    head: 7 * Math.sin(t * 1.3),
    armL: 4 + 2 * Math.sin(t * 1.3),
  }),
  // Proyectos: gesticula con las dos manos, como explicando
  manos: (t) => ({
    ...REST,
    armL: 12 + 8 * Math.sin(t * 2.6),
    armR: 12 + 8 * Math.sin(t * 2.6 + Math.PI),
    head: 2 * Math.sin(t * 1.3),
  }),
  // Constancia: trota en el sitio
  piernas: (t) => ({
    ...REST,
    lift: Math.abs(Math.sin(t * 5.5)) * 22,
    armL: 6 + 12 * Math.sin(t * 5.5),
    armR: 6 - 12 * Math.sin(t * 5.5),
    head: 1.5 * Math.sin(t * 5.5),
  }),
  // Hacia dónde voy: mira al frente y parpadea
  ojos: (t) => ({
    ...REST,
    head: 2 * Math.sin(t * 0.8),
    blink: t % 2.4 < 0.14,
  }),
};

function idle(t: number): Motion {
  // respira y parpadea de vez en cuando
  return { ...REST, pulse: 0.004 * Math.sin(t * 1.4), blink: (t + 1.3) % 4.6 < 0.13 };
}

const LAYERS = [
  { key: "body", src: "/figura/cuerpo.webp" },
  { key: "armL", src: "/figura/brazo-izq.webp" },
  { key: "armR", src: "/figura/brazo-der.webp" },
  { key: "head", src: "/figura/cabeza.webp" },
] as const;

export default function Figure({
  rig,
  pose,
  className,
}: {
  rig: React.RefObject<CameraRig>;
  pose: React.RefObject<Pose>;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const root = rootRef.current;
    if (!host || !root) return;
    const parts: Record<string, HTMLElement> = {};
    root.querySelectorAll<HTMLElement>("[data-part]").forEach((el) => {
      parts[el.dataset.part!] = el;
    });

    let raf = 0;
    let last = performance.now();
    const start = last;
    let weight = 0; // how much of the current pose is applied (eases in/out)
    let shown: SectionId | null = null; // pose being shown (kept while fading out)

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const t = (now - start) / 1000;

      // ---- camera
      const r = rig.current;
      const W = host.clientWidth;
      const H = host.clientHeight;
      const k = H / (2 * r.dist * TAN_HALF_FOV) / IMG.pxPerM;
      const x = W / 2 - (IMG.cx + r.tx * IMG.pxPerM) * k;
      const y = H / 2 - (IMG.floorY - r.ty * IMG.pxPerM) * k;
      root.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${k})`;

      // ---- pose blending
      const wanted = pose.current;
      if (wanted && wanted !== shown && weight < 0.05) shown = wanted;
      const target = wanted && wanted === shown ? 1 : 0;
      weight += (target - weight) * (1 - Math.exp(-dt * 6));
      if (target === 0 && weight < 0.01) shown = null;

      const base = idle(t);
      const act = shown ? POSES[shown](t) : REST;
      const m: Motion = {
        armL: act.armL * weight,
        armR: act.armR * weight,
        head: act.head * weight,
        lift: act.lift * weight,
        pulse: base.pulse + act.pulse * weight,
        blink: base.blink || (weight > 0.5 && act.blink),
      };

      const set = (key: string, css: string) => {
        const el = parts[key];
        if (el) el.style.transform = css;
      };
      set("figure", `translateY(${-m.lift}px) scale(${1 + m.pulse}, ${1 + m.pulse * 1.4})`);
      set("armL", `rotate(${m.armL}deg)`);
      set("armR", `rotate(${-m.armR}deg)`);
      set("head", `rotate(${-m.head}deg)`);
      const lids = parts.lids;
      if (lids) lids.style.opacity = m.blink ? "1" : "0";
      // the shadow shrinks while jumping
      const sh = parts.shadow;
      if (sh) sh.style.transform = `scale(${1 - m.lift / 120})`;
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [rig, pose]);

  const layerStyle = (pivot?: readonly [number, number]): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    width: IMG.w,
    height: IMG.h,
    transformOrigin: pivot ? `${pivot[0]}px ${pivot[1]}px` : undefined,
    willChange: "transform",
  });

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      <div
        ref={rootRef}
        className="absolute left-0 top-0 select-none pointer-events-none"
        style={{ width: IMG.w, height: IMG.h, transformOrigin: "0 0", willChange: "transform" }}
      >
        {/* contact shadow on the floor */}
        <div
          data-part="shadow"
          className="absolute rounded-[50%] bg-black/25 dark:bg-black/60 blur-xl"
          style={{ left: IMG.cx - 230, top: IMG.floorY - 34, width: 460, height: 60 }}
        />
        <div
          data-part="figure"
          style={{ ...layerStyle(), transformOrigin: `${IMG.cx}px ${IMG.floorY}px` }}
        >
          {LAYERS.map((l) => (
            <div key={l.key} data-part={l.key} style={layerStyle(l.key === "body" ? undefined : PIVOT[l.key])}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.src} width={IMG.w} height={IMG.h} alt="" draggable={false} className="block max-w-none" />
              {l.key === "head" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  data-part="lids"
                  src="/figura/parpados.webp"
                  width={IMG.w}
                  height={IMG.h}
                  alt=""
                  draggable={false}
                  className="absolute inset-0 block max-w-none"
                  style={{ opacity: 0 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
