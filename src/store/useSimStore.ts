import { create } from "zustand";
import type { Metrics, SimConfig } from "@/types";
import { DEFAULTS } from "@/lib/engine/models";

const ZERO_METRICS: Metrics = {
  rate: 0,
  excRate: 0,
  inhRate: 0,
  activePct: 0,
  synchrony: 0,
  dominantHz: 0,
  lfp: 0,
  entropy: 0,
  spikes: 0,
  fps: 0,
  timeMs: 0,
};

interface SimState {
  config: SimConfig;
  metrics: Metrics;
  running: boolean;
  probe: number;
  theme: "dark" | "light";
  renderMode: "3d" | "2d";
  setConfig: (patch: Partial<SimConfig>) => void;
  resetConfig: () => void;
  setMetrics: (m: Metrics) => void;
  setRunning: (r: boolean) => void;
  toggleRunning: () => void;
  setProbe: (i: number) => void;
  toggleTheme: () => void;
  setRenderMode: (m: "3d" | "2d") => void;
}

export const useSimStore = create<SimState>((set) => ({
  config: { ...DEFAULTS },
  metrics: { ...ZERO_METRICS },
  running: true,
  probe: 0,
  theme: "dark",
  renderMode: "3d",
  setConfig: (patch) =>
    set((s) => ({ config: { ...s.config, ...patch } })),
  resetConfig: () => set({ config: { ...DEFAULTS } }),
  setMetrics: (m) => set({ metrics: m }),
  setRunning: (r) => set({ running: r }),
  toggleRunning: () => set((s) => ({ running: !s.running })),
  setProbe: (i) => set({ probe: i }),
  toggleTheme: () =>
    set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
  setRenderMode: (m) => set({ renderMode: m }),
}));

export { ZERO_METRICS };
