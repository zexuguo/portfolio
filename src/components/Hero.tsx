import Image from "next/image";
import Build from "./Build";
import CopyEmail from "./CopyEmail";
import { PRESENTACION, CV_URL } from "@/data/contenido";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-300";

/** Bloque 1: quién soy y qué hago, legible en 3 segundos. */
export default function Hero() {
  return (
    <section id="presentacion" className="scroll-mt-20 px-6 pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="mx-auto grid w-full max-w-[1080px] items-center gap-10 md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_380px]">
        <div>
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">{PRESENTACION.rol}</p>
          <h1 className="text-5xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 lg:text-6xl">Zexu Guo</h1>
          <p className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-neutral-700 dark:text-neutral-300">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
            Disponible · prácticas / junior remoto
          </p>
          <Build className="mt-5">
            <p className="max-w-xl text-xl leading-snug text-neutral-800 dark:text-neutral-100">{PRESENTACION.frase}</p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600 dark:text-neutral-300">{PRESENTACION.texto}</p>
          </Build>
          <Build className="mt-7">
            <div className="flex flex-wrap gap-3">
              <a href="#proyectos" className={`rounded-full bg-neutral-900 px-5 py-3 min-h-11 inline-flex items-center justify-center text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-neutral-50 dark:text-neutral-900 ${focus}`}>
                Ver proyectos
              </a>
              <CopyEmail
                className={`cursor-pointer rounded-full border border-neutral-300 px-5 py-3 min-h-11 inline-flex items-center justify-center text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900 ${focus}`}
              />
              {CV_URL && (
                <a href={CV_URL} className={`rounded-full border border-neutral-300 px-5 py-3 min-h-11 inline-flex items-center justify-center text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900 ${focus}`}>
                  Descargar CV
                </a>
              )}
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-neutral-600 dark:text-neutral-400">
              {PRESENTACION.datos.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </Build>
        </div>
        <div className="order-first mx-auto w-28 sm:w-36 md:order-none md:w-full">
          <Image
            src="/figura/avatar.webp"
            alt="Retrato de Zexu Guo, ilustración 3D de estilo low-poly"
            width={512}
            height={512}
            priority
            unoptimized
            className="aspect-square w-full rounded-full border border-neutral-200 bg-white object-cover dark:border-neutral-700"
          />
        </div>
      </div>
    </section>
  );
}
