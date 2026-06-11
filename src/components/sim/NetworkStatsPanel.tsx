"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Share2 } from "lucide-react";
import { drawHistogram } from "@/lib/draw/charts";
import { degreeHistogram } from "@/lib/dsp/metrics";
import type { SNN } from "@/lib/engine/snn";

const TOPO_LABEL: Record<string, string> = {
  random: "Random (Erdos-Renyi)",
  smallworld: "Small-world",
  scalefree: "Scale-free",
  grid: "2D grid lattice",
};

interface Stats {
  N: number;
  exc: number;
  inh: number;
  synapses: number;
  meanDeg: number;
  maxDeg: number;
  topology: string;
}

export default function NetworkStatsPanel({
  engineRef,
}: {
  engineRef: RefObject<SNN | null>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const sample = () => {
      const eng = engineRef.current;
      if (!eng || !eng.conn) return;
      const degrees: number[] = [];
      let total = 0;
      let maxDeg = 0;
      for (const t of eng.conn.targets) {
        const d = t.length;
        degrees.push(d);
        total += d;
        if (d > maxDeg) maxDeg = d;
      }
      const N = eng.N;
      setStats({
        N,
        exc: eng.nExc,
        inh: N - eng.nExc,
        synapses: total,
        meanDeg: total / Math.max(1, N),
        maxDeg,
        topology: eng.cfg.topology,
      });
      if (canvas.current) {
        drawHistogram(canvas.current, degreeHistogram(degrees, 22), "#6ea8ff");
      }
    };
    sample();
    const id = setInterval(sample, 800);
    return () => clearInterval(id);
  }, [engineRef]);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-bold">
        <Share2 size={15} className="text-inh" /> Network analysis
      </div>
      {stats ? (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <Row label="Topology" value={TOPO_LABEL[stats.topology] || stats.topology} wide />
            <Row label="Neurons" value={stats.N.toLocaleString()} />
            <Row label="Synapses" value={stats.synapses.toLocaleString()} />
            <Row label="Excitatory" value={stats.exc.toLocaleString()} />
            <Row label="Inhibitory" value={stats.inh.toLocaleString()} />
            <Row label="Mean degree" value={stats.meanDeg.toFixed(1)} />
            <Row label="Max degree" value={stats.maxDeg.toLocaleString()} />
          </div>
          <div className="mt-3">
            <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-500">
              Out-degree distribution
            </div>
            <div className="h-24 overflow-hidden rounded-lg border border-edge">
              <canvas ref={canvas} className="h-full w-full" />
            </div>
          </div>
        </>
      ) : (
        <p className="text-xs text-slate-500">Building network...</p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2 flex justify-between" : "flex justify-between"}>
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-200">{value}</span>
    </div>
  );
}
