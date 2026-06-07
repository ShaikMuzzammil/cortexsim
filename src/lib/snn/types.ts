export type ModelType = "rs" | "ib" | "ch" | "fs";

export interface SimConfig {
  /** Total neuron count */
  N: number;
  /** Fraction of excitatory neurons (0..1) */
  pe: number;
  /** Connection probability (0..1) */
  conn: number;
  /** Excitatory synaptic gain */
  ge: number;
  /** Inhibitory synaptic gain */
  gi: number;
  /** External input drive multiplier */
  drive: number;
  /** Excitatory cell model */
  model: ModelType;
  /** Simulation speed (ms of model time stepped per animation frame) */
  speed: number;
}

export interface SpikeEvent {
  /** neuron index */
  i: number;
  /** true if excitatory */
  exc: boolean;
}

export interface StepResult {
  fired: number;
  spikes: SpikeEvent[];
}

export interface Metrics {
  timeMs: number;
  rateHz: number;
  active: number;
  synchrony: number;
  totalSpikes: number;
  synapses: number;
}

export const DEFAULT_CONFIG: SimConfig = {
  N: 1000,
  pe: 0.8,
  conn: 0.1,
  ge: 0.5,
  gi: 1.0,
  drive: 1.0,
  model: "rs",
  speed: 4,
};
