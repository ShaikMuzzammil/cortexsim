// engineBus: a module-level singleton that the studio engine writes to every
// tick and that activities read from in their draw / step. This is what turns
// 35 isolated visuals into one coordinated real-time app.
//
// We deliberately use mutable typed arrays and a single object reference here
// so consumers can read the latest values cheaply each animation frame without
// triggering React renders.

import type { SimConfig } from "@/types";
import { DEFAULTS } from "@/lib/engine/models";

export interface EngineSamples {
  // Simulation time in ms.
  tMs: number;
  // Wall-clock fps of the engine loop.
  fps: number;
  // Real-time factor (sim ms / wall ms).
  rtFactor: number;
  // Number of neurons.
  N: number;
  // Number of excitatory neurons.
  nExc: number;
  // Whether the engine is currently stepping.
  running: boolean;
  // Total spikes since the start of the session.
  totalSpikes: number;
  // Rolling buffer of "steps since last spike" or similar is replaced by:
  // a rolling window of {tMs, i} spike events (latest first), capped.
  recentSpikes: Array<{ tMs: number; i: number; exc: boolean }>;
  // Per-population rolling firing rates (Hz, smoothed).
  eRateBuffer: Float32Array;
  iRateBuffer: Float32Array;
  rateBufferLen: number;
  rateHead: number; // next index to write
  // Last computed scalar rates.
  eRateNow: number;
  iRateNow: number;
  totalRateNow: number;
  // Voltage trace of the probed neuron (rolling window).
  probeIndex: number;
  vBuffer: Float32Array;
  uBuffer: Float32Array;
  vHead: number;
  vBufferLen: number;
  // Current config snapshot (read-only for consumers).
  config: SimConfig;
}

function emptySamples(): EngineSamples {
  const rateLen = 512;
  const vLen = 600;
  return {
    tMs: 0,
    fps: 0,
    rtFactor: 0,
    N: DEFAULTS.N,
    nExc: Math.floor(DEFAULTS.N * DEFAULTS.excFraction),
    running: false,
    totalSpikes: 0,
    recentSpikes: [],
    eRateBuffer: new Float32Array(rateLen),
    iRateBuffer: new Float32Array(rateLen),
    rateBufferLen: rateLen,
    rateHead: 0,
    eRateNow: 0,
    iRateNow: 0,
    totalRateNow: 0,
    probeIndex: 0,
    vBuffer: new Float32Array(vLen),
    uBuffer: new Float32Array(vLen),
    vHead: 0,
    vBufferLen: vLen,
    config: { ...DEFAULTS },
  };
}

export const engineBus = {
  latest: emptySamples(),
  reset(): void {
    this.latest = emptySamples();
  },
};

export function pushRate(samples: EngineSamples, eHz: number, iHz: number): void {
  samples.eRateBuffer[samples.rateHead] = eHz;
  samples.iRateBuffer[samples.rateHead] = iHz;
  samples.rateHead = (samples.rateHead + 1) % samples.rateBufferLen;
  samples.eRateNow = eHz;
  samples.iRateNow = iHz;
  samples.totalRateNow = eHz + iHz;
}

export function pushVoltage(samples: EngineSamples, v: number, u: number): void {
  samples.vBuffer[samples.vHead] = v;
  samples.uBuffer[samples.vHead] = u;
  samples.vHead = (samples.vHead + 1) % samples.vBufferLen;
}

export function pushSpike(samples: EngineSamples, tMs: number, i: number, exc: boolean): void {
  samples.recentSpikes.push({ tMs, i, exc });
  // Cap buffer at 4096 events to bound memory.
  if (samples.recentSpikes.length > 4096) {
    samples.recentSpikes.splice(0, samples.recentSpikes.length - 4096);
  }
  samples.totalSpikes += 1;
}

// Read the latest rate buffer in time order (oldest -> newest) into a new array.
export function readRateSeries(samples: EngineSamples): { e: Float32Array; i: Float32Array } {
  const n = samples.rateBufferLen;
  const out = { e: new Float32Array(n), i: new Float32Array(n) };
  for (let k = 0; k < n; k++) {
    const idx = (samples.rateHead + k) % n;
    out.e[k] = samples.eRateBuffer[idx];
    out.i[k] = samples.iRateBuffer[idx];
  }
  return out;
}

export function readVoltageSeries(samples: EngineSamples): { v: Float32Array; u: Float32Array } {
  const n = samples.vBufferLen;
  const out = { v: new Float32Array(n), u: new Float32Array(n) };
  for (let k = 0; k < n; k++) {
    const idx = (samples.vHead + k) % n;
    out.v[k] = samples.vBuffer[idx];
    out.u[k] = samples.uBuffer[idx];
  }
  return out;
}
