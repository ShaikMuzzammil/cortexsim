import { useReveal } from "../../hooks/useReveal";
import { GUIDES } from "../../content/guides";
import Disclosure from "../Disclosure";
import GuideContent from "../GuideContent";

interface Props {
  /** "landing" shows the full marketing section; "platform" shows a compact
   *  in-app reference drawer under the dashboard. */
  variant?: "landing" | "platform";
}

export default function LearnDeepDive({ variant = "landing" }: Props) {
  const ref = useReveal<HTMLDivElement>();
  const platform = variant === "platform";

  return (
    <section
      id={platform ? undefined : "learn"}
      className={platform ? "px-4 pb-16" : "relative px-6 py-28"}
    >
      <div
        ref={ref}
        className={`reveal ${platform ? "mx-auto max-w-7xl" : "mx-auto max-w-4xl"}`}
      >
        <div className={platform ? "mb-5" : "mb-12 text-center"}>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/50">
            <span>📖</span> Learn while you simulate
          </div>
          <h2
            className={
              platform
                ? "text-2xl font-black tracking-tight"
                : "text-4xl font-black tracking-tight sm:text-5xl"
            }
          >
            How each feature{" "}
            <span className="gradient-text">actually works</span>
          </h2>
          {!platform ? (
            <p className="mx-auto mt-4 max-w-2xl text-white/60">
              Five flagship tools, each one a self-contained lesson. Expand any
              card to see the mechanism, the neuroscience you take away, and the
              engineering / operating-systems concept it maps onto.
            </p>
          ) : (
            <p className="mt-2 max-w-2xl text-sm text-white/55">
              Expand any panel to understand the mechanism behind what you are
              watching — and the engineering idea it mirrors.
            </p>
          )}
        </div>

        <div className="space-y-3">
          {GUIDES.map((g, i) => (
            <Disclosure
              key={g.id}
              icon={g.icon}
              title={g.title}
              subtitle={g.tagline}
              defaultOpen={!platform && i === 0}
            >
              <GuideContent guide={g} />
            </Disclosure>
          ))}
        </div>
      </div>
    </section>
  );
}
