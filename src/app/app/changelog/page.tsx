"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client/api";

interface Entry { version: string; date: string; tags: string[]; items: string[]; }
const TAG_COLORS: Record<string, string> = { feature: "#6ea8ff", backend: "#36d399", auth: "#fbbd23", studio: "#5db1ff", refresh: "#a78bfa", launch: "#ff5d73" };

export default function ChangelogPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  useEffect(() => {
    api<{ entries: Entry[] }>("/api/changelog").then((r) => setEntries(r.entries)).catch(() => setEntries([]));
  }, []);
  return (
    <div className="space-y-5">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Product</div>
        <h1 className="text-2xl font-semibold text-white mt-1">Changelog</h1>
        <p className="text-sm text-slate-400">What's new in CortexSim.</p>
      </div>
      <ol className="relative border-l border-[#1d2742] pl-5 space-y-6">
        {entries.map((e) => (
          <li key={e.version}>
            <span className="absolute -left-[7px] mt-1.5 w-3 h-3 rounded-full bg-[#6ea8ff] border-2 border-[#05070e]"/>
            <div className="flex items-baseline gap-3 flex-wrap">
              <div className="text-lg font-semibold text-white">v{e.version}</div>
              <div className="text-[11px] text-slate-500">{e.date}</div>
              <div className="flex gap-1">
                {e.tags.map((t) => {
                  const style: React.CSSProperties = { background: (TAG_COLORS[t] || "#6ea8ff") + "22", color: TAG_COLORS[t] || "#6ea8ff" };
                  return <span key={t} className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={style}>{t}</span>;
                })}
              </div>
            </div>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-slate-300">
              {e.items.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
