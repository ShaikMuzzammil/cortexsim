"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import type { Guide } from "@/content/types";
import { fadeUp, hoverLift, tapPress } from "@/lib/motion";

const CATEGORY_COLOR: Record<string, string> = {
  Basics: "text-brand bg-brand/15",
  Neuroscience: "text-exc bg-exc/15",
  Networks: "text-inh bg-inh/15",
  Analysis: "text-good bg-good/15",
  Workflow: "text-warn bg-warn/15",
};

export default function GuideCard({ guide, index }: { guide: Guide; index: number }) {
  const badge = CATEGORY_COLOR[guide.category] ?? "text-brand bg-brand/15";
  return (
    <motion.div variants={fadeUp} whileHover={hoverLift} whileTap={tapPress}>
      <Link
        href={`/learn/${guide.slug}`}
        className="group flex h-full flex-col rounded-2xl border border-edge bg-panel/70 p-5 transition-colors hover:border-brand/50"
      >
        <div className="flex items-center justify-between">
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${badge}`}>
            {guide.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock size={12} />
            {guide.readingTimeMin} min
          </span>
        </div>
        <h3 className="mt-3 text-lg font-bold tracking-tight text-white">
          {index + 1}. {guide.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{guide.summary}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
          Read guide
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </motion.div>
  );
}
