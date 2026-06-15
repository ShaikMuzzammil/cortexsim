"use client";

import { motion } from "framer-motion";
import { Brain, GraduationCap, Microscope, Cpu, Globe, ShieldCheck } from "lucide-react";
import { fadeUp, stagger, hoverLift, viewportOnce } from "@/lib/motion";

const PILLARS = [
  {
    icon: Brain,
    title: "Makes the invisible visible",
    body: "Spiking dynamics happen in milliseconds across thousands of cells. CortexSim slows them down, paints them on screen, and lets you reason about emergent behaviour you could never see in a textbook.",
  },
  {
    icon: GraduationCap,
    title: "Lowers the barrier to neuroscience",
    body: "No CUDA, no cluster, no PhD required. A browser tab is enough to start exploring balance, oscillations and plasticity - so more people can learn computational neuroscience.",
  },
  {
    icon: Microscope,
    title: "Bridges theory and practice",
    body: "Every concept ships with a guide, a glossary entry and a hands-on module. You read the idea, then immediately break it, tune it and measure it.",
  },
  {
    icon: Cpu,
    title: "Prototypes neuromorphic ideas",
    body: "Validate sparse, event-driven circuits before they ever touch Loihi or SpiNNaker - saving expensive hardware iterations and energy.",
  },
  {
    icon: Globe,
    title: "Reproducible and shareable",
    body: "Seeded runs, exportable state and read-only share links mean a result you find can be sent to a colleague and rebuilt exactly - the heart of good science.",
  },
  {
    icon: ShieldCheck,
    title: "Runs anywhere, owns its data",
    body: "A single Next.js app with an authenticated workspace, REST API and file or database storage. Deploy it to Vercel in minutes or self-host it forever.",
  },
];

export default function Importance() {
  return (
    <section id="importance" className="border-y border-edge/60 bg-panel/30">
      <div className="mx-auto max-w-7xl px-6 py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="rounded-md bg-good/15 px-2.5 py-1 text-xs font-bold text-good">WHY IT MATTERS</span>
          <h2 className="mt-4 text-4xl font-extrabold sm:text-5xl">The importance of CortexSim</h2>
          <p className="mt-4 text-lg text-slate-400">
            Understanding the brain is one of science&apos;s hardest problems. CortexSim turns abstract spiking-network
            theory into something you can touch, tune and teach - in the browser, for everyone.
          </p>
        </motion.div>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <motion.div key={p.title} variants={fadeUp} whileHover={hoverLift} className="panel panel-pad">
                <div className="mb-4 inline-flex rounded-xl bg-good/15 p-3 text-good">
                  <Icon size={22} />
                </div>
                <h3 className="mb-2 text-lg font-bold">{p.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{p.body}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
