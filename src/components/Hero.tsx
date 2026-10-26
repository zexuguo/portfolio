/** Presentación: lo primero que se ve, antes de los temas. */
export default function Hero({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 mb-5">
        Desarrollador junior · Barcelona
      </p>
      <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        Zexu Guo
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-neutral-600 dark:text-neutral-300 max-w-md">
        Construyo aplicaciones web y herramientas para pequeños negocios. Estudio DAM y el cursus de
        42&nbsp;Barcelona, y busco prácticas o un primer puesto junior en remoto.
      </p>
    </div>
  );
}
