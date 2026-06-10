"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";
import { ArrowLeft } from "lucide-react";

const SECTIONS = [
  {
    title: "The Izhikevich neuron",
    body: "Each neuron follows a 2-variable model: a fast membrane potential v and a slow recovery variable u. The equations dv/dt = 0.04v^2 + 5v + 140 - u + I and du/dt = a(bv - u) reproduce regular spiking, bursting, chattering and fast-spiking dynamics with just four parameters (a, b, c, d).",
  },
  {
    title: "Excitation / inhibition balance",
    body: "80% of cells are excitatory (they add current to their targets), 20% are inhibitory (they subtract it). The brain operates near a balanced regime; tilting the excGain / inhGain sliders moves the network between asynchronous, oscillatory and seizure-like states.",
  },
  {
    title: "Synapses and currents",
    body: "Spikes deposit a current onto post-synaptic targets that decays exponentially with time constant tauSyn (~5 ms). Optional axonal delays route current through a ring buffer so that signals arrive several milliseconds later.",
  },
  {
    title: "Topologies",
    body: "Random (Erdos-Renyi), small-world (Watts-Strogatz ring + rewiring), scale-free (preferential attachment) and grid lattices each produce distinct synchronization and propagation behaviour.",
  },
  {
    title: "Analytics",
    body: "The dashboard computes population rate, active fraction, a synchrony index from rate variance, dominant frequency via a Welch power spectrum, an LFP proxy, Shannon entropy of the firing distribution and pairwise correlations.",
  },
  {
    title: "Plasticity (STDP)",
    body: "When enabled, a homeostatic spike-timing rule nudges the excitatory gain toward a target activity level, demonstrating how networks self-regulate.",
  },
];

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="btn-ghost mb-10">
        <ArrowLeft size={16} /> Home
      </Link>
      <h1 className="mb-2 text-4xl font-extrabold">Learn the science</h1>
      <p className="mb-10 text-slate-400">
        A quick tour of the neuroscience powering CortexSim Studio.
      </p>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {SECTIONS.map((s) => (
          <motion.section key={s.title} variants={fadeUp} className="panel panel-pad">
            <h2 className="mb-2 text-xl font-bold text-brand">{s.title}</h2>
            <p className="leading-relaxed text-slate-300">{s.body}</p>
          </motion.section>
        ))}
      </motion.div>
      <div className="mt-12 text-center">
        <Link href="/simulator" className="btn-primary">
          Launch the simulator
        </Link>
      </div>
    </main>
  );
}
