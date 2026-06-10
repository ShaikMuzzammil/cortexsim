"use client";

import { useSimStore } from "@/store/useSimStore";
import Slider from "@/components/ui/Slider";
import Select from "@/components/ui/Select";
import Toggle from "@/components/ui/Toggle";
import { MODEL_LABELS } from "@/lib/engine/models";
import type { Integrator, ModelName, TopologyName } from "@/types";

const MODEL_OPTS = (Object.keys(MODEL_LABELS) as ModelName[]).map((k) => ({
  value: k,
  label: MODEL_LABELS[k],
}));

const TOPO_OPTS: { value: TopologyName; label: string }[] = [
  { value: "random", label: "Random" },
  { value: "smallworld", label: "Small-world" },
  { value: "scalefree", label: "Scale-free" },
  { value: "grid", label: "Grid lattice" },
];

const INT_OPTS: { value: Integrator; label: string }[] = [
  { value: "euler", label: "Euler (fast)" },
  { value: "rk4", label: "Runge-Kutta 4" },
];

export default function ControlPanel({
  onStructuralChange,
}: {
  onStructuralChange: () => void;
}) {
  const config = useSimStore((s) => s.config);
  const setConfig = useSimStore((s) => s.setConfig);

  const set = (patch: Partial<typeof config>) => setConfig(patch);
  const setStructural = (patch: Partial<typeof config>) => {
    setConfig(patch);
    onStructuralChange();
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="label mb-2">Network</h3>
        <div className="space-y-3">
          <Slider label="Neurons (N)" value={config.N} min={100} max={8000} step={100} digits={0} onChange={(v) => setStructural({ N: v })} />
          <Slider label="Excitatory fraction" value={config.excFraction} min={0.1} max={0.95} step={0.05} onChange={(v) => setStructural({ excFraction: v })} />
          <Slider label="Connectivity" value={config.connectivity} min={0.02} max={0.4} step={0.01} onChange={(v) => setStructural({ connectivity: v })} />
        </div>
      </div>

      <div>
        <h3 className="label mb-2">Dynamics</h3>
        <div className="space-y-3">
          <Slider label="Excitatory gain" value={config.excGain} min={0} max={3} step={0.05} onChange={(v) => set({ excGain: v })} />
          <Slider label="Inhibitory gain" value={config.inhGain} min={0} max={3} step={0.05} onChange={(v) => set({ inhGain: v })} />
          <Slider label="Input drive" value={config.inputDrive} min={0} max={10} step={0.1} onChange={(v) => set({ inputDrive: v })} />
          <Slider label="Synaptic tau" value={config.tauSyn} min={1} max={20} step={0.5} unit="ms" onChange={(v) => set({ tauSyn: v })} />
          <Slider label="Noise" value={config.noise} min={0} max={4} step={0.1} onChange={(v) => set({ noise: v })} />
        </div>
      </div>

      <div>
        <h3 className="label mb-2">Models &amp; wiring</h3>
        <div className="space-y-3">
          <Select label="Excitatory model" value={config.excModel} options={MODEL_OPTS} onChange={(v) => setStructural({ excModel: v })} />
          <Select label="Inhibitory model" value={config.inhModel} options={MODEL_OPTS} onChange={(v) => setStructural({ inhModel: v })} />
          <Select label="Topology" value={config.topology} options={TOPO_OPTS} onChange={(v) => setStructural({ topology: v })} />
          <Select label="Integrator" value={config.integrator} options={INT_OPTS} onChange={(v) => set({ integrator: v })} />
        </div>
      </div>

      <div>
        <h3 className="label mb-2">Plasticity &amp; delays</h3>
        <div className="space-y-2">
          <Toggle label="STDP plasticity" checked={config.stdp} onChange={(v) => set({ stdp: v })} />
          <Toggle label="Axonal delays" checked={config.delaysEnabled} onChange={(v) => setStructural({ delaysEnabled: v })} />
          {config.delaysEnabled ? (
            <Slider label="Max delay (steps)" value={config.maxDelay} min={1} max={20} step={1} digits={0} onChange={(v) => setStructural({ maxDelay: v })} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
