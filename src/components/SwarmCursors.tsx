"use client";

import { useEffect, useRef } from "react";
import { CURSORES, swarmBridge, type Bloque } from "@/lib/swarm";

/**
 * Cursores constructores (código propio; idea inspirada en «Swarm» de Joel Califa,
 * https://califa.github.io/swarm-site/, sin copiar código suyo ni de ningún derivado).
 *
 * Reglas de sincronía:
 *  - Solo hay cursores mientras construyen; máximo 2 a la vez; cola = bloques pendientes visibles, de arriba abajo.
 *  - Un bloque solo se muestra dentro del recuadro que arrastra su cursor (nunca aparece solo).
 *  - La posición se recalcula en cada fotograma con getBoundingClientRect: el cursor sigue al elemento real.
 *  - Se CANCELA (cursor y recuadro desaparecen; el bloque vuelve a invisible) si el bloque sale de pantalla,
 *    se redimensiona la ventana, cambia el tema claro/oscuro o el scroll es rápido. Se reintenta al calmarse.
 *  - Con prefers-reduced-motion no se monta nada (Build lo muestra todo).
 */
const SIZE = 24;
const FLY = 220, CLICK = 90, EXIT = 200, MAX = 2;
const VEL_MAX = 2500, VEL_CALMA = 1100; // px/s
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface Task {
  b: Bloque; startAt: number; slot: number; fx: number; fy: number;
  x: number; y: number; alpha: number; scale: number; done: boolean; side: number; doneAt: number; ex: number;
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
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    const ctx: CanvasRenderingContext2D = g;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let vw = 0, vh = 0, raf = 0, running = false, counter = 0;
    let lastY = window.scrollY, lastT = performance.now(), vel = 0, lastEvento = 0, bloqueoHasta = 0;
    const active: Task[] = [];

    const resize = () => {
      vw = window.innerWidth; vh = window.innerHeight;
      canvas.width = vw * dpr; canvas.height = vh * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const visible = (b: Bloque) => {
      const r = b.el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 64 && r.top < vh - 24;
    };
    const cancelarTodo = (hasta = 0) => {
      for (let i = active.length - 1; i >= 0; i--) if (!active[i].done) { active[i].b.cancelar(); active.splice(i, 1); }
      if (hasta) bloqueoHasta = Math.max(bloqueoHasta, performance.now() + hasta);
    };
    const pos = (x: number, y: number) => [clamp(x, 10, vw - 28), clamp(y, 64, vh - 24)] as const;

    const begin = (b: Bloque, now: number) => {
      const r = b.el.getBoundingClientRect();
      const left = counter++ % 2 === 0;
      const t: Task = {
        b, startAt: now, slot: (counter * 3) % CURSORES.length, side: left ? -30 : vw + 30,
        fx: left ? -30 : vw + 30, fy: clamp(r.top + r.height / 2, 64, vh - 24),
        x: 0, y: 0, alpha: 0, scale: 1, done: false, doneAt: 0, ex: 0,
      };
      t.x = t.fx; t.y = t.fy;
      b.estado = "construyendo";
      b.progreso(0);
      active.push(t);
    };

    const dur = (b: Bloque, w: number) => (b.kind === "text" ? clamp(200 + w * 0.3, 250, 500) : 380);

    // true cuando el cursor ya ha salido
    const step = (t: Task, now: number) => {
      const el = now - t.startAt;
      if (!t.done) {
        const r = t.b.el.getBoundingClientRect();
        if (!t.b.activo() || r.width <= 0 || r.bottom < 56 || r.top > vh) { t.b.cancelar(); return "cancelada" as const; } // salió de pantalla o ya no toca
        const text = t.b.kind === "text", d = dur(t.b, r.width), click = text ? 0 : CLICK;
        const tDrag = FLY + d, tClick = tDrag + click;
        const e = ease(clamp((el - FLY) / d, 0, 1));
        const tx = r.left + (el < FLY ? 0 : r.width * e);
        const ty = text ? r.top + r.height * 0.72 : r.top + (el < FLY ? 0 : r.height * e);
        const [px, py] = pos(tx, ty);
        if (el < FLY) { const f = ease(el / FLY); t.x = t.fx + (px - t.fx) * f; t.y = t.fy + (py - t.fy) * f; t.alpha = Math.min(1, el / 100); }
        else { t.x = px; t.y = py; t.alpha = 1; }
        t.scale = !text && el > tDrag ? 0.8 + 0.2 * Math.abs((el - tDrag) / click - 0.5) * 2 : 1;
        if (el >= FLY) t.b.progreso(e);
        if (el >= tClick) { t.b.listo(); t.done = true; t.doneAt = now; t.ex = t.x; } // el elemento ya está construido
        return "sigue" as const;
      }
      // salida: el cursor se aleja por su borde; el bloque ya es visible y no depende de nada
      const f = ease(clamp((now - t.doneAt) / EXIT, 0, 1));
      t.alpha = 1 - f; t.x = t.ex + (t.side - t.ex) * f * 0.5;
      return f >= 1 ? ("fuera" as const) : ("sigue" as const);
    };

    const draw = () => {
      ctx.clearRect(0, 0, vw, vh);
      for (const t of active) {
        const c = CURSORES[t.slot];
        if (!t.done && t.b.kind !== "text") {
          const r = t.b.el.getBoundingClientRect();
          const e = ease(clamp((performance.now() - t.startAt - FLY) / dur(t.b, r.width), 0, 1));
          if (performance.now() - t.startAt >= FLY) {
            const w = r.width * e, h = r.height * e;
            ctx.save();
            ctx.beginPath(); ctx.roundRect(r.left, r.top, w, h, 12);
            ctx.strokeStyle = c.color; ctx.lineWidth = 2; ctx.stroke();
            ctx.restore();
            pill(ctx, `${Math.round(w)} × ${Math.round(h)}`, r.left + w - 60, clamp(r.top + h + 6, 64, vh - 20), c.color, 1, vw, true);
          }
        }
        arrow(ctx, t.x, t.y, c.color, t.alpha, t.scale);
        ctx.font = "500 11px system-ui, sans-serif";
        const w = ctx.measureText(c.name).width + 10;
        pill(ctx, c.name, t.x + 18 + w + 4 > vw ? t.x - w - 4 : t.x + 18, t.y + 20, c.color, t.alpha, vw);
      }
    };

    function frame(now: number) {
      const dt = Math.max(now - lastT, 1);
      const inst = (Math.abs(window.scrollY - lastY) / dt) * 1000;
      vel = vel * 0.5 + inst * 0.5; lastY = window.scrollY; lastT = now;
      if (inst > 0) lastEvento = now;

      if (vel > VEL_MAX) cancelarTodo(); // scroll rápido: los bloques se quedan invisibles
      for (let i = active.length - 1; i >= 0; i--) {
        const r = step(active[i], now);
        if (r !== "sigue") active.splice(i, 1);
      }
      // arrancar bloques pendientes y visibles, de arriba abajo, solo con el scroll calmado
      let pendientes = 0;
      if (vel < VEL_CALMA && now >= bloqueoHasta) {
        const cand = [...swarmBridge.blocks]
          .filter((b) => b.estado === "pendiente" && b.activo() && visible(b))
          .sort((a, b) => a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top);
        pendientes = cand.length;
        while (active.length < MAX && cand.length) begin(cand.shift()!, now);
      } else pendientes = 1; // en espera de calma
      draw();
      const sigue = active.length > 0 || pendientes > 0 || now - lastEvento < 300 || now < bloqueoHasta;
      if (!sigue) { running = false; ctx.clearRect(0, 0, vw, vh); return; }
      raf = requestAnimationFrame(frame);
    }
    const despertar = () => { if (!running) { running = true; lastT = performance.now(); raf = requestAnimationFrame(frame); } };

    const onResize = () => { resize(); cancelarTodo(250); despertar(); };
    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    const onTema = () => { cancelarTodo(250); despertar(); };

    swarmBridge.despertar = despertar;
    swarmBridge.ocupados = () => active.length;
    swarmBridge.listo = true;
    (window as unknown as { __cursores: () => { activos: number } }).__cursores = () => ({ activos: active.length });
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", despertar, { passive: true });
    dark.addEventListener("change", onTema);
    document.addEventListener("visibilitychange", despertar);
    despertar();
    return () => {
      cancelAnimationFrame(raf);
      cancelarTodo();
      swarmBridge.listo = false; swarmBridge.despertar = () => {}; swarmBridge.ocupados = () => 0;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", despertar);
      dark.removeEventListener("change", onTema);
      document.removeEventListener("visibilitychange", despertar);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="fixed inset-0 z-30 h-full w-full pointer-events-none" />;
}
