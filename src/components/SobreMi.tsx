import Build from "./Build";
import ScrollStory from "./ScrollStory";
import { SOBRE_MI } from "@/data/contenido";

export default function SobreMi() {
  return (
    <section id="sobre-mi" className="scroll-mt-20 py-20">
      <div className="mx-auto w-full max-w-[1080px] px-6">
        <Build kind="text">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">04 — Sobre mí</p>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-4xl">Quién hay detrás</h2>
        </Build>
        <Build className="mt-4">
          <p className="max-w-prose text-neutral-600 dark:text-neutral-300">
            Un recorrido corto por mí, parte a parte. Desliza para que la cámara pase de una a otra.
          </p>
        </Build>
      </div>

      <ScrollStory />

      <div className="mx-auto mt-16 grid w-full max-w-[1080px] gap-6 px-6 md:grid-cols-2">
        <Build className="h-full">
          <div className="h-full">
            <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">Lo que me gusta</h3>
            <ul className="space-y-3">
              {SOBRE_MI.intereses.map((i) => (
                <li key={i.titulo}>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">{i.titulo}</p>
                  <p className="text-[15px] text-neutral-600 dark:text-neutral-300">{i.texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </Build>
        <Build className="h-full">
          <div className="h-full rounded-2xl border border-neutral-200 bg-neutral-100 p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">Ahora estoy…</h3>
            <ul className="list-disc space-y-2 pl-5 text-[15px] leading-6 text-neutral-700 marker:text-indigo-600 dark:text-neutral-300 dark:marker:text-indigo-300">
              {SOBRE_MI.ahora.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">Actualizado en {SOBRE_MI.actualizado}</p>
          </div>
        </Build>
      </div>
    </section>
  );
}
