"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const STATS = [
  { value: "35", label: "Interactive studio modules" },
  { value: "6", label: "Scientific domains" },
  { value: "13", label: "Learning guides" },
  { value: "15", label: "Export formats" },
  { value: "23", label: "REST API endpoints" },
  { value: "100%", label: "Runs in your browser" },
];

export default function Metrics() {
  return (
    <section className="relative border-y border-edge/60 bg-panel/20 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6"
        >
          {STATS.map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="text-center">
              <div className="bg-gradient-to-b from-white to-brand bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
                {s.value}
              </div>
              <div className="mt-2 text-xs leading-snug text-slate-400">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
