"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const STEPS = [
  {
    n: "01",
    title: "Pick a domain",
    body: "Choose from six domains - Visualization, Analysis, Dynamics & Learning, Connectivity, Performance, and Data & Protocols - each holding focused, hands-on modules.",
    detail: "35 modules, every one with a why, applications and a try-this experiment.",
  },
  {
    n: "02",
    title: "Tune the network live",
    body: "Drag sliders for neuron count, drive, inhibition, topology and plasticity. The shared SNN engine recomputes spikes in real time and streams them to every panel.",
    detail: "One engine bus keeps the raster, spectrum and metrics perfectly in sync.",
  },
  {
    n: "03",
    title: "Measure and understand",
    body: "Watch firing rate, synchrony, dominant frequency and entropy update as you experiment. Guides and the glossary explain exactly what each number means.",
    detail: "13 guides plus an interactive knowledge check turn observation into intuition.",
  },
  {
    n: "04",
    title: "Save, export and share",
    body: "Group runs into projects, leave notes, then export to 15 formats or publish a read-only share link for your team or class.",
    detail: "CSV, JSON, Python, MATLAB, LaTeX, GraphML and more - one click each.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-28">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto mb-16 max-w-2xl text-center"
      >
        <span className="rounded-md bg-brand/15 px-2.5 py-1 text-xs font-bold text-brand">HOW IT WORKS</span>
        <h2 className="mt-4 text-4xl font-extrabold sm:text-5xl">From curiosity to insight in four steps</h2>
        <p className="mt-4 text-slate-400">A guided path that works for a five-minute demo or a semester-long course.</p>
      </motion.div>
      <motion.ol
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid gap-5 lg:grid-cols-4"
      >
        {STEPS.map((s) => (
          <motion.li key={s.n} variants={fadeUp} className="panel panel-pad">
            <div className="mb-4 text-3xl font-black text-brand/40">{s.n}</div>
            <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
            <p className="text-sm leading-relaxed text-slate-400">{s.body}</p>
            <p className="mt-3 border-t border-edge pt-3 text-xs text-slate-500">{s.detail}</p>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  );
}
