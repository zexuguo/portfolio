import Build from "./Build";
import CopyEmail from "./CopyEmail";

/** Presentación: lo primero que se ve, antes de los temas. */
export default function Hero({ className = "", play }: { className?: string; play?: boolean }) {
  return (
    <div className={className}>
      <Build kind="text" play={play}>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 mb-5">
          Desarrollador junior · Barcelona
        </p>
        <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          Zexu Guo
        </h1>
      </Build>
      <Build delay={0.12} play={play} className="mt-5">
        <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-300 max-w-md">
          Construyo aplicaciones web y herramientas para pequeños negocios. Estudio DAM y el cursus de
          42&nbsp;Barcelona, y busco prácticas o un primer puesto junior en remoto.
        </p>
      </Build>
      <Build delay={0.2} play={play} className="mt-7">
        <p className="mb-4 inline-flex items-center gap-2 font-mono text-xs text-neutral-700 dark:text-neutral-300">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
          Disponible · prácticas / junior remoto
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="#proyectos"
            className="px-5 py-2.5 rounded-full bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-300"
          >
            Ver proyectos
          </a>
          <CopyEmail
            email="zexuguo34@gmail.com"
            className="px-5 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-300"
          />
        </div>
      </Build>
    </div>
  );
}
