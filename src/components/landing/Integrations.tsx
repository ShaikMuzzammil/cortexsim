"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger, scaleIn, viewportOnce } from "@/lib/motion";

const TARGETS = [
  { name: "Python", note: "matplotlib script" },
  { name: "MATLAB", note: ".m + CSV" },
  { name: "R", note: "base-R plot" },
  { name: "NumPy", note: "loadtxt matrix" },
  { name: "LaTeX", note: "paper-ready table" },
  { name: "Markdown", note: "wiki / PR report" },
  { name: "Gephi", note: "GraphML graph" },
  { name: "Graphviz", note: "DOT graph" },
  { name: "Excel / Sheets", note: "CSV + TSV" },
  { name: "YAML", note: "version control" },
  { name: "SVG", note: "vector figure" },
  { name: "Webhooks", note: "any HTTPS endpoint" },
];

export default function Integrations() {
  return (
    <section id="integrations" className="mx-auto max-w-6xl px-6 py-28">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto mb-14 max-w-2xl text-center"
      >
        <span className="rounded-md bg-brand/15 px-2.5 py-1 text-xs font-bold text-brand">EXPORT ANYWHERE</span>
        <h2 className="mt-4 text-4xl font-extrabold sm:text-5xl">Your data, your tools</h2>
        <p className="mt-4 text-slate-400">
          Fifteen export formats plus signed webhooks mean CortexSim drops straight into the rest of your workflow.
        </p>
      </motion.div>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        {TARGETS.map((t) => (
          <motion.div key={t.name} variants={scaleIn} className="panel flex items-center justify-between px-4 py-4">
            <span className="font-semibold text-white">{t.name}</span>
            <span className="text-xs text-slate-400">{t.note}</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
