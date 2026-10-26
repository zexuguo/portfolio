import type { Section } from "@/data/sections";

export default function SectionContent({
  section,
  className = "",
}: {
  section: Section;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-sm font-medium tracking-wide text-neutral-500 dark:text-neutral-400 uppercase mb-3">
        {section.eyebrow}
      </p>
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-neutral-900 dark:text-neutral-50">
        {section.title}
      </h2>
      <p className="text-base md:text-lg leading-relaxed text-neutral-600 dark:text-neutral-300 max-w-prose">
        {section.body}
      </p>

      {section.projects && (
        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {section.projects.map((p) => (
            <li
              key={p.name}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur p-4"
            >
              {p.href ? (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-neutral-900 dark:text-neutral-50 hover:underline underline-offset-4"
                >
                  {p.name} ↗
                </a>
              ) : (
                <span className="font-medium text-neutral-900 dark:text-neutral-50">
                  {p.name}
                </span>
              )}
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {p.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {p.stack.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {section.cta && (
        <div className="mt-8 flex flex-wrap gap-3">
          {section.cta
            .filter((c): c is { label: string; href: string } => Boolean(c.href))
            .map((c, i) => (
            <a
              key={c.label}
              href={c.href}
              className={
                i === 0
                  ? "px-5 py-2.5 rounded-full bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 font-medium hover:opacity-90 transition-opacity"
                  : "px-5 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              }
            >
              {c.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
