"use client";

import { motion } from "framer-motion";
import { GraduationCap, FlaskConical, Cpu, Activity, Brain, Share2 } from "lucide-react";
import { fadeUp, stagger, hoverLift, viewportOnce } from "@/lib/motion";

const CASES = [
  {
    icon: GraduationCap,
    title: "Teaching neuroscience",
    body: "Replace static slides with a living network. Students change a parameter and watch the brain respond - 13 guides scaffold the journey.",
    tags: ["Lectures", "Lab courses"],
  },
  {
    icon: FlaskConical,
    title: "Research prototyping",
    body: "Sketch a circuit, sweep its parameters, export reproducible state JSON, then port it to your full HPC pipeline.",
    tags: ["Sweeps", "Reproducibility"],
  },
  {
    icon: Cpu,
    title: "Neuromorphic design",
    body: "Tune sparse, event-driven dynamics before they hit Loihi or SpiNNaker. Aim for low firing rates and validate behaviour.",
    tags: ["Loihi", "SpiNNaker"],
  },
  {
    icon: Activity,
    title: "Signal analysis demos",
    body: "Show spectra, spectrograms and synchrony forming live - perfect for explaining EEG, LFP and oscillation concepts.",
    tags: ["EEG / LFP", "DSP"],
  },
  {
    icon: Brain,
    title: "Concept exploration",
    body: "Build intuition for balance, criticality and waves by breaking them on purpose and watching what happens.",
    tags: ["Intuition", "Dynamics"],
  },
  {
    icon: Share2,
    title: "Collaboration",
    body: "Organise runs into projects, leave notes and comments, then publish a read-only share link for your team.",
    tags: ["Projects", "Sharing"],
  },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="mx-auto max-w-7xl px-6 py-28">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto mb-16 max-w-2xl text-center"
      >
        <span className="rounded-md bg-brand/15 px-2.5 py-1 text-xs font-bold text-brand">WHO IT IS FOR</span>
        <h2 className="mt-4 text-4xl font-extrabold sm:text-5xl">One studio, many missions</h2>
        <p className="mt-4 text-slate-400">From the lecture hall to the research bench to the silicon lab.</p>
      </motion.div>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {CASES.map((c) => {
          const Icon = c.icon;
          return (
            <motion.div key={c.title} variants={fadeUp} whileHover={hoverLift} className="panel panel-pad">
              <div className="mb-4 inline-flex rounded-xl bg-brand/15 p-3 text-brand">
                <Icon size={22} />
              </div>
              <h3 className="mb-2 text-lg font-bold">{c.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{c.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {c.tags.map((t) => (
                  <span key={t} className="rounded-full border border-edge px-2.5 py-0.5 text-[11px] text-slate-300">{t}</span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
