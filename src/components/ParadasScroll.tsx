"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

/**
 * Paradas de scroll «de cercanía» (código propio, sin dependencias nuevas).
 * Cuando la persona deja de hacer scroll CERCA del inicio de un bloque, la página se
 * alinea suavemente con él. No atrapa: lejos de un punto no hace nada, así que los
 * bloques altos y el final de la página se recorren enteros, y un gesto fuerte pasa de largo.
 * No actúa: con prefers-reduced-motion, con teclado/Tab (se respeta el scroll nativo),
 * mientras hay un dedo o botón del ratón pulsado, ni dentro del recorrido de la figura
 * (allí ya paran las paradas propias de ScrollTrigger, una por cada parte del cuerpo).
 */
const BLOQUES = ["tecnico", "proyectos", "sobre-mi", "contacto"]; // la presentación es el 0
const OFFSET = 80; // = scroll-mt-20, igual que al pulsar el índice lateral
const ESPERA = 170; // ms sin scroll para considerar que ha soltado

export default function ParadasScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    let timer: ReturnType<typeof setTimeout> | null = null;
    let tocando = false;
    let ultimaTecla = -1e9;
    let ultimoFoco = -1e9;
    const root = document.documentElement;

    const puntos = () => {
      const max = root.scrollHeight - window.innerHeight;
      const ys = [0];
      for (const id of BLOQUES) {
        const el = document.getElementById(id);
        if (el) ys.push(Math.min(Math.max(el.getBoundingClientRect().top + window.scrollY - OFFSET, 0), max));
      }
      return { ys, max };
    };

    const evaluar = () => {
      timer = null;
      const now = performance.now();
      if (tocando || now - ultimaTecla < 1200 || now - ultimoFoco < 600) return;
      const y = window.scrollY;
      const { ys, max } = puntos();
      if (y <= 2 || y >= max - 2) return; // extremos de la página: nunca tirar de vuelta
      const pin = ScrollTrigger.getAll().find((s) => s.pin);
      if (pin && y >= pin.start - 2 && y <= pin.end + 2) return; // dentro de la figura mandan sus paradas
      const umbral = Math.min(window.innerHeight * 0.18, 150);
      let mejor = ys[0];
      for (const p of ys) if (Math.abs(p - y) < Math.abs(mejor - y)) mejor = p;
      const d = Math.abs(mejor - y);
      if (d < 3 || d > umbral) return;
      root.style.scrollBehavior = "auto"; // evita que el scroll suave del CSS se pelee con la animación
      gsap.to(window, {
        scrollTo: { y: mejor, autoKill: true }, duration: 0.45, ease: "power2.out", overwrite: true,
        onComplete: () => { root.style.scrollBehavior = ""; },
        onInterrupt: () => { root.style.scrollBehavior = ""; },
      });
    };

    const onScroll = () => { if (timer) clearTimeout(timer); timer = setTimeout(evaluar, ESPERA); };
    const onTecla = () => { ultimaTecla = performance.now(); };
    const onFoco = () => { ultimoFoco = performance.now(); };
    const down = () => { tocando = true; };
    const up = () => { tocando = false; if (timer) clearTimeout(timer); timer = setTimeout(evaluar, ESPERA); };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onTecla);
    window.addEventListener("focusin", onFoco);
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("pointercancel", up, { passive: true });
    window.addEventListener("touchstart", down, { passive: true });
    window.addEventListener("touchend", up, { passive: true });
    window.addEventListener("touchcancel", up, { passive: true });
    return () => {
      if (timer) clearTimeout(timer);
      root.style.scrollBehavior = "";
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onTecla);
      window.removeEventListener("focusin", onFoco);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("touchstart", down);
      window.removeEventListener("touchend", up);
      window.removeEventListener("touchcancel", up);
    };
  }, []);

  return null;
}
