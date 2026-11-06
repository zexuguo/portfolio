"use client";

import { useEffect, useRef } from "react";

/**
 * Enjambre de cursores: efecto propio (código escrito desde cero).
 * Inspirado en la idea de «Swarm» de Joel Califa (https://califa.github.io/swarm-site/);
 * no se ha copiado código de ese proyecto ni de ningún derivado.
 *
 * - Capa fija, sin eventos de ratón, oculta a lectores de pantalla.
 * - No aparece nada hasta que el ratón se mueve (el hero queda limpio).
 * - Sin enjambre en táctil; con reduced-motion, cursores estáticos en las esquinas.
 */
const COLORS = ["#FF6B6B", "#FFB020", "#34C759", "#2EC4B6", "#4F8CFF", "#8B5CF6", "#FF5FA2"];
const SIZE = 18;
const SPRING = [0.08, 0.1, 0.12, 0.09, 0.14, 0.11, 0.13]; // rigidez por cursor (por frame a 60 fps)

interface Cursor {
  x: number; y: number; vx: number; vy: number;
  born: number; // instante de entrada (ms), 0 = aún no
  delay: number; // desfase de aparición
  ang: number; // posición angular en la órbita
  rad: number; // radio de bandada 40-140 px
  speed: number;
  alpha: number;
}

function drawArrow(ctx: CanvasRenderingContext2D, c: Cursor, color: string, tilt: number, alpha: number) {
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(tilt);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = "rgba(0,0,0,.25)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;
  const s = SIZE / 18;
  ctx.beginPath(); // flecha de puntero estándar, punta en (0,0)
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 15 * s);
  ctx.lineTo(4 * s, 11.5 * s);
  ctx.lineTo(7 * s, 17 * s);
  ctx.lineTo(9.5 * s, 15.8 * s);
  ctx.lineTo(6.6 * s, 10.4 * s);
  ctx.lineTo(11.5 * s, 10.4 * s);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#fff";
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.restore();
}

export default function SwarmCursors() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, raf = 0, running = false, lastMove = 0, last = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) drawStatic();
    };

    function drawStatic() {
      ctx!.clearRect(0, 0, w, h);
      const pts = [[24, 90], [w - 40, 110], [30, h - 60], [w - 50, h - 40], [w / 2, h - 30]];
      pts.forEach(([x, y], i) =>
        drawArrow(ctx!, { x, y } as Cursor, COLORS[i], 0, 0.6),
      );
    }

    if (reduced) {
      resize();
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }

    const mouse = { x: -1, y: -1, over: false, started: false };
    const cursors: Cursor[] = COLORS.map((_, i) => ({
      x: 0, y: 0, vx: 0, vy: 0, born: 0,
      delay: 60 + i * 90,
      ang: (i / COLORS.length) * Math.PI * 2,
      rad: 40 + ((i * 37) % 100),
      speed: (i % 2 ? 1 : -1) * (0.0006 + i * 0.00009),
      alpha: 0.85,
    }));

    const spawn = (c: Cursor, i: number, now: number) => {
      // entran desde los bordes, con desfase
      const side = i % 4;
      c.x = side === 0 ? -30 : side === 1 ? w + 30 : Math.random() * w;
      c.y = side === 2 ? -30 : side === 3 ? h + 30 : Math.random() * h;
      c.born = now + c.delay;
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 3) || 1; // 1 = frame a 60 fps
      last = now;
      ctx.clearRect(0, 0, w, h);
      let moving = false;
      cursors.forEach((c, i) => {
        if (now < c.born) return;
        c.ang += c.speed * 16.67 * dt;
        // sobre texto/enlaces: se alejan (≥120 px) y se atenúan
        const r = mouse.over ? Math.max(c.rad, 120) : c.rad;
        const tx = mouse.x + Math.cos(c.ang) * r;
        const ty = mouse.y + Math.sin(c.ang) * r;
        const k = SPRING[i] * dt;
        c.vx = (c.vx + (tx - c.x) * k) * 0.82;
        c.vy = (c.vy + (ty - c.y) * k) * 0.82;
        c.x += c.vx * dt; c.y += c.vy * dt;
        const target = mouse.over ? 0.35 : 0.85;
        c.alpha += (target - c.alpha) * 0.12;
        const fade = Math.min((now - c.born) / 600, 1); // aparición 600 ms
        const tilt = Math.sin(now * 0.002 + i) * (6 * Math.PI) / 180; // ±6°
        drawArrow(ctx, c, COLORS[i], tilt, c.alpha * fade);
        if (Math.abs(c.vx) + Math.abs(c.vy) > 0.05 || fade < 1) moving = true;
      });
      // a los 2 s sin mover el ratón y ya quietos, se detiene el bucle
      if (document.hidden || (now - lastMove > 2000 && !moving && now - lastMove < 1e9 && cursors.every((c) => now > c.born))) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const now = performance.now();
      lastMove = now;
      mouse.x = e.clientX; mouse.y = e.clientY;
      mouse.over = !!(e.target instanceof Element && e.target.closest("[data-no-swarm], a, button"));
      if (!mouse.started) {
        mouse.started = true;
        cursors.forEach((c, i) => spawn(c, i, now));
      }
      start();
    };
    const onVisibility = () => { if (!document.hidden && mouse.started) start(); };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="fixed inset-0 z-30 h-full w-full pointer-events-none"
    />
  );
}
