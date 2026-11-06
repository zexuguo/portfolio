import type { Section } from "@/data/sections";
import Build from "./Build";

export default function SectionContent({
  section,
  className = "",
  compact = false,
  play,
}: {
  section: Section;
  className?: string;
  /** espaciado más ajustado para el escenario fijo de escritorio */
  compact?: boolean;
  /** modo controlado (escritorio): construye cuando el tema está activo */
  play?: boolean;
}) {
  return (
    <div className={className}>
      <Build kind="text" play={play}>
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">{section.eyebrow}</p>
        <h3 className="mb-4 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-4xl">{section.title}</h3>
      </Build>
      <Build play={play}>
        <p className={`max-w-prose leading-relaxed text-neutral-600 dark:text-neutral-300 ${compact ? "text-base lg:text-[17px]" : "text-base md:text-lg"}`}>
          {section.body}
        </p>
      </Build>
      {section.cta && (
        <Build play={play} className="mt-6">
          <div className="flex flex-wrap gap-3">
            {section.cta
              .filter((c): c is { label: string; href: string } => Boolean(c.href))
              .map((c, i) => (
                <a
                  key={c.label}
                  href={c.href}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-300 ${
                    i === 0
                      ? "bg-neutral-900 text-white hover:opacity-90 dark:bg-neutral-50 dark:text-neutral-900"
                      : "border border-neutral-300 text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
                  }`}
                >
                  {c.label}
                </a>
              ))}
          </div>
        </Build>
      )}
    </div>
  );
}
