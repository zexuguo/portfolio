import ScrollStory from "@/components/ScrollStory";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-neutral-50 dark:bg-neutral-950">
      <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-10 py-4 backdrop-blur-md bg-neutral-50/70 dark:bg-neutral-950/70 border-b border-neutral-200/60 dark:border-neutral-800/60">
        <span className="font-mono text-sm tracking-tight text-neutral-700 dark:text-neutral-300">
          Zexu Guo
        </span>
        <a
          href="#historia"
          className="font-mono text-xs tracking-wide uppercase text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          Scroll ↓
        </a>
      </header>

      <main className="flex-1">
        <section className="h-screen flex flex-col items-center justify-center px-6 text-center">
          <p className="font-mono text-sm uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">
            Portfolio interactivo
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 max-w-3xl">
            Una historia contada haciendo scroll
          </h1>
          <p className="mt-6 max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
            Cada parte de la silueta esconde una sección. Sigue bajando.
          </p>
        </section>

        <ScrollStory />

        <footer className="py-16 px-6 text-center border-t border-neutral-200 dark:border-neutral-800">
          <p className="font-mono text-xs text-neutral-500 dark:text-neutral-500">
            © {new Date().getFullYear()} Zexu Guo
          </p>
        </footer>
      </main>
    </div>
  );
}
