import type { SimConfig } from "./types";

export interface Preset {
  id: string;
  label: string;
  blurb: string;
  config: Partial<SimConfig>;
}

export const PRESETS: Preset[] = [
  {
    id: "async",
    label: "Asynchronous",
    blurb: "Irregular, decorrelated firing",
    config: { conn: 0.1, ge: 0.5, gi: 1.0, drive: 1.0, model: "rs" },
  },
  {
    id: "sync",
    label: "Synchronous",
    blurb: "Network-wide population bursts",
    config: { conn: 0.15, ge: 0.9, gi: 1.0, drive: 1.1, model: "rs" },
  },
  {
    id: "gamma",
    label: "Gamma",
    blurb: "Fast 30–80 Hz rhythm from E–I balance",
    config: { conn: 0.14, ge: 0.7, gi: 1.6, drive: 1.2, model: "rs" },
  },
  {
    id: "burst",
    label: "Bursting",
    blurb: "Intrinsically bursting excitatory cells",
    config: { conn: 0.1, ge: 0.6, gi: 1.0, drive: 1.0, model: "ib" },
  },
  {
    id: "storm",
    label: "Seizure",
    blurb: "Runaway excitation, weak inhibition",
    config: { conn: 0.22, ge: 1.1, gi: 0.4, drive: 1.5, model: "rs" },
  },
  {
    id: "quiet",
    label: "Quiescent",
    blurb: "Sparse, low background activity",
    config: { conn: 0.08, ge: 0.3, gi: 1.4, drive: 0.4, model: "rs" },
  },
];
