"use client";

import { useEngine } from "./EngineProvider";

function fmt(n: number, d = 1): string {
  if (!isFinite(n)) return "\u2014";
  return n.toFixed(d);
}

export default function EngineBar() {
  const { snapshot, config, updateConfig, toggleRunning, resetEngine, stepOnce, injectPulse } = useEngine();

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-edge bg-panel/70 px-3 py-2">
      {/* Transport */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleRunning}
          className={
            "rounded-md border px-2.5 py-1 text-xs font-semibold " +
            (snapshot.running
              ? "border-good/40 bg-good/10 text-good"
              : "border-edge bg-panel2 text-slate-200 hover:border-brand")
          }
          title="Play / Pause (Space)"
        >
          {snapshot.running ? "\u25A0 Pause" : "\u25B6 Play"}
        </button>
        <button
          onClick={stepOnce}
          className="rounded-md border border-edge bg-panel2 px-2.5 py-1 text-xs text-slate-200 hover:border-brand"
          title="Step one dt (])"
        >
          Step
        </button>
        <button
          onClick={injectPulse}
          className="rounded-md border border-edge bg-panel2 px-2.5 py-1 text-xs text-slate-200 hover:border-warn"
          title="Inject current pulse (I)"
        >
          Pulse
        </button>
        <button
          onClick={resetEngine}
          className="rounded-md border border-edge bg-panel2 px-2.5 py-1 text-xs text-slate-200 hover:border-exc"
          title="Rebuild network (R)"
        >
          Reset
        </button>
      </div>

      <div className="h-5 w-px bg-edge" />

      {/* Live metrics */}
      <div className="flex items-center gap-3 text-[11px] tabular-nums text-slate-300">
        <span><span className="text-slate-500">t </span>{fmt(snapshot.tMs / 1000, 2)}s</span>
        <span><span className="text-slate-500">fps </span>{fmt(snapshot.fps, 0)}</span>
        <span><span className="text-slate-500">rtf </span>{fmt(snapshot.rtFactor, 2)}\u00d7</span>
        <span><span className="text-slate-500">spikes </span>{snapshot.totalSpikes}</span>
      </div>

      <div className="h-5 w-px bg-edge" />

      {/* Parameter sliders \u2014 these actually drive the SNN. */}
      <Slider
        label="N"
        value={config.N}
        min={200}
        max={2000}
        step={100}
        unit=""
        onChange={(v) => updateConfig({ N: v })}
      />
      <Slider
        label="drive"
        value={config.inputDrive}
        min={0}
        max={12}
        step={0.1}
        unit=""
        onChange={(v) => updateConfig({ inputDrive: v })}
      />
      <Slider
        label="E gain"
        value={config.excGain}
        min={0}
        max={2.5}
        step={0.05}
        unit=""
        onChange={(v) => updateConfig({ excGain: v })}
      />
      <Slider
        label="I gain"
        value={config.inhGain}
        min={0}
        max={3}
        step={0.05}
        unit=""
        onChange={(v) => updateConfig({ inhGain: v })}
      />
      <Slider
        label="noise"
        value={config.noise}
        min={0}
        max={3}
        step={0.05}
        unit=""
        onChange={(v) => updateConfig({ noise: v })}
      />
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[11px] text-slate-400">
      <span className="min-w-[40px]">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-24 accent-[#6ea8ff]"
      />
      <span className="min-w-[40px] text-right tabular-nums text-slate-300">
        {value.toFixed(step < 1 ? 2 : 0)}
        {unit}
      </span>
    </label>
  );
}
