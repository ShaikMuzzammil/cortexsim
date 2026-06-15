"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger, hoverLift, viewportOnce } from "@/lib/motion";

const QUOTES = [
  {
    quote:
      "My students finally see balance and synchrony instead of memorising definitions. The mind map alone changed how I teach the course.",
    name: "Lecturer, computational neuroscience",
    org: "University course",
  },
  {
    quote:
      "I prototype a circuit here in minutes, export the JSON, and hand it straight to our SpiNNaker pipeline. It removed a whole day of setup.",
    name: "Neuromorphic engineer",
    org: "Hardware lab",
  },
  {
    quote:
      "The parameter sweep plus the compare view turned a vague hunch into a figure I could actually put in a paper.",
    name: "PhD researcher",
    org: "Systems neuroscience",
  },
];

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mb-14 text-center text-4xl font-extrabold sm:text-5xl"
      >
        Built for people who think in spikes
      </motion.h2>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid gap-5 md:grid-cols-3"
      >
        {QUOTES.map((q) => (
          <motion.figure key={q.name} variants={fadeUp} whileHover={hoverLift} className="panel panel-pad flex flex-col">
            <blockquote className="text-sm leading-relaxed text-slate-200">{q.quote}</blockquote>
            <figcaption className="mt-5 border-t border-edge/60 pt-4">
              <div className="text-sm font-semibold text-white">{q.name}</div>
              <div className="text-xs text-slate-400">{q.org}</div>
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>
      <p className="mt-8 text-center text-xs text-slate-500">Illustrative use cases from the kinds of people CortexSim is built for.</p>
    </section>
  );
}
