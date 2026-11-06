"use client";

import { useEffect, useRef } from "react";
import { CURSORES, swarmBridge, type BuildRequest } from "@/lib/swarm";

/**
 * Cursores constructores (código propio; idea inspirada en «Swarm» de Joel Califa,
 * https://califa.github.io/swarm-site/, sin copiar código suyo ni de ningún derivado).
 *
 * No hay enjambre permanente: solo aparecen cuando un bloque se construye. Entran por
 * el borde, dibujan el recuadro con su medida (o «escriben» el texto), hacen clic y se
 * van. Máximo 2 a la vez; si hay cola larga, el bloque se muestra directamente.
 * Capa fija, sin eventos, aria-hidden. Con prefers-reduced-motion no hace nada.
 */
const SIZE = 24;
const FLY = 320, EXIT = 280, CLICK = 110, MAX = 2, MAX_ESPERA = 900;
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface Task {
  req: BuildRequest; t0: number; started: boolean; startAt: number;
  slot: number; fx: number; fy: number; x: number; y: number; alpha: number; scale: number; revealed: boolean;
}

function arrow(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, alpha: number, scale: number) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(scale, scale); ctx.globalAlpha = alpha;
  ctx.shadowColor = "rgba(0,0,0,.25)"; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2;
  const s = SIZE / 18;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(0, 15 * s); ctx.lineTo(4 * s, 11.5 * s); ctx.lineTo(7 * s, 17 * s);
  ctx.lineTo(9.5 * s, 15.8 * s); ctx.lineTo(6.6 * s, 10.4 * s); ctx.lineTo(11.5 * s, 10.4 * s); ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
  ctx.shadowColor = "transparent"; ctx.lineJoin = "round";
  ctx.lineWidth = 4; ctx.strokeStyle = "rgba(0,0,0,.45)"; ctx.stroke();
  ctx.lineWidth = 2; ctx.strokeStyle = "#fff"; ctx.stroke();
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // Build muestra todo sin animar
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let vw = 0, vh = 0, raf = 0, running = false, counter = 0;
    const queue: Task[] = [];
    const active: Task[] = [];

    const resize = () => {
      vw = window.innerWidth; vh = window.innerHeight;
      canvas.width = vw * dpr; canvas.height = vh * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const reveal = (t: Task) => { if (!t.revealed) { t.revealed = true; t.req.onProgress(1); t.req.onDone(); } };
    const pos = (x: number, y: number) => [clamp(x, 10, vw - 28), clamp(y, 60, vh - 24)] as const;

    const request = (req: BuildRequest) => {
      queue.push({ req, t0: performance.now() + req.delay * 1000, started: false, startAt: 0, slot: 0, fx: 0, fy: 0, x: 0, y: 0, alpha: 0, scale: 1, revealed: false });
      go();
    };
    swarmBridge.request = request;
    swarmBridge.waiting.splice(0).forEach(request);

    const begin = (t: Task, now: number) => {
      const r = t.req.el.getBoundingClientRect();
      if (!r.width || !r.height || r.bottom < 0 || r.top > vh) { reveal(t); return false; }
      const left = counter++ % 2 === 0;
      t.fx = left ? -30 : vw + 30; t.fy = clamp(r.top + r.height / 2, 60, vh - 24);
      t.x = t.fx; t.y = t.fy; t.startAt = now; t.started = true;
      t.slot = CURSORES.length ? (counter + Math.floor(Math.random() * CURSORES.length)) % CURSORES.length : 0;
      return true;
    };

    // devuelve true cuando el cursor ya se ha ido
    const step = (t: Task, now: number) => {
      const r = t.req.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) { reveal(t); return true; } // scroll rápido: se fue de pantalla
      const el = now - t.startAt, text = t.req.kind === "text";
      const dur = text ? clamp(300 + r.width * 0.4, 350, 650) : 520;
      const click = text ? 0 : CLICK;
      const tDrag = FLY + dur, tClick = tDrag + click, tEnd = tClick + EXIT;
      const k = clamp((el - FLY) / dur, 0, 1), e = ease(k);
      let tx: number, ty: number;
      if (text) { tx = r.left + (el < FLY ? 0 : r.width * e); ty = r.top + r.height * 0.72; }
      else { tx = r.left + (el < FLY ? 0 : r.width * e); ty = r.top + (el < FLY ? 0 : r.height * e); }
      const [px, py] = pos(tx, ty);
      if (el < FLY) { const f = ease(el / FLY); t.x = t.fx + (px - t.fx) * f; t.y = t.fy + (py - t.fy) * f; t.alpha = Math.min(1, el / 120); }
      else if (el <= tClick) { t.x = px; t.y = py; t.alpha = 1; }
      else { // salida hacia el borde más cercano
        const f = ease((el - tClick) / EXIT), side = t.fx < 0 ? -40 : vw + 40;
        t.x = px + (side - px) * f; t.y = py; t.alpha = 1 - f;
      }
      t.scale = !text && el > tDrag && el < tClick ? 0.8 + 0.2 * Math.abs((el - tDrag) / click - 0.5) * 2 : 1;
      t.req.onProgress(el < FLY ? 0 : e);
      if (el >= tClick) reveal(t);
      return el >= tEnd;
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, vw, vh);
      active.forEach((t) => {
        const c = CURSORES[t.slot], el = now - t.startAt;
        const r = t.req.el.getBoundingClientRect();
        if (t.req.kind !== "text" && el >= FLY) {
          const dur = 520, e = ease(clamp((el - FLY) / dur, 0, 1));
          const fade = el > FLY + dur ? 1 - clamp((el - FLY - dur) / CLICK, 0, 1) : 1;
          const w = r.width * e, h = r.height * e;
          ctx.save();
          ctx.globalAlpha = fade;
          ctx.beginPath(); ctx.roundRect(r.left, r.top, w, h, 12);
          ctx.fillStyle = c.color + "26"; ctx.fill();
          ctx.lineWidth = 2; ctx.strokeStyle = c.color; ctx.stroke();
          ctx.restore();
          pill(ctx, `${Math.round(w)} × ${Math.round(h)}`, r.left + w - 60, clamp(r.top + h + 6, 60, vh - 20), c.color, fade, vw, true);
        }
        arrow(ctx, t.x, t.y, c.color, t.alpha, t.scale);
        ctx.font = "500 11px system-ui, sans-serif";
        const w = ctx.measureText(c.name).width + 10;
        pill(ctx, c.name, t.x + 18 + w + 4 > vw ? t.x - w - 4 : t.x + 18, t.y + 20, c.color, t.alpha, vw);
      });
    };

    function frame(now: number) {
      for (let i = 0; i < queue.length; ) {
        const t = queue[i];
        if (now < t.t0) { i++; continue; }
        if (active.length < MAX) { queue.splice(i, 1); if (begin(t, now)) active.push(t); continue; }
        if (now - t.t0 > MAX_ESPERA) { queue.splice(i, 1); reveal(t); continue; } // cola larga: sin animar
        i++;
      }
      for (let i = active.length - 1; i >= 0; i--) if (step(active[i], now)) active.splice(i, 1);
      draw(now);
      if (!queue.length && !active.length) { running = false; ctx!.clearRect(0, 0, vw, vh); return; }
      raf = requestAnimationFrame(frame);
    }
    function go() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      swarmBridge.request = null;
      queue.concat(active).forEach(reveal); // nunca dejar contenido a medias
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="fixed inset-0 z-30 h-full w-full pointer-events-none" />;
}
