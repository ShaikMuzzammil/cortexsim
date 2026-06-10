// Shared domain types for CortexSim Studio.

export type ModelName = "rs" | "ib" | "ch" | "fs" | "lts";
export type TopologyName = "random" | "smallworld" | "scalefree" | "grid";
export type Integrator = "euler" | "rk4";

export interface IzhikevichParams {
  a: number;
  b: number;
  c: number;
  d: number;
}

export interface SimConfig {
  N: number;
  excFraction: number;
  connectivity: number;
  excGain: number;
  inhGain: number;
  inputDrive: number;
  tauSyn: number;
  noise: number;
  excModel: ModelName;
  inhModel: ModelName;
  topology: TopologyName;
  integrator: Integrator;
  stdp: boolean;
  stdpRate: number;
  delaysEnabled: boolean;
  maxDelay: number;
  dt: number;
}

export interface Metrics {
  rate: number;
  excRate: number;
  inhRate: number;
  activePct: number;
  synchrony: number;
  dominantHz: number;
  lfp: number;
  entropy: number;
  spikes: number;
  fps: number;
  timeMs: number;
}

export interface Spike {
  t: number;
  i: number;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  config: Partial<SimConfig>;
}

export interface SavedSimulation {
  _id?: string;
  name: string;
  config: SimConfig;
  createdAt: string;
  notes?: string;
  metricsSnapshot?: Metrics;
}
