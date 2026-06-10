"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import type { GlossaryTerm } from "@/content/types";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

export default function GlossaryList({ terms }: { terms: GlossaryTerm[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q),
    );
  }, [query, terms]);

  return (
    <div>
      <div className="relative mb-6 max-w-md">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms..."
          className="w-full rounded-xl border border-edge bg-panel/70 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-brand/60"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500">No terms match &quot;{query}&quot;.</p>
      ) : (
        <motion.dl
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-4 md:grid-cols-2"
        >
          {filtered.map((t) => (
            <motion.div
              key={t.term}
              variants={fadeUp}
              className="rounded-2xl border border-edge bg-panel/70 p-5"
            >
              <dt className="font-bold text-white">{t.term}</dt>
              <dd className="mt-1.5 text-sm leading-6 text-slate-400">{t.definition}</dd>
              {t.related && t.related.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.related.map((r) => (
                    <span
                      key={r}
                      className="rounded-md bg-panel2/70 px-2 py-0.5 text-[11px] text-slate-400"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              ) : null}
            </motion.div>
          ))}
        </motion.dl>
      )}
    </div>
  );
}
