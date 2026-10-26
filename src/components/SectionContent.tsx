import type { Section } from "@/data/sections";

export default function SectionContent({
  section,
  className = "",
  compact = false,
}: {
  section: Section;
  className?: string;
  /** tighter spacing for the pinned desktop stage */
  compact?: boolean;
}) {
  // "Lo que sé" lists skills, not projects: show them as a compact list
  const isSkillList = section.id === "cerebro";
  return (
    <div className={className}>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 mb-4">
        {section.eyebrow}
      </p>
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-neutral-900 dark:text-neutral-50">
        {section.title}
      </h2>
      <p
        className={`leading-relaxed text-neutral-600 dark:text-neutral-300 max-w-prose ${
          compact ? "text-base lg:text-[17px]" : "text-base md:text-lg"
        }`}
      >
        {section.body}
      </p>

      {section.projects && isSkillList ? (
        // short skill list: name + one line, no cards
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3.5 border-t border-neutral-200 dark:border-neutral-800 pt-5">
          {section.projects.map((p) => (
            <div key={p.name}>
              <dt className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{p.name}</dt>
              <dd className="text-[13px] leading-snug text-neutral-500 dark:text-neutral-400 mt-0.5">
                {p.description}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {section.projects && !isSkillList && (
        <ul
          className={`grid grid-cols-1 sm:grid-cols-2 [&>li:last-child:nth-child(odd)]:sm:col-span-2 ${
            compact ? "mt-5 gap-2.5" : "mt-6 gap-4"
          }`}
        >
          {section.projects.map((p) => (
            <li
              key={p.name}
              className={`rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur ${
                compact ? "p-3.5" : "p-4"
              }`}
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
              <p className={`text-neutral-600 dark:text-neutral-400 mt-1 ${compact ? "text-[13px] leading-snug" : "text-sm"}`}>
                {p.description}
              </p>
              <div className={`flex flex-wrap gap-1.5 ${compact ? "mt-2" : "mt-3"}`}>
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
