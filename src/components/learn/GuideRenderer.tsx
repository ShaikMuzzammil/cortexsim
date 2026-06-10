"use client";

import { motion } from "framer-motion";
import { Lightbulb, AlertTriangle } from "lucide-react";
import type { GuideBlock } from "@/content/types";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case "p":
      return <p className="text-[15px] leading-7 text-slate-300">{block.text}</p>;
    case "h":
      return (
        <h2 className="mt-10 scroll-mt-24 text-xl font-bold tracking-tight text-white">
          {block.text}
        </h2>
      );
    case "list":
      return (
        <ul className="ml-1 space-y-2">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-7 text-slate-300">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="ml-1 space-y-2">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-7 text-slate-300">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand">
                {i + 1}
              </span>
              <span>{it}</span>
            </li>
          ))}
        </ol>
      );
    case "code":
      return (
        <pre className="scrollbar-thin overflow-x-auto rounded-xl border border-edge bg-ink/80 p-4 text-[13px] leading-6 text-slate-200">
          <code>{block.code}</code>
        </pre>
      );
    case "math":
      return (
        <div className="rounded-xl border border-edge bg-panel2/60 px-4 py-3 text-center font-mono text-sm text-brand">
          {block.text}
        </div>
      );
    case "tip":
      return (
        <div className="flex gap-3 rounded-xl border border-good/30 bg-good/10 px-4 py-3">
          <Lightbulb className="mt-0.5 shrink-0 text-good" size={18} />
          <p className="text-sm leading-6 text-slate-200">{block.text}</p>
        </div>
      );
    case "warn":
      return (
        <div className="flex gap-3 rounded-xl border border-warn/30 bg-warn/10 px-4 py-3">
          <AlertTriangle className="mt-0.5 shrink-0 text-warn" size={18} />
          <p className="text-sm leading-6 text-slate-200">{block.text}</p>
        </div>
      );
    case "table":
      return (
        <div className="scrollbar-thin overflow-x-auto rounded-xl border border-edge">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-panel2/70">
                {block.headers.map((h, i) => (
                  <th key={i} className="px-4 py-2.5 font-semibold text-white">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-t border-edge/70">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2.5 align-top text-slate-300">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "kbd":
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {block.keys.map((k, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-edge bg-panel2/50 px-3 py-2"
            >
              <span className="text-sm text-slate-300">{k.action}</span>
              <kbd className="rounded-md border border-edge bg-ink px-2 py-1 font-mono text-xs text-brand">
                {k.combo}
              </kbd>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export default function GuideRenderer({ blocks }: { blocks: GuideBlock[] }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="space-y-5"
    >
      {blocks.map((block, i) => (
        <motion.div key={i} variants={fadeUp}>
          <Block block={block} />
        </motion.div>
      ))}
    </motion.div>
  );
}
