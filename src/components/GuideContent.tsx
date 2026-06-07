import type { Guide } from "../content/guides";

/** Renders one feature guide: how it works, what you learn, the engineering
 *  parallel, a thing to try, and references. */
export default function GuideContent({ guide }: { guide: Guide }) {
  return (
    <div className="space-y-6 text-sm leading-relaxed">
      <p className="text-white/70">{guide.tagline}</p>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-cyan">
            How it works
          </h4>
          <ol className="list-decimal space-y-2 pl-5 text-white/65 marker:text-white/30">
            {guide.how.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-violet">
            What you learn
          </h4>
          <ul className="list-disc space-y-2 pl-5 text-white/65 marker:text-white/30">
            {guide.learn.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-brand-cyan/25 bg-brand-cyan/5 p-4">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-cyan">
          <span>⚙️</span> Engineering &amp; OS parallel —{" "}
          {guide.engineering.title}
        </div>
        <p className="text-white/70">{guide.engineering.body}</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <span className="font-semibold text-brand-pink">▶ Try it: </span>
        <span className="text-white/70">{guide.tryIt}</span>
      </div>

      {guide.refs.length > 0 ? (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
            References
          </h4>
          <ul className="space-y-1">
            {guide.refs.map((r) => (
              <li key={r.href}>
                <a
                  href={r.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-cyan/80 underline-offset-2 hover:text-brand-cyan hover:underline"
                >
                  {r.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
