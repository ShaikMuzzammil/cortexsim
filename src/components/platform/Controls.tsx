import { useSim } from "../../store/useSim";
import { PRESETS } from "../../lib/snn/presets";
import type { ModelType } from "../../lib/snn/types";

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="font-semibold tabular-nums text-white/90">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
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
  const probe = useSim((s) => s.probe);
  const setConfig = useSim((s) => s.setConfig);
  const applyPreset = useSim((s) => s.applyPreset);
  const toggleRunning = useSim((s) => s.toggleRunning);
  const reset = useSim((s) => s.reset);
  const stepOnce = useSim((s) => s.stepOnce);
  const injectStimulus = useSim((s) => s.injectStimulus);
  const setProbe = useSim((s) => s.setProbe);

  return (
    <div className="glass flex flex-col gap-5 rounded-2xl p-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={toggleRunning}
          className="glow-btn col-span-2 rounded-xl py-2.5 text-sm"
        >
          {running ? "❚❚ Pause" : "▶ Play"}
        </button>
        <button
          onClick={stepOnce}
          className="hot glass rounded-xl py-2 text-sm text-white/80 hover:text-white"
        >
          ⏭ Step
        </button>
        <button
          onClick={reset}
          className="hot glass rounded-xl py-2 text-sm text-white/80 hover:text-white"
        >
          ↺ Reset
        </button>
        <button
          onClick={injectStimulus}
          className="hot col-span-2 rounded-xl border border-brand-cyan/40 bg-brand-cyan/10 py-2 text-sm font-medium text-brand-cyan hover:bg-brand-cyan/20"
        >
          ⚡ Inject stimulus pulse
        </button>
      </div>

      <div>
        <div className="mb-2 text-[10px] uppercase tracking-wider text-white/45">
          Regime presets
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              title={p.blurb}
              onClick={() => applyPreset(p.config)}
              className="hot rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/75 hover:border-brand-cyan/50 hover:text-white"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        <Slider
          label="Neurons"
          value={config.N}
          min={100}
          max={2000}
          step={100}
          display={String(config.N)}
          onChange={(v) => setConfig({ N: v })}
        />
        <Slider
          label="Excitatory fraction"
          value={config.pe}
          min={0.5}
          max={0.95}
          step={0.05}
          display={`${Math.round(config.pe * 100)}%`}
          onChange={(v) => setConfig({ pe: v })}
        />
        <Slider
          label="Connectivity"
          value={config.conn}
          min={0.02}
          max={0.3}
          step={0.01}
          display={`${Math.round(config.conn * 100)}%`}
          onChange={(v) => setConfig({ conn: v })}
        />
        <Slider
          label="Excitatory gain"
          value={config.ge}
          min={0.1}
          max={1.5}
          step={0.05}
          display={config.ge.toFixed(2)}
          onChange={(v) => setConfig({ ge: v })}
        />
        <Slider
          label="Inhibitory gain"
          value={config.gi}
          min={0.1}
          max={2.5}
          step={0.05}
          display={config.gi.toFixed(2)}
          onChange={(v) => setConfig({ gi: v })}
        />
        <Slider
          label="Input drive"
          value={config.drive}
          min={0}
          max={2.5}
          step={0.1}
          display={config.drive.toFixed(1)}
          onChange={(v) => setConfig({ drive: v })}
        />
        <Slider
          label="Speed"
          value={config.speed}
          min={1}
          max={10}
          step={1}
          display={`${config.speed}x`}
          onChange={(v) => setConfig({ speed: v })}
        />
        <Slider
          label="Probe neuron"
          value={Math.min(probe, config.N - 1)}
          min={0}
          max={config.N - 1}
          step={1}
          display={`#${probe}`}
          onChange={(v) => setProbe(v)}
        />
      </div>

      <label className="block">
        <div className="mb-1 text-xs text-white/60">Excitatory cell model</div>
        <select
          value={config.model}
          onChange={(e) => setConfig({ model: e.target.value as ModelType })}
          className="hot w-full rounded-xl border border-white/10 bg-panel px-3 py-2 text-sm text-white/90 outline-none focus:border-brand-cyan/60"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id} className="bg-panel">
              {m.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
