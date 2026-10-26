import ScrollStory from "@/components/ScrollStory";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-neutral-50 dark:bg-neutral-950">
      <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-10 py-4 backdrop-blur-md bg-neutral-50/70 dark:bg-neutral-950/70 border-b border-neutral-200/60 dark:border-neutral-800/60">
        <a
          href="#historia"
          className="font-mono text-sm tracking-tight text-neutral-800 dark:text-neutral-200"
        >
          Zexu Guo
        </a>
        <nav className="flex items-center gap-6 font-mono text-xs uppercase tracking-[0.15em]">
          <a
            href="/cv-zexu-guo.pdf"
            className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            CV
          </a>
          <a
            href="mailto:zexuguo34@gmail.com"
            className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            Contacto
          </a>
        </nav>
      </header>

      <main className="flex-1">
        <ScrollStory />

        <footer className="py-12 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-6xl mx-auto w-full border-t border-neutral-200 dark:border-neutral-800">
          <p className="font-mono text-xs text-neutral-500">© {new Date().getFullYear()} Zexu Guo</p>
          <a
            href="mailto:zexuguo34@gmail.com"
            className="font-mono text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            zexuguo34@gmail.com
          </a>
        </footer>
      </main>
    </div>
  );
}
