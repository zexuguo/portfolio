"use client";

// Figura de Zexu dibujada en un <canvas> a partir de capas (cuerpo, cabeza,
// brazos, párpados). Las capas salen de scripts/figura/preparar.py, sobre el
// render ampliado x4, así que se ven nítidas también de cerca.
//
// ScrollStory anima `rig` (encuadre de cámara) y fija `pose` (el tema que se
// está contando). Aquí cada fotograma: cámara, respiración, parpadeo y el
// gesto del tema. Todos los movimientos pasan por muelles amortiguados, así
// que nada empieza ni termina de golpe.

import { useEffect, useRef } from "react";
import type { SectionId } from "@/data/sections";

/** Medidas de las capas (imagen x4 recortada). */
const IMG = { w: 1391, h: 3313, pxPerM: 1834, cx: 693, floorY: 3296 };
const PIVOT = {
  head: [689, 560],
} as const;
const SRC = {
  body: "/figura/cuerpo.webp",
  armL: "/figura/brazo-izq.webp",
  armR: "/figura/brazo-der.webp",
  head: "/figura/cabeza.webp",
  lids: "/figura/parpados.webp",
} as const;
type LayerKey = keyof typeof SRC;

/** Campo de visión vertical equivalente, para que `dist` se lea como una cámara. */
const TAN_HALF_FOV = Math.tan((30 / 2) * (Math.PI / 180));
/** Nunca ampliar más allá de esto (píxeles de imagen por píxel físico). */
const MAX_DEVICE_SCALE = 1.15;

export interface CameraRig {
  /** punto encuadrado, en metros (x desde el eje, y desde el suelo) */
  tx: number;
  ty: number;
  /** distancia de cámara: menos = más cerca */
  dist: number;
}

export type Pose = SectionId | null;

export const VIEWS: Record<SectionId | "intro", CameraRig> = {
  intro: { tx: 0, ty: 0.92, dist: 4.4 },
  corazon: { tx: 0, ty: 1.22, dist: 2.7 },
  cerebro: { tx: 0, ty: 1.6, dist: 1.85 },
  manos: { tx: 0, ty: 1.0, dist: 3.6 },
  piernas: { tx: 0, ty: 0.93, dist: 4.2 },
  ojos: { tx: 0, ty: 1.42, dist: 2.3 },
};

const SIDE_SHIFT = 0.21;

export function rigFor(zone: SectionId | "intro", side: "left" | "right" | null): CameraRig {
  const v = VIEWS[zone];
  // texto a la derecha -> figura a la izquierda
  const dir = side === "right" ? 1 : side === "left" ? -1 : 0;
  return { ...v, tx: v.tx + dir * v.dist * SIDE_SHIFT };
}

// ------------------------------------------------------------------ motion

interface Motion {
  head: number; // grados, + = inclina hacia la derecha de pantalla
  headY: number; // píxeles de imagen, + = sube
  lift: number; // píxeles de imagen, + = sube todo el cuerpo
  lean: number; // escala extra desde los pies (acercarse un poco)
}
const KEYS = ["head", "headY", "lift", "lean"] as const;
const REST: Motion = { head: 0, headY: 0, lift: 0, lean: 0 };
/** rigidez de cada muelle (más = sigue antes al objetivo) */
const STIFF: Motion = { head: 6, headY: 7, lift: 15, lean: 5 };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};
/** 0 → 1 → 0 entre a y b, con rampas suaves de `r` segundos */
const window01 = (t: number, a: number, b: number, r: number) =>
  smooth((t - a) / r) * smooth((b - t) / r);

/** Gesto de cada tema; `t` = segundos desde que se llegó al tema. */
const POSES: Record<SectionId, (t: number) => Partial<Motion>> = {
  // Quién soy: inclina la cabeza y asiente una vez, como saludando
  corazon: (t) => {
    const nod = window01(t, 0.2, 1.0, 0.3);
    return { head: 3, headY: -9 * nod };
  },
  // Lo que sé: cabeza inclinada, pensando
  cerebro: (t) => ({ head: -4 + 0.8 * Math.sin(t * 0.9) }),
  // Proyectos: se inclina un poco hacia delante y asiente al explicar
  manos: (t) => ({
    lean: 0.006,
    head: 1.5 * Math.sin(t * 0.8),
    headY: -3.5 * Math.max(0, Math.sin(t * 2.2)) * smooth((t - 0.3) / 0.6),
  }),
  // Constancia: rebota un par de veces sobre las puntas, listo para salir
  piernas: (t) => {
    const hop = window01(t, 0.1, 1.3, 0.1) * Math.abs(Math.sin((t - 0.1) * Math.PI * 1.67));
    return { lift: 20 * hop, head: 0.8 * hop };
  },
  // Hacia dónde voy: levanta la barbilla y se acerca un paso
  ojos: () => ({ headY: 7, lean: 0.012 }),
};

/** parpadeos a intervalos naturales (y uno doble de vez en cuando) */
function makeBlinker() {
  let next = 1.8;
  let start = -10;
  let double = false;
  return (t: number, poseStart: number, pose: Pose) => {
    if (pose === "ojos" && t - poseStart > 0.5 && t - poseStart < 0.55) {
      start = t;
      double = true;
    } else if (t > next) {
      start = t;
      double = Math.random() < 0.2;
      next = t + 2.6 + Math.random() * 3.2;
    }
    const dur = 0.17;
    const p = (t - start) / dur;
    const one = (x: number) => (x >= 0 && x <= 1 ? 1 - Math.abs(2 * x - 1) : 0);
    return Math.min(1, one(p) + (double ? one(p - 1.6) : 0));
  };
}

export default function Figure({
  rig,
  pose,
  className,
}: {
  rig: React.RefObject<CameraRig>;
  pose: React.RefObject<Pose>;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const imgs = {} as Record<LayerKey, HTMLImageElement>;
    let loaded = 0;
    (Object.keys(SRC) as LayerKey[]).forEach((k) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => loaded++;
      img.src = SRC[k];
      imgs[k] = img;
    });
    const total = Object.keys(SRC).length;

    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const cur: Motion = { ...REST };
    const vel: Motion = { ...REST };
    let shown: Pose = null;
    let poseStart = 0;
    const blink = makeBlinker();

    let raf = 0;
    let last = performance.now();
    const t0 = last;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;

      // ---- size (CSS px -> device px)
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (!cw || !ch) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const bw = Math.round(cw * dpr);
      const bh = Math.round(ch * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      if (loaded < total) return;

      // ---- pose target
      const wanted = reduce.matches ? null : pose.current;
      if (wanted !== shown) {
        shown = wanted;
        poseStart = t;
      }
      const target: Motion = { ...REST, ...(shown ? POSES[shown](t - poseStart) : {}) };
      for (const k of KEYS) {
        // critically damped spring toward the target
        const w = STIFF[k];
        vel[k] += (w * w * (target[k] - cur[k]) - 2 * w * vel[k]) * dt;
        cur[k] += vel[k] * dt;
      }
      const still = reduce.matches;
      const breathe = still ? 0 : Math.sin((t * 2 * Math.PI) / 4.2);
      const sway = still ? 0 : 0.18 * Math.sin((t * 2 * Math.PI) / 7.5);
      const headIdle = still ? 0 : 0.5 * Math.sin(t * 0.7 + 1);
      const lids = still ? 0 : blink(t, poseStart, shown);

      // ---- camera
      const r = rig.current;
      let k = ch / (2 * r.dist * TAN_HALF_FOV) / IMG.pxPerM;
      k = Math.min(k, MAX_DEVICE_SCALE / dpr);
      const x = cw / 2 - (IMG.cx + r.tx * IMG.pxPerM) * k;
      const y = ch / 2 - (IMG.floorY - r.ty * IMG.pxPerM) * k;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, bw, bh);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * x, dpr * y);

      // ---- dark mode: a faint light behind the figure so the black clothes read
      if (dark.matches) {
        const cy = IMG.floorY - 0.95 * IMG.pxPerM;
        const glow = ctx.createRadialGradient(IMG.cx, cy, 0, IMG.cx, cy, 1500);
        glow.addColorStop(0, "rgba(255,255,255,0.075)");
        glow.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(IMG.cx - 1500, cy - 1500, 3000, 3000);
      }

      // ---- contact shadow (shrinks and fades while in the air)
      const air = clamp01(cur.lift / 60);
      const shadowA = (dark.matches ? 0.55 : 0.2) * (1 - 0.5 * air);
      ctx.save();
      ctx.translate(IMG.cx, IMG.floorY - 10);
      ctx.scale(1 - 0.25 * air, 0.13 * (1 - 0.25 * air));
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 470);
      g.addColorStop(0, `rgba(0,0,0,${shadowA})`);
      g.addColorStop(0.55, `rgba(0,0,0,${shadowA * 0.45})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, 470, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ---- figure, pivoting on the feet
      ctx.save();
      ctx.translate(IMG.cx, IMG.floorY);
      ctx.rotate((sway * Math.PI) / 180);
      const s = 1 + cur.lean;
      ctx.scale(s, s * (1 + 0.0035 * breathe));
      ctx.translate(-IMG.cx, -IMG.floorY - cur.lift);

      // body and arms move together (rotating a cut-out arm reads as a paper puppet);
      // only the head moves on its own
      for (const key of ["body", "armL", "armR"] as const) ctx.drawImage(imgs[key], 0, 0, IMG.w, IMG.h);
      ctx.save();
      ctx.translate(PIVOT.head[0], PIVOT.head[1] - cur.headY - 2 * breathe);
      ctx.rotate((-(cur.head + headIdle) * Math.PI) / 180);
      ctx.translate(-PIVOT.head[0], -PIVOT.head[1]);
      ctx.drawImage(imgs.head, 0, 0, IMG.w, IMG.h);
      if (lids > 0.01) {
        ctx.globalAlpha = lids;
        ctx.drawImage(imgs.lids, 0, 0, IMG.w, IMG.h);
      }
      ctx.restore();
      ctx.restore();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [rig, pose]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
