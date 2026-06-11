"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { STUDIO_ACTIVITIES } from "@/lib/studio/registry";

export interface Command {
  id: string;
  label: string;
  hint?: string;
  group: string;
  run: () => void;
}

export default function CommandPalette({
  onSelect,
  commands,
}: {
  onSelect: (slug: string) => void;
  commands: Command[];
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Open on Cmd/Ctrl+K.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((o) => !o);
        setQ("");
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  const items = useMemo(() => {
    const query = q.trim().toLowerCase();
    const acts = STUDIO_ACTIVITIES.map<Command>((a) => ({
      id: "go:" + a.slug,
      label: a.title,
      hint: a.group,
      group: "Activities",
      run: () => onSelect(a.slug),
    }));
    const all: Command[] = [...commands, ...acts];
    if (!query) return all.slice(0, 50);
    return all
      .filter((c) =>
        (c.label + " " + (c.hint || "") + " " + c.group).toLowerCase().includes(query),
      )
      .slice(0, 50);
  }, [q, commands, onSelect]);

  useEffect(() => {
    setCursor(0);
  }, [q, open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={fadeInit}
        animate={fadeShow}
        exit={fadeInit}
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      >
        <motion.div
          key="panel"
          initial={panelInit}
          animate={panelShow}
          exit={panelInit}
          className="mt-24 w-[600px] max-w-[92vw] overflow-hidden rounded-xl border border-edge bg-panel shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCursor((c) => Math.min(items.length - 1, c + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setCursor((c) => Math.max(0, c - 1));
              } else if (e.key === "Enter") {
                const it = items[cursor];
                if (it) {
                  it.run();
                  setOpen(false);
                }
              }
            }}
            placeholder="Jump to activity or run a command\u2026"
            className="w-full border-b border-edge bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
          />
          <ul className="max-h-[60vh] overflow-y-auto py-1">
            {items.map((it, i) => {
              const active = i === cursor;
              return (
                <li
                  key={it.id}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => {
                    it.run();
                    setOpen(false);
                  }}
                  className={
                    "flex cursor-pointer items-center justify-between px-4 py-2 text-sm " +
                    (active ? "bg-brand/10 text-white" : "text-slate-300 hover:bg-panel2")
                  }
                >
                  <span className="flex items-center gap-3">
                    <span className="min-w-[80px] text-[10px] uppercase tracking-wider text-slate-500">
                      {it.group}
                    </span>
                    <span>{it.label}</span>
                  </span>
                  {it.hint && <span className="text-[11px] text-slate-500">{it.hint}</span>}
                </li>
              );
            })}
            {items.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-slate-500">No matches</li>
            )}
          </ul>
          <div className="flex items-center justify-between border-t border-edge bg-panel2/40 px-3 py-1.5 text-[10px] text-slate-500">
            <span>{items.length} results</span>
            <span>\u2191 \u2193 to navigate \u00b7 Enter to run \u00b7 Esc to close</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const fadeInit = { opacity: 0 };
const fadeShow = { opacity: 1 };
const panelInit = { opacity: 0, y: -10 };
const panelShow = { opacity: 1, y: 0 };
