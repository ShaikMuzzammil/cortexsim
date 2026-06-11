"use client";

import { useEffect, useState, type RefObject } from "react";
import { Activity, Gauge, Zap, Cpu } from "lucide-react";
import { useSimStore } from "@/store/useSimStore";
import type { SNN } from "@/lib/engine/snn";

const STEPS_PER_FRAME = 2;

interface Stat {
  label: string;
  value: string;
  hint: string;
  color: string;
}

export default function PerformancePanel({
  engineRef,
}: {
  engineRef: RefObject<SNN | null>;
}) {
  const metrics = useSimStore((s) => s.metrics);
  const dt = useSimStore((s) => s.config.dt);
  const [synapses, setSynapses] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      const eng = engineRef.current;
      if (!eng || !eng.conn) return;
      let total = 0;
      for (const t of eng.conn.targets) total += t.length;
      setSynapses(total);
    }, 600);
    return () => clearInterval(id);
  }, [engineRef]);

  const rtFactor = (metrics.fps * STEPS_PER_FRAME * dt) / 1000;
  const stepsPerSec = metrics.fps * STEPS_PER_FRAME;
  const synPerSec = synapses * stepsPerSec;

  const stats: Stat[] = [
    {
      label: "Render FPS",
      value: metrics.fps.toFixed(0),
      hint: "frames / sec",
      color: "text-good",
    },
    {
      label: "Real-time factor",
      value: rtFactor.toFixed(2) + "x",
      hint: "sim sec / wall sec",
      color: "text-brand",
    },
    {
      label: "Steps / sec",
      value: Math.round(stepsPerSec).toLocaleString(),
      hint: dt + " ms each",
      color: "text-inh",
    },
    {
      label: "Synaptic ops/s",
      value: formatBig(synPerSec),
      hint: synapses.toLocaleString() + " synapses",
      color: "text-warn",
    },
  ];

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-bold">
        <Gauge size={15} className="text-brand" /> Performance
      </div>
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-edge bg-ink/50 p-2.5">
            <div className="text-[10px] uppercase tracking-wide text-slate-500">
              {s.label}
            </div>
            <div className={"metric-num text-lg font-bold " + s.color}>
              {s.value}
            </div>
            <div className="text-[10px] text-slate-600">{s.hint}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-1.5 text-xs text-slate-400">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Activity size={12} className="text-exc" /> Mean rate
          </span>
          <span className="font-semibold text-slate-200">
            {metrics.rate.toFixed(1)} Hz
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Zap size={12} className="text-warn" /> Total spikes
          </span>
          <span className="font-semibold text-slate-200">
            {metrics.spikes.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Cpu size={12} className="text-inh" /> Sim time
          </span>
          <span className="font-semibold text-slate-200">
            {(metrics.timeMs * dt).toFixed(0)} ms
          </span>
        </div>
      </div>
    </div>
  );
}

function formatBig(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toFixed(0);
}
