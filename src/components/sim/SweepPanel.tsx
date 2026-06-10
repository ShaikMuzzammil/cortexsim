"use client";

import { useRef, useState } from "react";
import { useSimStore } from "@/store/useSimStore";
import { SNN } from "@/lib/engine/snn";
import { drawLine } from "@/lib/draw/charts";
import type { SimConfig } from "@/types";

const SWEEP_PARAMS: { value: keyof SimConfig; label: string }[] = [
  { value: "excGain", label: "Excitatory gain" },
  { value: "inhGain", label: "Inhibitory gain" },
  { value: "inputDrive", label: "Input drive" },
  { value: "connectivity", label: "Connectivity" },
  { value: "noise", label: "Noise" },
];

// Batch experiment: vary one parameter and chart resulting population rate.
export default function SweepPanel() {
  const config = useSimStore((s) => s.config);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [param, setParam] = useState<keyof SimConfig>("excGain");
  const [from, setFrom] = useState(0.2);
  const [to, setTo] = useState(2.0);
  const [steps, setSteps] = useState(12);
  const [status, setStatus] = useState("Idle");
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setStatus("Running sweep...");
    const results: number[] = [];
    const warmup = 120;
    const measure = 200;
    for (let s = 0; s < steps; s++) {
      const val = from + ((to - from) * s) / Math.max(1, steps - 1);
      const cfg: SimConfig = { ...config, N: Math.min(config.N, 800) };
      (cfg as Record<string, number>)[param as string] = val;
      const net = new SNN(cfg);
      for (let t = 0; t < warmup; t++) net.advance();
      let spikes = 0;
      for (let t = 0; t < measure; t++) spikes += net.advance().length;
      const rate = (spikes / measure / cfg.N) * 1000;
      results.push(rate);
      setStatus("Step " + (s + 1) + " / " + steps);
      // yield to keep UI responsive
      await new Promise((r) => setTimeout(r, 0));
      if (canvasRef.current) drawLine(canvasRef.current, results, "#6ea8ff", true);
    }
    setStatus("Done - " + steps + " points");
    setRunning(false);
  };

  return (
    <div className="space-y-3">
      <select
        value={param as string}
        onChange={(e) => setParam(e.target.value as keyof SimConfig)}
        className="w-full rounded-lg border border-edge bg-panel2 px-3 py-2 text-sm text-white"
      >
        {SWEEP_PARAMS.map((p) => (
          <option key={p.value as string} value={p.value as string}>{p.label}</option>
        ))}
      </select>
      <div className="grid grid-cols-3 gap-2">
        <input type="number" value={from} step={0.1} onChange={(e) => setFrom(parseFloat(e.target.value))} className="rounded-lg border border-edge bg-panel2 px-2 py-1.5 text-sm text-white" placeholder="from" />
        <input type="number" value={to} step={0.1} onChange={(e) => setTo(parseFloat(e.target.value))} className="rounded-lg border border-edge bg-panel2 px-2 py-1.5 text-sm text-white" placeholder="to" />
        <input type="number" value={steps} step={1} onChange={(e) => setSteps(parseInt(e.target.value, 10) || 1)} className="rounded-lg border border-edge bg-panel2 px-2 py-1.5 text-sm text-white" placeholder="steps" />
      </div>
      <button type="button" onClick={run} disabled={running} className="btn-primary w-full disabled:opacity-50">
        {running ? "Running..." : "Run sweep"}
      </button>
      <canvas ref={canvasRef} className="h-28 w-full rounded-lg border border-edge" />
      <p className="text-xs text-slate-400">{status}</p>
    </div>
  );
}
