import { useSim } from "../../store/useSim";

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="glass rounded-xl px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-white/45">
        {label}
      </div>
      <div
        className={`mt-0.5 text-lg font-bold tabular-nums ${accent ?? "text-white"}`}
      >
        {value}
      </div>
    </div>
  );
}

export default function Metrics() {
  const m = useSim((s) => s.metrics);
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Stat label="Time" value={`${(m.timeMs / 1000).toFixed(1)}s`} />
      <Stat
        label="Rate"
        value={`${m.rateHz.toFixed(1)} Hz`}
        accent="text-brand-cyan"
      />
      <Stat
        label="Exc rate"
        value={`${m.rateExc.toFixed(1)}`}
        accent="text-amber-300"
      />
      <Stat
        label="Inh rate"
        value={`${m.rateInh.toFixed(1)}`}
        accent="text-brand-pink"
      />
      <Stat label="Active" value={String(m.active)} />
      <Stat
        label="Synchrony"
        value={m.synchrony.toFixed(2)}
        accent="text-brand-violet"
      />
      <Stat
        label="Dom freq"
        value={`${m.domHz.toFixed(0)} Hz`}
        accent="text-emerald-300"
      />
      <Stat label="FPS" value={String(Math.round(m.fps))} />
    </div>
  );
}
