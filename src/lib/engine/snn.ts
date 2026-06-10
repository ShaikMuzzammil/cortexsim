import type { Metrics, SimConfig, Spike } from "@/types";
import { MODELS, gaussian } from "./models";
import { buildTopology, type Connectivity } from "./topology";

// Sparse Izhikevich spiking neural network engine.
// Pure TypeScript, no dependencies, runs in the browser on the main thread.
export class SNN {
  cfg: SimConfig;
  N = 0;
  nExc = 0;
  // Per-neuron Izhikevich state and parameters.
  v!: Float64Array;
  u!: Float64Array;
  a!: Float64Array;
  b!: Float64Array;
  c!: Float64Array;
  d!: Float64Array;
  isExc!: Uint8Array;
  Isyn!: Float64Array; // decaying synaptic current
  conn!: Connectivity;
  weight = 1;
  // 3D positions on a sphere shell for visualization.
  px!: Float32Array;
  py!: Float32Array;
  pz!: Float32Array;
  // delay ring buffer of injected currents
  delayRing!: Float64Array[];
  ringLen = 1;
  ringHead = 0;
  // recent spike flags for this step
  firedThisStep: number[] = [];
  step = 0;
  customDv: ((v: number, u: number, I: number) => number) | null = null;
  customDu: ((v: number, u: number, a: number, b: number) => number) | null =
    null;

  constructor(cfg: SimConfig) {
    this.cfg = { ...cfg };
    this.build();
  }

  build() {
    const cfg = this.cfg;
    const N = Math.max(2, Math.floor(cfg.N));
    this.N = N;
    this.nExc = Math.floor(N * cfg.excFraction);
    this.v = new Float64Array(N);
    this.u = new Float64Array(N);
    this.a = new Float64Array(N);
    this.b = new Float64Array(N);
    this.c = new Float64Array(N);
    this.d = new Float64Array(N);
    this.isExc = new Uint8Array(N);
    this.Isyn = new Float64Array(N);
    this.px = new Float32Array(N);
    this.py = new Float32Array(N);
    this.pz = new Float32Array(N);

    const em = MODELS[cfg.excModel];
    const im = MODELS[cfg.inhModel];

    for (let i = 0; i < N; i++) {
      const exc = i < this.nExc ? 1 : 0;
      this.isExc[i] = exc;
      const re = Math.random();
      const re2 = re * re;
      if (exc) {
        this.a[i] = em.a;
        this.b[i] = em.b;
        this.c[i] = em.c + 15 * re2;
        this.d[i] = em.d - 6 * re2;
      } else {
        const ri = Math.random();
        this.a[i] = im.a + 0.08 * ri;
        this.b[i] = im.b - 0.05 * ri;
        this.c[i] = im.c;
        this.d[i] = im.d;
      }
      this.v[i] = -65 + gaussian(0, 2);
      this.u[i] = this.b[i] * this.v[i];

      // place neurons on a spherical shell (brain-like cloud).
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      const r = 0.85 + 0.15 * Math.random();
      this.px[i] = r * Math.sin(phi) * Math.cos(theta);
      this.py[i] = r * Math.sin(phi) * Math.sin(theta);
      this.pz[i] = r * Math.cos(phi);
    }

    this.conn = buildTopology(
      N,
      cfg.connectivity,
      cfg.topology,
      cfg.delaysEnabled,
      cfg.maxDelay,
    );

    this.ringLen = cfg.delaysEnabled ? Math.max(1, cfg.maxDelay) : 1;
    this.delayRing = new Array(this.ringLen);
    for (let r = 0; r < this.ringLen; r++) this.delayRing[r] = new Float64Array(N);
    this.ringHead = 0;
    this.step = 0;
    this.firedThisStep = [];
  }

  reset() {
    this.build();
  }

  setConfig(patch: Partial<SimConfig>, rebuild = false) {
    const structural = [
      "N",
      "excFraction",
      "connectivity",
      "topology",
      "excModel",
      "inhModel",
      "delaysEnabled",
      "maxDelay",
    ];
    const needsRebuild =
      rebuild || Object.keys(patch).some((k) => structural.includes(k));
    this.cfg = { ...this.cfg, ...patch };
    if (needsRebuild) this.build();
  }

  private dvDefault(v: number, u: number, I: number): number {
    return 0.04 * v * v + 5 * v + 140 - u + I;
  }
  private duDefault(v: number, u: number, a: number, b: number): number {
    return a * (b * v - u);
  }

  // Advance the network by one dt and return spike events generated.
  advance(): Spike[] {
    const cfg = this.cfg;
    const N = this.N;
    const dt = cfg.dt;
    const decay = Math.exp(-dt / Math.max(0.5, cfg.tauSyn));
    const fired: Spike[] = [];
    this.firedThisStep = [];

    const injected = this.delayRing[this.ringHead];

    const dv = this.customDv ?? this.dvDefault.bind(this);
    const du = this.customDu ?? this.duDefault.bind(this);

    for (let i = 0; i < N; i++) {
      // background Poisson-like drive + noise + decayed synaptic + delayed input
      let I = this.Isyn[i] + injected[i];
      I += this.isExc[i]
        ? cfg.inputDrive * (Math.random() < 0.5 ? gaussian(1, 1) : 0)
        : cfg.inputDrive * 0.6 * (Math.random() < 0.5 ? gaussian(1, 1) : 0);
      I += gaussian(0, cfg.noise);

      let v = this.v[i];
      let u = this.u[i];

      if (cfg.integrator === "rk4") {
        const h = dt;
        const k1v = dv(v, u, I);
        const k1u = du(v, u, this.a[i], this.b[i]);
        const k2v = dv(v + 0.5 * h * k1v, u + 0.5 * h * k1u, I);
        const k2u = du(v + 0.5 * h * k1v, u + 0.5 * h * k1u, this.a[i], this.b[i]);
        const k3v = dv(v + 0.5 * h * k2v, u + 0.5 * h * k2u, I);
        const k3u = du(v + 0.5 * h * k2v, u + 0.5 * h * k2u, this.a[i], this.b[i]);
        const k4v = dv(v + h * k3v, u + h * k3u, I);
        const k4u = du(v + h * k3v, u + h * k3u, this.a[i], this.b[i]);
        v += (h / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
        u += (h / 6) * (k1u + 2 * k2u + 2 * k3u + k4u);
      } else {
        // semi-implicit Euler with half steps for numerical stability
        v += 0.5 * dt * dv(v, u, I);
        v += 0.5 * dt * dv(v, u, I);
        u += dt * du(v, u, this.a[i], this.b[i]);
      }

      this.Isyn[i] *= decay;
      injected[i] = 0;

      if (v >= 30) {
        v = this.c[i];
        u += this.d[i];
        fired.push({ t: this.step, i });
        this.firedThisStep.push(i);
      }
      this.v[i] = v;
      this.u[i] = u;
    }

    // propagate spikes to synaptic targets
    const w = this.cfg.excGain;
    const wi = this.cfg.inhGain;
    for (const i of this.firedThisStep) {
      const tg = this.conn.targets[i];
      const dl = this.conn.delays[i];
      const sign = this.isExc[i] ? w : -wi;
      for (let m = 0; m < tg.length; m++) {
        const j = tg[m];
        const delay = dl[m] | 0;
        if (delay <= 0) {
          this.Isyn[j] += sign;
        } else {
          const slot = (this.ringHead + delay) % this.ringLen;
          this.delayRing[slot][j] += sign;
        }
      }
    }

    if (cfg.stdp) this.applyStdp();

    this.ringHead = (this.ringHead + 1) % this.ringLen;
    this.step++;
    return fired;
  }

  // Lightweight global STDP proxy: nudge excitatory gain toward target rate.
  private applyStdp() {
    const target = 0.05;
    const active = this.firedThisStep.length / this.N;
    const delta = (target - active) * this.cfg.stdpRate;
    this.cfg.excGain = Math.max(0.05, Math.min(3, this.cfg.excGain + delta));
  }

  injectPulse(strength = 12) {
    for (let i = 0; i < this.N; i++) this.Isyn[i] += strength * Math.random();
  }

  probeVoltage(i: number): { v: number; u: number } {
    const idx = Math.max(0, Math.min(this.N - 1, i | 0));
    return { v: this.v[idx], u: this.u[idx] };
  }
}
