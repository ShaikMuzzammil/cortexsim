"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger, scaleIn, viewportOnce } from "@/lib/motion";

const STACK = [
  { name: "Next.js 14", note: "App Router + API routes" },
  { name: "React 18", note: "Concurrent UI" },
  { name: "TypeScript", note: "End-to-end types" },
  { name: "Tailwind CSS", note: "Design system" },
  { name: "Framer Motion", note: "Smooth animation" },
  { name: "Three.js", note: "WebGL 3D" },
  { name: "Zustand", note: "State store" },
  { name: "MongoDB", note: "Persistence (MERN)" },
  { name: "Node runtime", note: "Serverless functions" },
  { name: "Vercel", note: "Edge deployment" },
];

export default function TechStack() {
  return (
    <section id="stack" className="relative border-y border-edge/60 bg-panel/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-3 text-center text-4xl font-extrabold sm:text-5xl"
        >
          A serious full-stack
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-14 text-center text-slate-400"
        >
          Modern, production-grade tooling from database to pixels.
        </motion.p>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        >
          {STACK.map((s) => (
            <motion.div
              key={s.name}
              variants={scaleIn}
              className="panel flex flex-col items-center justify-center gap-1 px-4 py-6 text-center"
            >
              <span className="font-bold text-white">{s.name}</span>
              <span className="text-xs text-slate-400">{s.note}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
