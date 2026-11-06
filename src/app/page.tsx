import Hero from "@/components/Hero";
import Tecnico from "@/components/Tecnico";
import Proyectos from "@/components/Proyectos";
import SobreMi from "@/components/SobreMi";
import Contacto from "@/components/Contacto";
import IndiceTopicos from "@/components/IndiceTopicos";
import SwarmCursors from "@/components/SwarmCursors";
import ParadasScroll from "@/components/ParadasScroll";
import { CV_URL } from "@/data/contenido";

const link = "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-neutral-50 dark:bg-neutral-950">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-neutral-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Saltar al contenido
      </a>
      <SwarmCursors />
      <ParadasScroll />
      <IndiceTopicos />
      <header className="fixed left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-neutral-200/60 bg-neutral-50/70 px-6 py-4 backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-950/70 md:px-10">
        <a href="#presentacion" className="font-mono text-sm tracking-tight text-neutral-800 dark:text-neutral-200">Zexu Guo</a>
        <nav aria-label="Principal" className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.08em] sm:gap-6 sm:text-xs sm:tracking-[0.15em]">
          <a href="#proyectos" className={link}>Proyectos</a>
          {CV_URL && <a href={CV_URL} className={link}>CV</a>}
          <a href="#contacto" className={link}>Contacto</a>
        </nav>
      </header>
      <main id="contenido" className="flex-1">
        <Hero />
        <Tecnico />
        <Proyectos />
        <SobreMi />
      </main>
      <Contacto />
    </div>
  );
}
