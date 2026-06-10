"use client";

import { motion } from "framer-motion";
import { fadeUp, slideInLeft, viewportOnce } from "@/lib/motion";

const STEPS = [
  {
    n: "01",
    title: "Pick a regime",
    body: "Start from six presets - asynchronous cortex, gamma oscillation, bursting, seizure storm and more.",
  },
  {
    n: "02",
    title: "Sculpt it live",
    body: "Drag sliders, swap cell models, change wiring topology, toggle plasticity and delays - all without restarting.",
  },
  {
    n: "03",
    title: "Read the brain",
    body: "Watch the raster, spectrum and synchrony respond. Probe a single neuron's voltage and phase plane.",
  },
  {
    n: "04",
    title: "Sweep & export",
    body: "Run a parameter sweep, then export spikes, state, a PDF report or a replayable recording.",
  },
];

export default function Showcase() {
  return (
    <section id="showcase" className="mx-auto max-w-6xl px-6 py-28">
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mb-16 text-center text-4xl font-extrabold sm:text-5xl"
      >
        From zero to insight in four steps
      </motion.h2>
      <div className="grid gap-6 md:grid-cols-2">
        {STEPS.map((s) => (
          <motion.div
            key={s.n}
            variants={slideInLeft}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="panel panel-pad flex gap-5"
          >
            <span className="font-mono text-3xl font-extrabold text-brand/60">
              {s.n}
            </span>
            <div>
              <h3 className="mb-1 text-xl font-bold">{s.title}</h3>
              <p className="text-slate-400">{s.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
