import { useSim } from "../../store/useSim";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wide text-white/40">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-lg font-bold text-cyan-200">
        {value}
      </div>
    </div>
  );
}

export default function Metrics() {
  const m = useSim((s) => s.metrics);
  return (
    <div className="grid grid-cols-3 gap-2.5">
      <Stat label="Time" value={`${(m.timeMs / 1000).toFixed(1)}s`} />
      <Stat label="Rate" value={`${m.rateHz.toFixed(1)} Hz`} />
      <Stat label="Active" value={`${m.active}`} />
      <Stat label="Synchrony" value={m.synchrony.toFixed(2)} />
      <Stat label="Spikes" value={m.totalSpikes.toLocaleString()} />
      <Stat label="Synapses" value={m.synapses.toLocaleString()} />
    </div>
  );
}
