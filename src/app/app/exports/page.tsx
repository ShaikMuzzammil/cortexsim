"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/app/AppShell";
import {
  formatsByGroup,
  triggerDownload,
  EXPORT_FORMATS,
  type ExportContext,
  type ExportFormat,
} from "@/lib/export/formats";

// Build a deterministic demo run so every export format produces a real,
// downloadable file even before you have wired in live studio state.
function demoContext(neurons: number, steps: number, density: number): ExportContext {
  const spikes: Array<{ t: number; i: number }> = [];
  let seed = 1337;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let t = 0; t < steps; t++) {
    const wave = 0.5 + 0.5 * Math.sin((t / steps) * Math.PI * 8);
    for (let i = 0; i < neurons; i++) {
      if (rand() < density * wave) spikes.push({ t, i });
    }
  }
  return {
    name: "demo-run",
    notes: "Synthetic demonstration run generated in the Export Center.",
    spikes,
    cfg: {
      neurons,
      steps,
      density,
      drive: 0.55,
      inhibition: 0.8,
      topology: "small-world",
      plasticity: true,
      seed: 1337,
    } as any,
    metrics: {
      spikeCount: spikes.length,
      meanRate: +(spikes.length / neurons / steps).toFixed(4),
      synchrony: 0.31,
      dominantHz: 42,
      entropyBits: 6.2,
    } as any,
  };
}

export default function ExportCenterPage() {
  const [neurons, setNeurons] = useState(200);
  const [steps, setSteps] = useState(400);
  const [density, setDensity] = useState(0.04);
  const [last, setLast] = useState<string | null>(null);

  const ctx = useMemo(() => demoContext(neurons, steps, density), [neurons, steps, density]);
  const groups = useMemo(() => formatsByGroup(), []);

  function run(fmt: ExportFormat) {
    const artifact = fmt.build(ctx);
    triggerDownload(artifact);
    setLast(artifact.filename);
  }

  function exportAll() {
    EXPORT_FORMATS.forEach((f, k) => {
      setTimeout(() => run(f), k * 250);
    });
  }

  return (
    <AppShell title="Export Center">
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Export Center</h1>
            <p className="mt-1 text-sm text-slate-400">
              {EXPORT_FORMATS.length} formats across {groups.length} groups. Tune the demo run, then export to any tool.
            </p>
          </div>
          <button onClick={exportAll} className="btn-primary">Export all {EXPORT_FORMATS.length}</button>
        </header>

        <section className="panel panel-pad">
          <div className="grid gap-5 sm:grid-cols-3">
            <label className="text-sm">
              <span className="text-slate-300">Neurons: {neurons}</span>
              <input type="range" min={50} max={600} step={10} value={neurons}
                onChange={(e) => setNeurons(Number(e.target.value))} className="mt-2 w-full" />
            </label>
            <label className="text-sm">
              <span className="text-slate-300">Steps: {steps}</span>
              <input type="range" min={100} max={1200} step={50} value={steps}
                onChange={(e) => setSteps(Number(e.target.value))} className="mt-2 w-full" />
            </label>
            <label className="text-sm">
              <span className="text-slate-300">Density: {density.toFixed(3)}</span>
              <input type="range" min={0.005} max={0.12} step={0.005} value={density}
                onChange={(e) => setDensity(Number(e.target.value))} className="mt-2 w-full" />
            </label>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Demo run: {ctx.spikes.length.toLocaleString()} spikes &middot; mean rate {String((ctx.metrics as any).meanRate)} &middot; seed 1337
          </p>
        </section>

        {groups.map((g) => (
          <section key={g.group} className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">{g.group}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((f) => (
                <button key={f.id} onClick={() => run(f)}
                  className="panel panel-pad text-left transition hover:border-brand">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{f.label}</span>
                    <span className="rounded-full border border-edge px-2 py-0.5 text-[10px] uppercase text-slate-400">.{f.ext}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{f.description}</p>
                </button>
              ))}
            </div>
          </section>
        ))}

        {last ? (
          <div className="fixed bottom-6 right-6 rounded-xl border border-edge bg-panel2 px-4 py-2 text-sm text-slate-200 shadow-card">
            Downloaded <span className="font-semibold text-white">{last}</span>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
