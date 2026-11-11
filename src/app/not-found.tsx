import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 text-center dark:bg-neutral-950">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">Error 404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">Esta página no existe</h1>
      <p className="mt-3 max-w-md text-base text-neutral-600 dark:text-neutral-300">
        Puede que el enlace esté mal escrito o que la página se haya movido. Todo el portfolio está en la portada.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-neutral-50 dark:text-neutral-900 dark:focus-visible:outline-indigo-300"
      >
        Volver a la portada
      </Link>
    </main>
  );
}
