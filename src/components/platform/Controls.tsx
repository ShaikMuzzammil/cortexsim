import { useSim } from "../../store/useSim";
import { PRESETS } from "../../lib/snn/presets";
import type { ModelType } from "../../lib/snn/types";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: SliderProps) {
  return (
    <label className="block">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="font-mono text-cyan-200">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        className="mt-1.5 w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );
}

const MODELS: { id: ModelType; label: string }[] = [
  { id: "rs", label: "Regular spiking" },
  { id: "ib", label: "Intrinsically bursting" },
  { id: "ch", label: "Chattering" },
  { id: "fs", label: "Fast spiking" },
];

export default function Controls() {
  const config = useSim((s) => s.config);
  const running = useSim((s) => s.running);
  const setConfig = useSim((s) => s.setConfig);
  const applyPreset = useSim((s) => s.applyPreset);
  const toggleRunning = useSim((s) => s.toggleRunning);
  const reset = useSim((s) => s.reset);

  return (
    <div className="glass flex flex-col gap-4 rounded-2xl p-4">
      <div className="flex gap-2">
        <button
          onClick={toggleRunning}
          className="glow-btn flex-1 rounded-xl px-3 py-2 text-sm"
        >
          {running ? "❚❚ Pause" : "▶ Play"}
        </button>
        <button
          onClick={reset}
          className="hot glass rounded-xl px-3 py-2 text-sm text-white/80 hover:text-white"
        >
          ↺ Reset
        </button>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">
          Regime presets
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              title={p.description}
              onClick={() => applyPreset(p.config)}
              className="hot rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/75 transition-colors hover:border-cyan-300/50 hover:text-white"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Slider
          label="Neurons"
          value={config.N}
          min={200}
          max={2000}
          step={100}
          onChange={(v) => setConfig({ N: v })}
        />
        <Slider
          label="Excitatory fraction"
          value={config.pe}
          min={0.5}
          max={0.95}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => setConfig({ pe: v })}
        />
        <Slider
          label="Connectivity"
          value={config.conn}
          min={0.02}
          max={0.25}
          step={0.01}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => setConfig({ conn: v })}
        />
        <Slider
          label="Excitatory gain"
          value={config.ge}
          min={0.1}
          max={1.5}
          step={0.05}
          format={(v) => v.toFixed(2)}
          onChange={(v) => setConfig({ ge: v })}
        />
        <Slider
          label="Inhibitory gain"
          value={config.gi}
          min={0.2}
          max={2.5}
          step={0.05}
          format={(v) => v.toFixed(2)}
          onChange={(v) => setConfig({ gi: v })}
        />
        <Slider
          label="Input drive"
          value={config.drive}
          min={0.1}
          max={2.5}
          step={0.05}
          format={(v) => v.toFixed(2)}
          onChange={(v) => setConfig({ drive: v })}
        />
        <Slider
          label="Speed"
          value={config.speed}
          min={1}
          max={10}
          step={1}
          format={(v) => `${v}x`}
          onChange={(v) => setConfig({ speed: v })}
        />
      </div>

      <label className="block">
        <div className="mb-1 text-xs text-white/60">Excitatory cell model</div>
        <select
          value={config.model}
          onChange={(e) => setConfig({ model: e.target.value as ModelType })}
          className="hot w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-white outline-none"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id} className="bg-ink">
              {m.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
