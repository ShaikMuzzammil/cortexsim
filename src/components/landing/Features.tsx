import { useReveal } from "../../hooks/useReveal";

const FEATURES = [
  {
    icon: "🧠",
    title: "Biophysical engine",
    body: "Izhikevich (2003) neurons with excitatory & inhibitory populations and sparse synaptic wiring.",
  },
  {
    icon: "🌐",
    title: "Live 3D network",
    body: "Drag to rotate, scroll to zoom. Every spike flashes across the neuron cloud in real time.",
  },
  {
    icon: "📊",
    title: "Spike raster",
    body: "A scrolling raster plot reveals oscillations, avalanches, and synchrony as they emerge.",
  },
  {
    icon: "📈",
    title: "Population rate",
    body: "A live firing-rate trace tracks the collective rhythm of the whole network.",
  },
  {
    icon: "🎛️",
    title: "Full control",
    body: "Tune neurons, connectivity, gains, drive and cell models — results update instantly.",
  },
  {
    icon: "⚡",
    title: "One-click regimes",
    body: "Jump between asynchronous, gamma, bursting, seizure and quiescent dynamics in a tap.",
  },
  {
    icon: "📤",
    title: "Pro exports",
    body: "Save PNG figures, CSV spike trains, JSON configs, and a print-ready PDF report.",
  },
  {
    icon: "🔒",
    title: "No account, ever",
    body: "No login, no profile, no settings, no backend. Open it and it just runs.",
  },
];

export default function Features() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="features" className="relative mx-auto max-w-6xl px-6 py-28">
      <div ref={ref} className="mb-14 text-center">
        <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
          Everything you need to
          <span className="gradient-text"> probe a network</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/60">
          A complete computational-neuroscience playground — no install, no
          sign-up, no friction.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="hot glass group rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1.5 hover:border-white/20"
          >
            <div className="text-3xl">{f.icon}</div>
            <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              {f.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
