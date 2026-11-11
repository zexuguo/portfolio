import Build from "./Build";
import { TECNICO } from "@/data/contenido";

export default function Tecnico() {
  return (
    <section id="tecnico" className="scroll-mt-20 px-6 py-20">
      <div className="mx-auto w-full max-w-[1080px]">
        <Build kind="text">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">02 — Técnico</p>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-4xl">Lo que sé hacer</h2>
        </Build>
        <Build className="mt-4">
          <p className="max-w-prose text-neutral-600 dark:text-neutral-300">{TECNICO.intro}</p>
        </Build>

        <Build className="mt-8">
          <h3 className="sr-only">Tecnologías</h3>
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {TECNICO.stack.map((g) => (
              <div key={g.grupo}>
                <dt className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-400">{g.grupo}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {g.items.map((s) => (
                    <span key={s} className="rounded-full border border-neutral-300 px-2.5 py-1 font-mono text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Build>

        <Build kind="text" className="mb-4 mt-12">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">Formación</h3>
        </Build>
        <ul className="grid gap-4 md:grid-cols-3">
          {TECNICO.formacion.map((f) => (
            <li key={f.titulo}>
              <Build className="h-full">
                <div className="h-full rounded-2xl border border-neutral-200 bg-neutral-100 p-5 dark:border-neutral-800 dark:bg-neutral-900">
                  <h4 className="font-semibold leading-snug text-neutral-900 dark:text-neutral-50">{f.titulo}</h4>
                  <p className="mt-1 font-mono text-xs text-neutral-600 dark:text-neutral-400">{f.lugar}</p>
                  <p className="mt-3 text-base leading-6 text-neutral-600 dark:text-neutral-300">{f.texto}</p>
                </div>
              </Build>
            </li>
          ))}
        </ul>
        <Build className="mt-6">
          <p className="text-base text-neutral-600 dark:text-neutral-300">{TECNICO.hackathons}</p>
        </Build>
      </div>
    </section>
  );
}
