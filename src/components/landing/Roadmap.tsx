"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const PHASES = [
  {
    tag: "Shipped",
    color: "text-good",
    title: "Studio + workspace",
    items: ["35 interactive modules", "Auth, projects, runs, notes", "15 export formats", "Webhooks + share links"],
  },
  {
    tag: "In progress",
    color: "text-brand",
    title: "Deeper analysis",
    items: ["Information-theory dashboards", "Run comparison v2", "Curriculum tracking", "Managed-DB adapter"],
  },
  {
    tag: "Next",
    color: "text-warn",
    title: "Scale + collaboration",
    items: ["Real-time multiplayer rooms", "Surrogate-gradient training", "Hardware export (Lava / PyNN)", "Team workspaces"],
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="mx-auto max-w-6xl px-6 py-28">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto mb-14 max-w-2xl text-center"
      >
        <span className="rounded-md bg-brand/15 px-2.5 py-1 text-xs font-bold text-brand">ROADMAP</span>
        <h2 className="mt-4 text-4xl font-extrabold sm:text-5xl">Where CortexSim is going</h2>
        <p className="mt-4 text-slate-400">An honest snapshot of what is done, what is cooking, and what is next.</p>
      </motion.div>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid gap-5 md:grid-cols-3"
      >
        {PHASES.map((p) => (
          <motion.div key={p.title} variants={fadeUp} className="panel panel-pad">
            <div className={"text-xs font-bold uppercase tracking-wider " + p.color}>{p.tag}</div>
            <h3 className="mb-3 mt-1 text-lg font-bold">{p.title}</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              {p.items.map((it) => (
                <li key={it} className="flex gap-2"><span className="text-brand">-</span>{it}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
