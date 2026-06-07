import { create } from "zustand";
import {
  DEFAULT_CONFIG,
  EMPTY_METRICS,
  type Metrics,
  type SimConfig,
} from "../lib/snn/types";

interface SimState {
  config: SimConfig;
  running: boolean;
  metrics: Metrics;
  /** bumped to force the engine to rebuild from current config */
  rebuildToken: number;
  /** bumped to advance exactly one frame while paused */
  stepToken: number;
  /** bumped to inject a stimulus pulse */
  stimToken: number;
  /** index of the probed neuron (voltage / phase-plane) */
  probe: number;
  /** whether the full-screen platform app is open */
  launched: boolean;

  setConfig: (patch: Partial<SimConfig>) => void;
  applyPreset: (patch: Partial<SimConfig>) => void;
  toggleRunning: () => void;
  setRunning: (running: boolean) => void;
  reset: () => void;
  stepOnce: () => void;
  injectStimulus: () => void;
  setProbe: (i: number) => void;
  setMetrics: (m: Metrics) => void;
  launch: () => void;
  goHome: () => void;
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
  stepToken: 0,
  stimToken: 0,
  probe: 0,
  metrics: { ...EMPTY_METRICS },

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
  stepOnce: () => set((s) => ({ stepToken: s.stepToken + 1, running: false })),
  injectStimulus: () => set((s) => ({ stimToken: s.stimToken + 1 })),
  setProbe: (probe) => set({ probe }),
  setMetrics: (metrics) => set({ metrics }),
  launch: () => set({ launched: true, running: true }),
  goHome: () => set({ launched: false }),
}));
