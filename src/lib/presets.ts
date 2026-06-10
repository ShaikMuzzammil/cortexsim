import type { Preset } from "@/types";

export const PRESETS: Preset[] = [
  {
    id: "async",
    name: "Asynchronous Irregular",
    description: "Cortex-like balanced state with irregular, decorrelated firing.",
    config: { excGain: 0.5, inhGain: 1.0, inputDrive: 4.0, connectivity: 0.1, noise: 0.4 },
  },
  {
    id: "sync",
    name: "Synchronous Bursts",
    description: "Strong recurrent excitation drives network-wide synchrony.",
    config: { excGain: 1.2, inhGain: 0.6, inputDrive: 5.0, connectivity: 0.15, noise: 0.2 },
  },
  {
    id: "gamma",
    name: "Gamma Oscillation",
    description: "Balanced excitation/inhibition producing ~40 Hz rhythms.",
    config: { excGain: 0.9, inhGain: 1.1, inputDrive: 4.5, connectivity: 0.12, noise: 0.5 },
  },
  {
    id: "burst",
    name: "Intrinsic Bursting",
    description: "Bursting excitatory cells create rhythmic compound events.",
    config: { excGain: 1.5, inhGain: 0.4, inputDrive: 5.5, connectivity: 0.08, noise: 0.2, excModel: "ib" },
  },
  {
    id: "storm",
    name: "Seizure Storm",
    description: "Runaway excitation with collapsed inhibition (pathological).",
    config: { excGain: 2.0, inhGain: 0.2, inputDrive: 6.0, connectivity: 0.2, noise: 0.1 },
  },
  {
    id: "quiet",
    name: "Quiescent",
    description: "Inhibition-dominated regime with sparse background activity.",
    config: { excGain: 0.2, inhGain: 1.5, inputDrive: 1.0, connectivity: 0.05, noise: 0.0 },
  },
];
