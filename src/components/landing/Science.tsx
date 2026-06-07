import { useReveal } from "../../hooks/useReveal";

export default function Science() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="science" className="relative mx-auto max-w-5xl px-6 py-28">
      <div ref={ref} className="glass rounded-3xl p-8 sm:p-12">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          The <span className="gradient-text">science</span> under the hood
        </h2>
        <p className="mt-4 max-w-2xl text-white/60">
          Each neuron evolves with the Izhikevich model — two coupled equations
          that reproduce a startling range of real cortical firing patterns at a
          tiny fraction of the cost of Hodgkin–Huxley.
        </p>
        <pre className="mt-6 overflow-x-auto rounded-2xl bg-black/40 p-5 font-mono text-sm text-cyan-200">
          {`v' = 0.04 v² + 5 v + 140 − u + I
u' = a (b v − u)

if v ≥ 30 mV:   v ← c,   u ← u + d`}
        </pre>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div>
            <div className="text-sm font-bold text-cyan-200">Excitatory</div>
            <p className="mt-1 text-sm text-white/55">
              80% of cells. Regular, bursting, or chattering variants drive
              network activity.
            </p>
          </div>
          <div>
            <div className="text-sm font-bold text-violet-200">Inhibitory</div>
            <p className="mt-1 text-sm text-white/55">
              20% fast-spiking interneurons keep runaway excitation in check.
            </p>
          </div>
          <div>
            <div className="text-sm font-bold text-pink-200">Emergence</div>
            <p className="mt-1 text-sm text-white/55">
              Oscillations and synchrony arise from the network alone — nothing
              is scripted.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
