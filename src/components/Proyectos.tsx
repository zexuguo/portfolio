import Build from "./Build";
import Carrusel from "./Carrusel";
import { TAMBIEN } from "@/data/proyectos";

export default function Proyectos() {
  return (
    <section id="proyectos" className="scroll-mt-20 px-6 py-20">
      <div className="mx-auto w-full max-w-[1080px]">
        <Build kind="text">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">03 — Lo que construyo</p>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-4xl">Proyectos</h2>
        </Build>
        <Build className="mt-4">
          <p className="max-w-prose text-neutral-600 dark:text-neutral-300">
            Cinco proyectos con su caso de estudio. Las imágenes son una captura pública, fotogramas propios y esquemas: no enseño datos reales de clientes, claves ni saldos.
          </p>
        </Build>
        <Build className="mt-8">
          <Carrusel />
        </Build>
        <Build className="mt-10">
          <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">También</h3>
          <ul className="space-y-2 text-[15px] leading-6 text-neutral-700 dark:text-neutral-300">
            {TAMBIEN.map((t) => (
              <li key={t} className="border-l-2 border-neutral-300 pl-3 dark:border-neutral-700">{t}</li>
            ))}
          </ul>
        </Build>
      </div>
    </section>
  );
}
