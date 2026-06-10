"use client";

import { motion } from "framer-motion";
import {
  Box,
  Activity,
  SlidersHorizontal,
  LineChart,
  FlaskConical,
  Download,
  Cpu,
  GitBranch,
} from "lucide-react";
import { fadeUp, stagger, hoverLift, viewportOnce } from "@/lib/motion";

const FEATURES = [
  {
    icon: Box,
    title: "3D Network View",
    body: "Thousands of neurons rendered on a brain-shell with WebGL. Excitatory cells glow red, inhibitory blue, spikes flash white.",
  },
  {
    icon: SlidersHorizontal,
    title: "Live Controls",
    body: "Ten smooth sliders reshape the network in real time - gain, drive, connectivity, noise, synaptic decay and more.",
  },
  {
    icon: Cpu,
    title: "Editable Dynamics",
    body: "Rewrite the dv/dt and du/dt equations from the UI and watch the whole population respond instantly.",
  },
  {
    icon: LineChart,
    title: "Seven Live Charts",
    body: "Raster, rate histogram, Welch power spectrum, voltage scope, phase plane, LFP and a correlation matrix.",
  },
  {
    icon: Activity,
    title: "Real Analytics",
    body: "Population rate, synchrony index, dominant frequency, Shannon entropy and pairwise correlations every frame.",
  },
  {
    icon: FlaskConical,
    title: "Parameter Sweeps",
    body: "Batch-run across any parameter and chart how rate, synchrony and rhythm change across the range.",
  },
  {
    icon: GitBranch,
    title: "Topologies & Plasticity",
    body: "Random, small-world, scale-free and grid wiring, optional STDP plasticity and axonal delay lines.",
  },
  {
    icon: Download,
    title: "Export Everything",
    body: "Save PNG snapshots, CSV spike trains, JSON state, printable PDF reports and replayable recordings.",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-7xl px-6 py-28">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto mb-16 max-w-2xl text-center"
      >
        <h2 className="text-4xl font-extrabold sm:text-5xl">
          Everything is interactive
        </h2>
        <p className="mt-4 text-slate-400">
          Not screenshots, not slides - a living simulator with real features you
          can touch.
        </p>
      </motion.div>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              variants={fadeUp}
              whileHover={hoverLift}
              className="panel panel-pad"
            >
              <div className="mb-4 inline-flex rounded-xl bg-brand/15 p-3 text-brand">
                <Icon size={22} />
              </div>
              <h3 className="mb-2 text-lg font-bold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{f.body}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
