import { create } from "zustand";
import { DEFAULT_CONFIG, type Metrics, type SimConfig } from "../lib/snn/types";

interface SimState {
  config: SimConfig;
  running: boolean;
  metrics: Metrics;
  /** bumped to force the engine to rebuild from current config */
  rebuildToken: number;
  launched: boolean;

  setConfig: (patch: Partial<SimConfig>) => void;
  applyPreset: (patch: Partial<SimConfig>) => void;
  toggleRunning: () => void;
  setRunning: (running: boolean) => void;
  reset: () => void;
  setMetrics: (m: Metrics) => void;
  launch: () => void;
}

const STRUCTURAL_KEYS: (keyof SimConfig)[] = [
  "N",
  "pe",
  "conn",
  "ge",
  "gi",
  "model",
];

export const useSim = create<SimState>((set) => ({
  config: { ...DEFAULT_CONFIG },
  running: true,
  launched: false,
  rebuildToken: 0,
  metrics: {
    timeMs: 0,
    rateHz: 0,
    active: 0,
    synchrony: 0,
    totalSpikes: 0,
    synapses: 0,
  },

  setConfig: (patch) =>
    set((s) => {
      const needsRebuild = STRUCTURAL_KEYS.some(
        (k) => k in patch && patch[k] !== s.config[k],
      );
      return {
        config: { ...s.config, ...patch },
        rebuildToken: needsRebuild ? s.rebuildToken + 1 : s.rebuildToken,
      };
    }),

  applyPreset: (patch) =>
    set((s) => ({
      config: { ...s.config, ...patch },
      rebuildToken: s.rebuildToken + 1,
      running: true,
    })),

  toggleRunning: () => set((s) => ({ running: !s.running })),
  setRunning: (running) => set({ running }),
  reset: () =>
    set((s) => ({ rebuildToken: s.rebuildToken + 1, running: true })),
  setMetrics: (metrics) => set({ metrics }),
  launch: () => set({ launched: true }),
}));
