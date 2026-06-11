"use client";

import { useEngine } from "./EngineProvider";

function fmt(n: number, d = 1): string {
  if (!isFinite(n)) return "\u2014";
  return n.toFixed(d);
}

export default function StatusBar({ activeSlug }: { activeSlug?: string }) {
  const { snapshot, config } = useEngine();
  const rtClass = snapshot.rtFactor >= 1 ? "text-good" : snapshot.rtFactor >= 0.5 ? "text-warn" : "text-exc";
  return (
    <div className="flex shrink-0 items-center justify-between border-t border-edge bg-panel/80 px-3 py-1.5 font-mono text-[11px] text-slate-400">
      <div className="flex items-center gap-4">
        <span>
          <span className="text-slate-500">status </span>
          <span className={snapshot.running ? "text-good" : "text-warn"}>
            {snapshot.running ? "\u25CF running" : "\u25A0 paused"}
          </span>
        </span>
        <span>
          <span className="text-slate-500">t </span>
          <span className="text-slate-200">{fmt(snapshot.tMs / 1000, 2)}s</span>
        </span>
        <span>
          <span className="text-slate-500">N </span>
          <span className="text-slate-200">{snapshot.N}</span>
        </span>
        <span>
          <span className="text-slate-500">rate </span>
          <span className="text-slate-200">{fmt(snapshot.totalRate, 1)} Hz</span>
          <span className="text-slate-500"> (E {fmt(snapshot.eRate, 1)} / I {fmt(snapshot.iRate, 1)})</span>
        </span>
        <span>
          <span className="text-slate-500">spikes </span>
          <span className="text-slate-200">{snapshot.totalSpikes}</span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>
          <span className="text-slate-500">rtf </span>
          <span className={rtClass}>{fmt(snapshot.rtFactor, 2)}\u00d7</span>
        </span>
        <span>
          <span className="text-slate-500">fps </span>
          <span className="text-slate-200">{fmt(snapshot.fps, 0)}</span>
        </span>
        <span>
          <span className="text-slate-500">dt </span>
          <span className="text-slate-200">{fmt(config.dt, 2)}ms</span>
        </span>
        <span>
          <span className="text-slate-500">topo </span>
          <span className="text-slate-200">{config.topology}</span>
        </span>
        {activeSlug && (
          <span>
            <span className="text-slate-500">view </span>
            <span className="text-brand">{activeSlug}</span>
          </span>
        )}
      </div>
    </div>
  );
}
