import type { IzhikevichParams, ModelName, SimConfig } from "@/types";

// Canonical Izhikevich parameter sets for common cortical cell classes.
export const MODELS: Record<ModelName, IzhikevichParams> = {
  rs: { a: 0.02, b: 0.2, c: -65, d: 8 }, // regular spiking (excitatory)
  ib: { a: 0.02, b: 0.2, c: -55, d: 4 }, // intrinsically bursting
  ch: { a: 0.02, b: 0.2, c: -50, d: 2 }, // chattering
  fs: { a: 0.1, b: 0.2, c: -65, d: 2 }, // fast spiking (inhibitory)
  lts: { a: 0.02, b: 0.25, c: -65, d: 2 }, // low-threshold spiking
};

export const MODEL_LABELS: Record<ModelName, string> = {
  rs: "Regular Spiking (RS)",
  ib: "Intrinsically Bursting (IB)",
  ch: "Chattering (CH)",
  fs: "Fast Spiking (FS)",
  lts: "Low-Threshold Spiking (LTS)",
};

export const DEFAULTS: SimConfig = {
  N: 1000,
  excFraction: 0.8,
  connectivity: 0.1,
  excGain: 0.5,
  inhGain: 1.0,
  inputDrive: 4.0,
  tauSyn: 5.0,
  noise: 0.5,
  excModel: "rs",
  inhModel: "fs",
  topology: "random",
  integrator: "euler",
  stdp: false,
  stdpRate: 0.005,
  delaysEnabled: false,
  maxDelay: 1,
  dt: 1.0,
};

// Gaussian sample via Box-Muller, used for per-neuron parameter heterogeneity.
export function gaussian(mean = 0, std = 1): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * std;
}
