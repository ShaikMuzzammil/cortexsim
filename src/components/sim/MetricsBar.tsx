"use client";

import { useSimStore } from "@/store/useSimStore";
import { fmt } from "@/lib/utils";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-[78px] flex-col rounded-xl border border-edge bg-panel2/60 px-3 py-2">
      <span className="text-[10px] uppercase tracking-wider text-slate-400">{label}</span>
      <span className="font-mono text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

export default function MetricsBar() {
  const m = useSimStore((s) => s.metrics);
  return (
    <div className="flex flex-wrap gap-2">
      <Metric label="Pop rate" value={fmt(m.rate, 1) + " Hz"} />
      <Metric label="Exc" value={fmt(m.excRate, 1)} />
      <Metric label="Inh" value={fmt(m.inhRate, 1)} />
      <Metric label="Active" value={fmt(m.activePct, 1) + "%"} />
      <Metric label="Synchrony" value={fmt(m.synchrony, 2)} />
      <Metric label="Dom freq" value={fmt(m.dominantHz, 1) + " Hz"} />
      <Metric label="LFP" value={fmt(m.lfp, 2)} />
      <Metric label="Entropy" value={fmt(m.entropy, 2)} />
      <Metric label="Spikes" value={String(m.spikes)} />
      <Metric label="FPS" value={fmt(m.fps, 0)} />
    </div>
  );
}
