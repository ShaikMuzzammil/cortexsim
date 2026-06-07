import type { ModelType, SimConfig, StepResult, SpikeEvent } from "./types";

function randn(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Real-time spiking neural network based on the Izhikevich (2003) model.
 *
 *   v' = 0.04 v^2 + 5 v + 140 - u + I
 *   u' = a (b v - u)
 *   if v >= 30 mV:  v <- c,  u <- u + d
 *
 * Excitatory and inhibitory populations are wired with sparse random synapses
 * stored in compressed-sparse-row (CSR) form for cache-friendly propagation.
 */
export class SNN {
  readonly N: number;
  readonly Ne: number;
  readonly Ni: number;
  readonly synapses: number;

  private a: Float32Array;
  private b: Float32Array;
  private c: Float32Array;
  private d: Float32Array;
  private v: Float32Array;
  private u: Float32Array;
  private I: Float32Array;

  /** CSR adjacency: rowPtr[j]..rowPtr[j+1] are outgoing synapses of neuron j */
  private rowPtr: Int32Array;
  private colIdx: Int32Array;
  private weight: Float32Array;

  /** last spike time (ms) per neuron, for smooth visual fade */
  readonly last: Float32Array;
  /** lifetime spike count per neuron (activity heatmap) */
  readonly counts: Uint32Array;
  /** 3D unit-sphere positions, length N*3 */
  readonly pos: Float32Array;
  readonly exc: Uint8Array;

  /** elapsed model time in ms */
  timeMs = 0;
  totalSpikes = 0;

  private driveExc: number;
  private driveInh: number;
  private pendingStim = 0;
  private pendingStimFrac = 0;

  constructor(cfg: SimConfig) {
    const N = Math.max(2, Math.floor(cfg.N));
    const Ne = Math.round(N * cfg.pe);
    this.N = N;
    this.Ne = Ne;
    this.Ni = N - Ne;

    this.a = new Float32Array(N);
    this.b = new Float32Array(N);
    this.c = new Float32Array(N);
    this.d = new Float32Array(N);
    this.v = new Float32Array(N);
    this.u = new Float32Array(N);
    this.I = new Float32Array(N);
    this.last = new Float32Array(N).fill(-1e9);
    this.counts = new Uint32Array(N);
    this.pos = new Float32Array(N * 3);
    this.exc = new Uint8Array(N);

    for (let i = 0; i < N; i++) {
      const isExc = i < Ne;
      this.exc[i] = isExc ? 1 : 0;
      const re = Math.random();
      const ri = Math.random();
      if (isExc) {
        this.applyExcModel(i, cfg.model, re);
      } else {
        this.a[i] = 0.02 + 0.08 * ri;
        this.b[i] = 0.25 - 0.05 * ri;
        this.c[i] = -65;
        this.d[i] = 2;
      }
      this.v[i] = -65;
      this.u[i] = this.b[i] * this.v[i];

      // Fibonacci-sphere position for an even 3D shell
      const t = (i + 0.5) / N;
      const phi = Math.acos(1 - 2 * t);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      this.pos[i * 3] = Math.sin(phi) * Math.cos(theta);
      this.pos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta);
      this.pos[i * 3 + 2] = Math.cos(phi);
    }

    // Build sparse connectivity (CSR)
    const cols: number[] = [];
    const wts: number[] = [];
    this.rowPtr = new Int32Array(N + 1);
    for (let j = 0; j < N; j++) {
      this.rowPtr[j] = cols.length;
      const base = j < Ne ? cfg.ge : -cfg.gi;
      for (let i = 0; i < N; i++) {
        if (i === j) continue;
        if (Math.random() < cfg.conn) {
          cols.push(i);
          wts.push(base * Math.random());
        }
      }
    }
    this.rowPtr[N] = cols.length;
    this.colIdx = Int32Array.from(cols);
    this.weight = Float32Array.from(wts);
    this.synapses = cols.length;

    this.driveExc = 5 * cfg.drive;
    this.driveInh = 2 * cfg.drive;
  }

  setDrive(drive: number) {
    this.driveExc = 5 * drive;
    this.driveInh = 2 * drive;
  }

  /** Queue a one-shot current pulse delivered to a random subset next step. */
  stimulate(amplitude: number, fraction: number) {
    this.pendingStim = amplitude;
    this.pendingStimFrac = fraction;
  }

  private applyExcModel(i: number, model: ModelType, re: number) {
    switch (model) {
      case "ib":
        this.a[i] = 0.02;
        this.b[i] = 0.2;
        this.c[i] = -55;
        this.d[i] = 4;
        break;
      case "ch":
        this.a[i] = 0.02;
        this.b[i] = 0.2;
        this.c[i] = -50;
        this.d[i] = 2;
        break;
      case "fs":
        this.a[i] = 0.1;
        this.b[i] = 0.2;
        this.c[i] = -65;
        this.d[i] = 2;
        break;
      case "rs":
      default:
        this.a[i] = 0.02;
        this.b[i] = 0.2;
        this.c[i] = -65 + 15 * re * re;
        this.d[i] = 8 - 6 * re * re;
        break;
    }
  }

  /** Advance the network by 1 ms (two 0.5 ms substeps). */
  step(): StepResult {
    const { N, Ne, a, b, c, d, v, u, I, last, counts, rowPtr, colIdx, weight } =
      this;
    const spikes: SpikeEvent[] = [];
    let fired = 0;
    let firedExc = 0;
    let firedInh = 0;

    // thalamic / background input
    for (let i = 0; i < N; i++) {
      I[i] = (i < Ne ? this.driveExc : this.driveInh) * randn();
    }

    // optional one-shot stimulus pulse
    if (this.pendingStim !== 0) {
      for (let i = 0; i < N; i++) {
        if (Math.random() < this.pendingStimFrac) I[i] += this.pendingStim;
      }
      this.pendingStim = 0;
      this.pendingStimFrac = 0;
    }

    // detect spikes, reset, and deliver synaptic current
    for (let i = 0; i < N; i++) {
      if (v[i] >= 30) {
        v[i] = c[i];
        u[i] += d[i];
        last[i] = this.timeMs;
        counts[i]++;
        fired++;
        const isExc = i < Ne;
        if (isExc) firedExc++;
        else firedInh++;
        spikes.push({ i, exc: isExc });
        const s = rowPtr[i];
        const e = rowPtr[i + 1];
        for (let k = s; k < e; k++) I[colIdx[k]] += weight[k];
      }
    }

    // integrate membrane (two 0.5 ms substeps for numerical stability)
    for (let i = 0; i < N; i++) {
      let vv = v[i];
      vv += 0.5 * (0.04 * vv * vv + 5 * vv + 140 - u[i] + I[i]);
      vv += 0.5 * (0.04 * vv * vv + 5 * vv + 140 - u[i] + I[i]);
      if (vv > 35) vv = 35;
      v[i] = vv;
      u[i] += a[i] * (b[i] * vv - u[i]);
    }

    this.timeMs += 1;
    this.totalSpikes += fired;
    return { fired, firedExc, firedInh, spikes };
  }

  /** Membrane potential of neuron i (mV). */
  getV(i: number): number {
    return this.v[i];
  }

  /** Recovery variable of neuron i. */
  getU(i: number): number {
    return this.u[i];
  }
}
