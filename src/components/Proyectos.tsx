import Image from "next/image";
import { PROYECTOS } from "@/data/proyectos";
import Build from "./Build";

export default function Proyectos() {
  return (
    <section id="proyectos" className="px-6 py-24 max-w-[1080px] mx-auto w-full" data-no-swarm>
      <Build kind="text">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400 mb-4">
          03 — Lo que construyo
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          Proyectos
        </h2>
      </Build>
      <Build delay={0.1} className="mt-4 mb-10">
        <p className="max-w-prose text-neutral-600 dark:text-neutral-300">
          Una muestra de lo que he construido. Las imágenes son esquemas y fotogramas propios: no
          enseño datos reales de clientes, claves ni saldos.
        </p>
      </Build>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PROYECTOS.map((p, i) => (
          <li key={p.nombre}>
          <Build delay={(i % 2) * 0.1} className="h-full">
          <div
            className="group h-full flex flex-col overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 transition-[border-color,transform] duration-150 motion-safe:hover:-translate-y-0.5 hover:border-indigo-600 dark:hover:border-indigo-300 focus-within:border-indigo-600 dark:focus-within:border-indigo-300"
          >
            <Image
              src={p.imagen}
              alt={p.alt}
              width={960}
              height={600}
              unoptimized
              className="w-full aspect-[16/10] object-cover border-b border-neutral-200 dark:border-neutral-800"
            />
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-xl leading-7 font-semibold text-neutral-900 dark:text-neutral-50 line-clamp-2">
                {p.nombre}
              </h3>
              <p className="mt-2 text-[15px] leading-6 text-neutral-600 dark:text-neutral-400">
                {p.descripcion}
              </p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {p.stack.map((s) => (
                  <li
                    key={s}
                    className="font-mono text-xs px-2.5 py-1 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                  >
                    {s}
                  </li>
                ))}
              </ul>
              {p.href && (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-300 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-300"
                >
                  Ver proyecto ↗
                </a>
              )}
            </div>
          </div>
          </Build>
          </li>
        ))}
      </ul>
    </section>
  );
}
