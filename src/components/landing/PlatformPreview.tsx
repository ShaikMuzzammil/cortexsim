"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Layers, Activity, Radio, Network, Cpu, Database } from "lucide-react";
import { sectionsByGroup, SECTION_STATS } from "@/content/sections";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const GROUP_ICON: Record<string, React.ReactNode> = {
  Visualization: <Activity size={16} className="text-brand" />,
  Analysis: <Radio size={16} className="text-inh" />,
  "Dynamics & Learning": <Layers size={16} className="text-good" />,
  Connectivity: <Network size={16} className="text-warn" />,
  "Performance & Systems": <Cpu size={16} className="text-exc" />,
  "Data & Protocols": <Database size={16} className="text-brand" />,
};

const STATUS_STYLE: Record<string, string> = {
  live: "bg-good/15 text-good",
  beta: "bg-warn/15 text-warn",
  roadmap: "bg-slate-500/15 text-slate-400",
};

export default function PlatformPreview() {
  const groups = sectionsByGroup();
  return (
    <section id="platform" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="max-w-2xl"
      >
        <span className="rounded-md bg-inh/15 px-2.5 py-1 text-xs font-bold text-inh">
          THE PLATFORM
        </span>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {SECTION_STATS.total} integrated sections, one workspace
        </h2>
        <p className="mt-4 text-lg leading-8 text-slate-400">
          CortexSim is a full computational-neuroscience environment: live
          visualization, signal analysis, plasticity, connectivity tooling and
          data export - all driven by one simulation core.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="rounded-md bg-good/15 px-2.5 py-1 font-semibold text-good">
            {SECTION_STATS.live} live
          </span>
          <span className="rounded-md bg-warn/15 px-2.5 py-1 font-semibold text-warn">
            {SECTION_STATS.beta} in beta
          </span>
          <span className="rounded-md bg-slate-500/15 px-2.5 py-1 font-semibold text-slate-400">
            {SECTION_STATS.roadmap} on roadmap
          </span>
        </div>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        {groups.map((g) => (
          <motion.div
            key={g.group}
            variants={fadeUp}
            className="rounded-2xl border border-edge bg-panel/60 p-5"
          >
            <div className="flex items-center gap-2">
              {GROUP_ICON[g.group]}
              <h3 className="font-bold text-white">{g.group}</h3>
              <span className="ml-auto text-xs text-slate-500">
                {g.items.length}
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {g.items.slice(0, 5).map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-2 text-sm text-slate-300"
                >
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[s.status]}`}
                  >
                    {s.status}
                  </span>
                  <span className="truncate">{s.title}</span>
                </li>
              ))}
              {g.items.length > 5 ? (
                <li className="text-xs text-slate-500">
                  +{g.items.length - 5} more
                </li>
              ) : null}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-10">
        <Link
          href="/platform"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-white"
        >
          Explore all {SECTION_STATS.total} sections
          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
