"use client";

// Figura de Zexu: render low-poly (public/figura/zexu.webp, fondo quitado).
// La "cámara" no se mueve aquí: ScrollStory anima el objeto `rig` con GSAP
// y este componente lo convierte en zoom, encuadre y un ligero giro 3D en
// cada fotograma.

import { useEffect, useRef } from "react";
import type { SectionId } from "@/data/sections";

const SRC = "/figura/zexu.webp";
/** Medidas de la imagen: píxeles por metro, eje central y suelo. */
const IMG = { w: 718, h: 1668, pxPerM: 917, cx: 357, floorY: 1656 };
/** Campo de visión vertical equivalente (para que `dist` se lea como una cámara). */
const TAN_HALF_FOV = Math.tan((30 / 2) * (Math.PI / 180));

export interface CameraRig {
  /** punto encuadrado, en metros (x desde el eje, y desde el suelo) */
  tx: number;
  ty: number;
  /** distancia de cámara: menos = más zoom */
  dist: number;
  /** giro de la figura hacia el texto (radianes) */
  turn: number;
}

/** Encuadre de cada zona. */
export const VIEWS: Record<SectionId | "intro", Omit<CameraRig, "turn">> = {
  intro: { tx: 0, ty: 0.9, dist: 4.2 },
  corazon: { tx: 0, ty: 1.22, dist: 2.5 },
  cerebro: { tx: 0, ty: 1.64, dist: 1.35 },
  manos: { tx: 0, ty: 0.95, dist: 3.6 },
  piernas: { tx: 0, ty: 0.5, dist: 2.6 },
  ojos: { tx: 0, ty: 1.63, dist: 1.0 },
};

/** Cuánto se aparta la figura del centro para dejar sitio al texto. */
const SIDE_SHIFT = 0.2;

export function rigFor(
  zone: SectionId | "intro",
  side: "left" | "right" | null
): CameraRig {
  const v = VIEWS[zone];
  // texto a la derecha -> figura a la izquierda
  const dir = side === "right" ? 1 : side === "left" ? -1 : 0;
  return { ...v, tx: v.tx + dir * v.dist * SIDE_SHIFT, turn: dir * 0.35 };
}

export default function Figure({
  rig,
  className,
}: {
  rig: React.RefObject<CameraRig>;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const img = imgRef.current;
    if (!host || !img) return;

    let raf = 0;
    const start = performance.now();
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const r = rig.current;
      const W = host.clientWidth;
      const H = host.clientHeight;
      // screen pixels per metre at this camera distance
      const s = H / (2 * r.dist * TAN_HALF_FOV);
      const k = s / IMG.pxPerM;
      const t = (performance.now() - start) / 1000;
      const breathe = 1 + Math.sin(t * 1.2) * 0.004;
      // image pixel that should land on the screen centre
      const ix = IMG.cx + r.tx * IMG.pxPerM;
      const iy = IMG.floorY - r.ty * IMG.pxPerM;
      const x = W / 2 - ix * k;
      const y = H / 2 - iy * k;
      const turnDeg = (r.turn + Math.sin(t * 0.6) * 0.04) * 22;
      img.style.transform =
        `translate3d(${x}px, ${y}px, 0) scale(${k * breathe}) ` +
        // turn around the figure's own vertical axis, not the image edge
        `translateX(${IMG.cx}px) rotateY(${turnDeg}deg) translateX(${-IMG.cx}px)`;
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [rig]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ perspective: "1600px" }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={SRC}
        width={IMG.w}
        height={IMG.h}
        alt=""
        draggable={false}
        className="absolute left-0 top-0 max-w-none select-none"
        style={{
          transformOrigin: "0 0",
          willChange: "transform",
          filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.12))",
        }}
      />
    </div>
  );
}
