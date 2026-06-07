import { useReveal } from "../../hooks/useReveal";

export default function Science() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="science" className="relative px-6 py-28">
      <div ref={ref} className="reveal mx-auto max-w-4xl">
        <div className="glass rounded-3xl p-8 sm:p-12">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            The <span className="gradient-text">science</span> inside
          </h2>
          <p className="mt-4 text-white/65">
            Each neuron follows the Izhikevich (2003) model — two coupled
            differential equations that reproduce the rich firing patterns of
            real cortical cells at a fraction of the cost of Hodgkin–Huxley.
          </p>
          <pre className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-5 text-sm text-cyan-200">
            {`v' = 0.04 v² + 5 v + 140 − u + I
u' = a (b v − u)
if v ≥ 30 mV:   v ← c,   u ← u + d`}
          </pre>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 p-4">
              <div className="text-2xl font-extrabold text-brand-cyan">80%</div>
              <div className="mt-1 text-sm text-white/55">
                Excitatory neurons driving activity
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 p-4">
              <div className="text-2xl font-extrabold text-brand-violet">
                20%
              </div>
              <div className="mt-1 text-sm text-white/55">
                Fast-spiking inhibitory neurons
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 p-4">
              <div className="text-2xl font-extrabold text-brand-pink">∞</div>
              <div className="mt-1 text-sm text-white/55">
                Emergent rhythms from the network alone
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
