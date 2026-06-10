"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Tip } from "@/content/types";
import { fadeUp, stagger, viewportOnce, hoverLift } from "@/lib/motion";

export default function TipsGrid({ tips }: { tips: Tip[] }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {tips.map((tip, i) => (
        <motion.div
          key={i}
          variants={fadeUp}
          whileHover={hoverLift}
          className="flex flex-col rounded-2xl border border-edge bg-panel/70 p-5"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
              <Sparkles size={16} />
            </span>
            <span className="rounded-md bg-panel2/70 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
              {tip.category}
            </span>
          </div>
          <h3 className="mt-3 font-bold text-white">{tip.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{tip.body}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
