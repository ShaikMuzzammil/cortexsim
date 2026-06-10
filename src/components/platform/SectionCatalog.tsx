"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Target } from "lucide-react";
import {
  SECTIONS,
  SECTION_GROUPS,
  SECTION_STATS,
  type SectionStatus,
} from "@/content/sections";
import { fadeUp, stagger } from "@/lib/motion";

const STATUS_STYLE: Record<SectionStatus, string> = {
  live: "bg-good/15 text-good border-good/30",
  beta: "bg-warn/15 text-warn border-warn/30",
  roadmap: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

const FILTERS = ["All", ...SECTION_GROUPS] as const;

export default function SectionCatalog() {
  const [filter, setFilter] = useState<string>("All");
  const visible =
    filter === "All"
      ? SECTIONS
      : SECTIONS.filter((s) => s.group === filter);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <span className="rounded-md bg-good/15 px-2.5 py-1 font-semibold text-good">
          {SECTION_STATS.live} live
        </span>
        <span className="rounded-md bg-warn/15 px-2.5 py-1 font-semibold text-warn">
          {SECTION_STATS.beta} beta
        </span>
        <span className="rounded-md bg-slate-500/15 px-2.5 py-1 font-semibold text-slate-400">
          {SECTION_STATS.roadmap} roadmap
        </span>
      </div>

      <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? "shrink-0 rounded-full bg-brand px-3.5 py-1.5 text-sm font-semibold text-ink"
                : "shrink-0 rounded-full border border-edge px-3.5 py-1.5 text-sm text-slate-400 hover:text-white"
            }
          >
            {f}
          </button>
        ))}
      </div>

      <motion.div
        key={filter}
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        {visible.map((s) => (
          <motion.article
            key={s.id}
            variants={fadeUp}
            className="flex flex-col rounded-2xl border border-edge bg-panel/60 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold leading-snug text-white">
                <span className="mr-1.5 text-slate-600">{s.id}.</span>
                {s.title}
              </h3>
              <span
                className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[s.status]}`}
              >
                {s.status}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">{s.what}</p>
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-ink/50 p-2.5">
              <Lightbulb size={14} className="mt-0.5 shrink-0 text-warn" />
              <p className="text-xs leading-5 text-slate-300">{s.tip}</p>
            </div>
            <div className="mt-2 flex items-start gap-2">
              <Target size={14} className="mt-0.5 shrink-0 text-good" />
              <p className="text-xs leading-5 text-slate-400">{s.outcome}</p>
            </div>
            <span className="mt-3 text-[11px] uppercase tracking-wide text-slate-600">
              {s.group}
            </span>
          </motion.article>
        ))}
      </motion.div>
    </div>
  );
}
