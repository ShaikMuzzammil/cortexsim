import { useReveal } from "../../hooks/useReveal";

const FEATURES = [
  {
    icon: "🧠",
    title: "Real Izhikevich neurons",
    body: "Biologically grounded spiking dynamics — not a toy animation.",
  },
  {
    icon: "🌐",
    title: "Interactive 3D cloud",
    body: "Drag to rotate, scroll to zoom; every spike flashes in real time.",
  },
  {
    icon: "📊",
    title: "Live raster & rate",
    body: "Spike raster and population firing rate update every frame.",
  },
  {
    icon: "🎛️",
    title: "Full parameter control",
    body: "Tune size, connectivity, E/I balance, drive and speed live.",
  },
  {
    icon: "⚡",
    title: "Stimulate the network",
    body: "Inject current pulses and watch the response propagate.",
  },
  {
    icon: "📈",
    title: "Power spectrum",
    body: "Live FFT reveals the dominant oscillation frequency.",
  },
  {
    icon: "🔬",
    title: "Probe any neuron",
    body: "Watch a single cell's membrane voltage and phase portrait.",
  },
  {
    icon: "📥",
    title: "Export everything",
    body: "PNG, CSV, JSON and a print-ready PDF report — one click.",
  },
];

export default function Features() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="features" className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div ref={ref} className="reveal mb-14 text-center">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            Everything you need to
            <span className="gradient-text"> explore dynamics</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            A complete, real simulator — not a landing page with a fake demo.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass hot group rounded-2xl p-5 transition-transform hover:-translate-y-1"
            >
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="mb-1.5 font-bold">{f.title}</h3>
              <p className="text-sm text-white/55">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
