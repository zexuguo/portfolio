import Build from "./Build";
import CopyEmail from "./CopyEmail";
import { CV_URL, EMAIL, GITHUB, LINKEDIN } from "@/data/contenido";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-300";
const btn = `rounded-full border border-neutral-300 px-5 py-3 min-h-11 inline-flex items-center justify-center text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900 ${focus}`;

export default function Contacto() {
  return (
    <footer id="contacto" className="scroll-mt-20 px-6 pb-28 pt-20 md:pb-16">
      <div className="mx-auto w-full max-w-[1080px] border-t border-neutral-200 pt-12 dark:border-neutral-800">
        <Build kind="text">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">05 — Contacto</p>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-4xl">Hablemos</h2>
        </Build>
        <Build className="mt-4">
          <p className="max-w-prose text-neutral-600 dark:text-neutral-300">
            Busco prácticas o un primer puesto junior en remoto (web, backend o sistemas). Si tienes un proyecto donde pueda aprender rápido y aportar desde el primer día, escríbeme.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`mailto:${EMAIL}`} className={`rounded-full bg-neutral-900 px-5 py-3 min-h-11 inline-flex items-center justify-center text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-neutral-50 dark:text-neutral-900 ${focus}`}>
              {EMAIL}
            </a>
            <CopyEmail className={`cursor-pointer ${btn}`} />
            <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className={btn}>LinkedIn</a>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className={btn}>GitHub</a>
            {CV_URL && <a href={CV_URL} className={btn}>Descargar CV</a>}
          </div>
        </Build>
        <Build kind="text" className="mt-12">
          <p className="font-mono text-xs text-neutral-600 dark:text-neutral-400">© {new Date().getFullYear()} Zexu Guo</p>
        </Build>
      </div>
    </footer>
  );
}
