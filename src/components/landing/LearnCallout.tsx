"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Map, Lightbulb, BookOpen, ArrowRight } from "lucide-react";
import { GUIDES } from "@/content/guides";
import { TOTAL_XP } from "@/content/modules";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const CARDS = [
  {
    href: "/learn",
    icon: <GraduationCap size={20} className="text-brand" />,
    title: "Guided learning path",
    body: "Step-by-step modules with objectives, hands-on experiments and saved progress.",
  },
  {
    href: "/learn/map",
    icon: <Map size={20} className="text-good" />,
    title: "Curriculum mind map",
    body: "See the whole syllabus as a branching map and track what you have mastered.",
  },
  {
    href: "/tips",
    icon: <Lightbulb size={20} className="text-warn" />,
    title: "Tips & shortcuts",
    body: "Field-tested workflow tips and the full keyboard reference.",
  },
  {
    href: "/glossary",
    icon: <BookOpen size={20} className="text-inh" />,
    title: "Glossary",
    body: "Every term defined in plain language, searchable.",
  },
];

export default function LearnCallout() {
  return (
    <section
      id="learn-cta"
      className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24"
    >
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="max-w-2xl"
      >
        <span className="rounded-md bg-good/15 px-2.5 py-1 text-xs font-bold text-good">
          LEARN BY DOING
        </span>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          A real learning platform, not just docs
        </h2>
        <p className="mt-4 text-lg leading-8 text-slate-400">
          {GUIDES.length} interactive modules worth {TOTAL_XP} XP. Each one gives
          you a checklist of what to do, experiments to try, the outcomes to
          expect, a place to save notes, and progress that follows you.
        </p>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {CARDS.map((c) => (
          <motion.div key={c.href} variants={fadeUp}>
            <Link
              href={c.href}
              className="group flex h-full flex-col rounded-2xl border border-edge bg-panel/60 p-5 transition-colors hover:border-brand/50"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink/70">
                {c.icon}
              </div>
              <h3 className="mt-4 font-bold text-white">{c.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-6 text-slate-400">
                {c.body}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                Open <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
