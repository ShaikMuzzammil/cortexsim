import type { SimConfig } from "./types";

export interface Preset {
  id: string;
  label: string;
  description: string;
  config: Partial<SimConfig>;
}

export const PRESETS: Preset[] = [
  {
    id: "async",
    label: "Asynchronous",
    description: "Irregular, decorrelated background firing.",
    config: { conn: 0.1, ge: 0.5, gi: 1.0, drive: 1.0 },
  },
  {
    id: "sync",
    label: "Synchronous",
    description: "Population-wide rhythmic volleys.",
    config: { conn: 0.14, ge: 0.75, gi: 1.5, drive: 1.3 },
  },
  {
    id: "gamma",
    label: "Gamma",
    description: "Fast 30–80 Hz inhibition-paced oscillation.",
    config: { conn: 0.12, ge: 0.6, gi: 1.8, drive: 1.4 },
  },
  {
    id: "burst",
    label: "Bursting",
    description: "Intrinsically bursting excitatory cells.",
    config: { model: "ib", conn: 0.1, ge: 0.55, gi: 1.0, drive: 1.1 },
  },
  {
    id: "storm",
    label: "Seizure",
    description: "Runaway, hyper-synchronous excitation.",
    config: { pe: 0.9, conn: 0.16, ge: 1.0, gi: 0.6, drive: 1.8 },
  },
  {
    id: "quiet",
    label: "Quiescent",
    description: "Sparse, near-silent network.",
    config: { conn: 0.08, ge: 0.35, gi: 1.2, drive: 0.45 },
  },
];
