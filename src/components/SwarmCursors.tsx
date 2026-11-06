"use client";

import { useEffect, useRef } from "react";
import { CURSORES, swarmBridge, type BuildRequest } from "@/lib/swarm";

/**
 * Enjambre de cursores (código propio; idea inspirada en «Swarm» de Joel Califa,
 * https://califa.github.io/swarm-site/, sin copiar código suyo ni de ningún derivado).
 *
 * Los 7 cursores orbitan alrededor del puntero (o de un punto fijo si no hay ratón).
 * Cuando un bloque pide construirse (Build), 2–3 se desprenden, dibujan su recuadro
 * con la medida y hacen clic; el bloque se revela y vuelven a orbitar.
 * Capa fija, sin eventos, aria-hidden. Táctil: solo se ven mientras construyen.
 * prefers-reduced-motion: 5 cursores estáticos y ninguna construcción.
 */
const SIZE = 18;
const SPRING = [0.08, 0.1, 0.12, 0.09, 0.14, 0.11, 0.13];
const FLY = 170, DRAG = 260, CLICK = 70; // ms → una construcción ≈ 0,5 s
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface Cur {
  x: number; y: number; vx: number; vy: number;
  born: number; ang: number; rad: number; speed: number; alpha: number;
  task: Task | null; scale: number; fx: number; fy: number; // fx,fy: posición al empezar la tarea
}
interface Task {
  req: BuildRequest; t0: number; started: boolean; cs: number[]; startAt: number;
}

function arrow(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, tilt: number, alpha: number, scale: number) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(scale, scale); ctx.globalAlpha = alpha;
  ctx.shadowColor = "rgba(0,0,0,.25)"; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2;
  const s = SIZE / 18;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(0, 15 * s); ctx.lineTo(4 * s, 11.5 * s); ctx.lineTo(7 * s, 17 * s);
  ctx.lineTo(9.5 * s, 15.8 * s); ctx.lineTo(6.6 * s, 10.4 * s); ctx.lineTo(11.5 * s, 10.4 * s); ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
  ctx.shadowColor = "transparent"; ctx.lineWidth = 1.5; ctx.strokeStyle = "#fff"; ctx.lineJoin = "round"; ctx.stroke();
  ctx.restore();
}

function pill(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, alpha: number, vw: number, mono = false) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = mono ? "10px ui-monospace, monospace" : "500 11px system-ui, sans-serif";
  const w = ctx.measureText(text).width + 10, h = 15;
  const px = clamp(x, 4, vw - w - 4);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect(px, y, w, h, 4); ctx.fill();
  ctx.fillStyle = "#111"; ctx.textBaseline = "middle"; ctx.fillText(text, px + 5, y + h / 2 + 0.5);
  ctx.restore();
}

export default function SwarmCursors() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let vw = 0, vh = 0, raf = 0, running = false, last = 0, lastActivity = 0;

    const resize = () => {
      vw = window.innerWidth; vh = window.innerHeight;
      canvas.width = vw * dpr; canvas.height = vh * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) {
        const pts = [[24, 90], [vw - 40, 110], [30, vh - 60], [vw - 50, vh - 40], [vw / 2, vh - 30]];
        ctx.clearRect(0, 0, vw, vh);
        pts.forEach(([x, y], i) => arrow(ctx, x, y, CURSORES[i].color, 0, 0.6, 1));
      }
    };

    if (reduced) {
      // sin construcción: los bloques se muestran completos (Build no anima)
      resize();
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }

    const mouse = { x: -1, y: -1, over: false, has: false };
    const cs: Cur[] = CURSORES.map((_, i) => ({
      x: 0, y: 0, vx: 0, vy: 0, born: 0,
      ang: (i / CURSORES.length) * Math.PI * 2, rad: 40 + ((i * 37) % 100),
      speed: (i % 2 ? 1 : -1) * (0.0006 + i * 0.00009), alpha: 0, task: null, scale: 1, fx: 0, fy: 0,
    }));
    const queue: Task[] = [];
    const active: Task[] = [];

    resize();
    const t00 = performance.now();
    cs.forEach((c, i) => {
      const side = i % 4;
      c.x = side === 0 ? -30 : side === 1 ? vw + 30 : Math.random() * vw;
      c.y = side === 2 ? -30 : side === 3 ? vh + 30 : Math.random() * vh;
      c.born = t00;
    });

    const finish = (t: Task) => {
      t.req.onProgress(1); t.req.onDone();
      t.cs.forEach((i) => { cs[i].task = null; cs[i].scale = 1; });
      const k = active.indexOf(t); if (k >= 0) active.splice(k, 1);
    };

    const start = () => {
      lastActivity = performance.now();
      if (running) return;
      running = true; last = performance.now(); raf = requestAnimationFrame(frame);
    };

    const request = (req: BuildRequest) => {
      queue.push({ req, t0: performance.now() + req.delay * 1000, started: false, cs: [], startAt: 0 });
      start();
    };
    swarmBridge.request = request;
    swarmBridge.waiting.splice(0).forEach(request);

    const begin = (t: Task, now: number) => {
      const r = t.req.el.getBoundingClientRect();
      if (!r.width || !r.height || r.bottom < 0 || r.top > vh) return finish(t); // oculto o fuera de pantalla
      const need = t.req.kind === "text" ? 1 : r.width * r.height > 150000 ? 3 : 2;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const free = cs.map((c, i) => ({ c, i })).filter(({ c }) => !c.task && now >= c.born)
        .sort((a, b) => Math.hypot(a.c.x - cx, a.c.y - cy) - Math.hypot(b.c.x - cx, b.c.y - cy));
      if (free.length < need) return finish(t); // sin cursores libres: se muestra al instante
      t.cs = free.slice(0, need).map((f) => f.i);
      t.startAt = now; t.started = true;
      t.cs.forEach((i) => { const c = cs[i]; c.task = t; c.fx = c.x; c.fy = c.y; c.vx = c.vy = 0; });
      active.push(t);
    };

    const pos = (x: number, y: number) => [clamp(x, 8, vw - 24), clamp(y, 56, vh - 22)] as const;

    // devuelve true si la tarea ha terminado
    const stepTask = (t: Task, now: number) => {
      const r = t.req.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return true; // se fue de pantalla (scroll rápido)
      const el = now - t.startAt, text = t.req.kind === "text";
      const L = r.left, T = r.top, W = r.width, H = r.height;
      const dur = text ? clamp(90 + W * 0.35, 150, 300) : DRAG;
      const total = FLY + dur + (text ? 40 : CLICK);
      const k = clamp((el - FLY) / dur, 0, 1), e = ease(k);
      t.cs.forEach((ci, n) => {
        const c = cs[ci];
        let tx: number, ty: number; // destino «ideal» en esta fase
        if (text) { tx = L + (el < FLY ? 0 : W * e); ty = T + H * 0.72; }
        else if (n === 0) { tx = L + (el < FLY ? 0 : W * e); ty = T + (el < FLY ? 0 : H * e); }
        else if (n === 1) { tx = L + W - (el < FLY ? 0 : W * e); ty = T + (el < FLY ? 0 : H * e); }
        else { tx = L + (el < FLY ? W / 2 : W * e * 0.5 + W * 0.25 * (1 - e)); ty = T + (el < FLY ? 0 : H * e * 0.6); }
        const [px, py] = pos(tx, ty);
        if (el < FLY) { const f = ease(el / FLY); c.x = c.fx + (px - c.fx) * f; c.y = c.fy + (py - c.fy) * f; }
        else { c.x = px; c.y = py; }
        c.alpha += (0.95 - c.alpha) * 0.4;
        c.scale = !text && el > FLY + dur ? 0.8 + 0.2 * Math.abs((el - FLY - dur) / CLICK - 0.5) * 2 : 1; // clic
      });
      t.req.onProgress(el < FLY ? 0 : e);
      return el >= total;
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, vw, vh);
      // recuadros en construcción (debajo de los cursores)
      active.forEach((t) => {
        if (t.req.kind === "text") return;
        const r = t.req.el.getBoundingClientRect();
        const el = now - t.startAt, k = clamp((el - FLY) / DRAG, 0, 1), e = ease(k);
        if (el < FLY) return;
        const fade = el > FLY + DRAG ? 1 - clamp((el - FLY - DRAG) / CLICK, 0, 1) : 1;
        const color = CURSORES[t.cs[0]].color, w = r.width * e, h = r.height * e;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.beginPath(); ctx.roundRect(r.left, r.top, w, h, 12);
        ctx.fillStyle = color + "1f"; ctx.fill();
        ctx.lineWidth = 1.5; ctx.strokeStyle = color; ctx.stroke();
        ctx.restore();
        pill(ctx, `${Math.round(w)} × ${Math.round(h)}`, r.left + w - 60, clamp(r.top + h + 6, 56, vh - 20), color, fade, vw, true);
      });
      cs.forEach((c, i) => {
        if (now < c.born) return;
        const tilt = c.task ? 0 : (Math.sin(now * 0.002 + i) * 6 * Math.PI) / 180;
        arrow(ctx, c.x, c.y, CURSORES[i].color, tilt, c.alpha, c.scale);
        if (c.task) { // nombre: a la derecha, o a la izquierda si no cabe
          const w = ctx.measureText(CURSORES[i].name).width + 10;
          pill(ctx, CURSORES[i].name, c.x + 14 + w + 4 > vw ? c.x - w - 4 : c.x + 14, c.y + 16, CURSORES[i].color, c.alpha, vw);
        }
      });
    };

    function frame(now: number) {
      const dt = Math.min((now - last) / 16.67, 3) || 1;
      last = now;
      // arrancar tareas pendientes
      for (let i = queue.length - 1; i >= 0; i--) if (now >= queue[i].t0) { const [t] = queue.splice(i, 1); begin(t, now); }
      [...active].forEach((t) => { if (stepTask(t, now)) finish(t); });
      const anchorX = mouse.has ? mouse.x : vw * 0.5, anchorY = mouse.has ? mouse.y : vh * 0.9;
      let moving = false;
      cs.forEach((c, i) => {
        if (now < c.born) return;
        if (c.task) { moving = true; return; }
        c.ang += c.speed * 16.67 * dt;
        const r = mouse.over ? Math.max(c.rad, 120) : c.rad;
        const k = SPRING[i] * dt;
        c.vx = (c.vx + (anchorX + Math.cos(c.ang) * r - c.x) * k) * 0.82;
        c.vy = (c.vy + (anchorY + Math.sin(c.ang) * r - c.y) * k) * 0.82;
        c.x += c.vx * dt; c.y += c.vy * dt;
        const target = touch ? 0 : mouse.over ? 0.35 : 0.85; // táctil: ocultos fuera de las construcciones
        c.alpha += (target - c.alpha) * 0.12;
        if (Math.abs(c.vx) + Math.abs(c.vy) > 0.05 || Math.abs(c.alpha - target) > 0.01) moving = true;
      });
      draw(now);
      const idle = now - lastActivity > 2500 && !moving && !queue.length && !active.length;
      if (document.hidden || idle) { running = false; return; }
      raf = requestAnimationFrame(frame);
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.has = true;
      mouse.over = !!(e.target instanceof Element && e.target.closest("[data-no-swarm], a, button"));
      start();
    };
    const onActivity = () => start();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onActivity, { passive: true });
    document.addEventListener("visibilitychange", onActivity);
    start();
    return () => {
      cancelAnimationFrame(raf);
      swarmBridge.request = null;
      queue.concat(active).forEach((t) => { t.req.onProgress(1); t.req.onDone(); }); // nunca dejar contenido oculto
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onActivity);
      document.removeEventListener("visibilitychange", onActivity);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="fixed inset-0 z-30 h-full w-full pointer-events-none" />;
}
