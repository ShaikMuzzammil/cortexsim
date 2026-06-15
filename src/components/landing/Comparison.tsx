"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { fadeUp, viewportOnce } from "@/lib/motion";

const ROWS = [
  { feature: "Runs live in the browser", cortex: true, notebook: false, slides: false },
  { feature: "Real-time interactive controls", cortex: true, notebook: true, slides: false },
  { feature: "35 prebuilt analysis modules", cortex: true, notebook: false, slides: false },
  { feature: "Guided learning path", cortex: true, notebook: false, slides: true },
  { feature: "15 export formats", cortex: true, notebook: true, slides: false },
  { feature: "Projects, runs and sharing", cortex: true, notebook: false, slides: false },
  { feature: "REST API + webhooks", cortex: true, notebook: false, slides: false },
  { feature: "Zero install", cortex: true, notebook: false, slides: true },
];

function Cell({ on }: { on: boolean }) {
  return on ? (
    <Check className="mx-auto text-good" size={18} />
  ) : (
    <X className="mx-auto text-slate-600" size={18} />
  );
}

export default function Comparison() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-28">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto mb-12 max-w-2xl text-center"
      >
        <h2 className="text-4xl font-extrabold sm:text-5xl">Why a studio, not a notebook</h2>
        <p className="mt-4 text-slate-400">CortexSim combines the interactivity of code with the polish of a product.</p>
      </motion.div>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="panel overflow-hidden"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-edge text-slate-300">
              <th className="px-4 py-3 text-left font-semibold">Capability</th>
              <th className="px-4 py-3 text-center font-semibold text-brand">CortexSim</th>
              <th className="px-4 py-3 text-center font-semibold">Notebook</th>
              <th className="px-4 py-3 text-center font-semibold">Slides</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.feature} className="border-b border-edge/50 last:border-0">
                <td className="px-4 py-3 text-slate-200">{r.feature}</td>
                <td className="px-4 py-3"><Cell on={r.cortex} /></td>
                <td className="px-4 py-3"><Cell on={r.notebook} /></td>
                <td className="px-4 py-3"><Cell on={r.slides} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </section>
  );
}
