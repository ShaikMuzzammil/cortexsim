"use client";

import { useState } from "react";
import { useSimStore } from "@/store/useSimStore";
import { compileFormula } from "@/lib/export/exporters";
import { fmt } from "@/lib/utils";

// Custom metric calculator: evaluate user expressions over live metrics.
export default function CalculatorPanel() {
  const metrics = useSimStore((s) => s.metrics);
  const [expr, setExpr] = useState("excRate / (inhRate + 1)");
  const [result, setResult] = useState<number>(NaN);
  const [label, setLabel] = useState("E/I ratio");

  const run = () => {
    const fn = compileFormula(expr);
    const scope: Record<string, number> = {
      rate: metrics.rate,
      excRate: metrics.excRate,
      inhRate: metrics.inhRate,
      active: metrics.activePct,
      sync: metrics.synchrony,
      dom: metrics.dominantHz,
      lfp: metrics.lfp,
      entropy: metrics.entropy,
      spikes: metrics.spikes,
    };
    setResult(fn(scope));
  };

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="label">Metric name</span>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="mt-1 w-full rounded-lg border border-edge bg-panel2 px-3 py-2 text-sm text-white outline-none focus:border-brand"
        />
      </label>
      <label className="block">
        <span className="label">Expression</span>
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          className="mt-1 w-full rounded-lg border border-edge bg-panel2 px-3 py-2 font-mono text-xs text-white outline-none focus:border-brand"
        />
      </label>
      <button type="button" onClick={run} className="btn-primary w-full">Compute</button>
      <div className="rounded-lg border border-edge bg-panel2/60 px-3 py-3 text-center">
        <div className="label">{label}</div>
        <div className="metric-num">{isNaN(result) ? "-" : fmt(result, 3)}</div>
      </div>
      <p className="text-[11px] text-slate-500">Available: rate, excRate, inhRate, active, sync, dom, lfp, entropy, spikes.</p>
    </div>
  );
}
