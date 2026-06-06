/**
 * snn-engine.js — The CortexSim Pro spiking neural network core.
 *
 * Design goals:
 *  - Dependency-free, pure JS so it can run in a Web Worker, in Node (for tests),
 *    and later be ported to WebAssembly / WebGPU without touching the API.
 *  - Sparse connectivity stored in CSR-style flat typed arrays for cache locality.
 *  - Conduction delays implemented with a circular delivery buffer (Brunel-style).
 *  - Current-based exponential synapses with separate excitatory/inhibitory decay.
 *  - Optional pair-based STDP on excitatory->excitatory synapses.
 *  - Fully seeded RNG => reproducible runs.
 *
 * Units: time in ms, voltage in mV, currents in model-specific units.
 */
import { getModel } from "./models.js";
import { mulberry32, gaussian } from "./rng.js";

export const DEFAULT_CONFIG = {
  model: "lif",
  N: 1000, // total neurons
  excitatoryRatio: 0.8, // fraction excitatory (Dale's principle)
  connectionProb: 0.1, // probability of a directed synapse
  J: 0.2, // excitatory synaptic weight (mV PSP amplitude for LIF)
  g: 5.0, // relative inhibitory strength (I weight = -g*J)
  delay: 1.5, // uniform conduction delay (ms)
  tauSynExc: 3.0, // excitatory synaptic decay (ms)
  tauSynInh: 6.0, // inhibitory synaptic decay (ms)
  inputRate: 15.0, // external Poisson rate per neuron (Hz)
  inputWeight: 0.6, // weight of each external input event
  noise: 0.0, // gaussian current noise std added each step
  dt: 0.1, // integration timestep (ms)
  stdp: false, // enable plasticity
  stdpRate: 0.005, // STDP learning rate
  stdpTau: 20.0, // STDP trace time constant (ms)
  wMax: 2.0, // max excitatory weight (for STDP clamp)
  seed: 1234,
  modelParams: {}, // per-model parameter overrides
};

export class NetworkEngine {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.build();
  }

  /** (Re)build the network from the current config. */
  build() {
    const c = this.config;
    const N = (this.N = Math.max(1, Math.floor(c.N)));
    this.model = getModel(c.model);
    this.params = { ...this.model.defaults, ...(c.modelParams || {}) };
    this.rng = mulberry32(c.seed >>> 0);

    this.NE = Math.round(N * c.excitatoryRatio);
    this.NI = N - this.NE;

    // Membrane state
    this.v = new Float32Array(N);
    this.u = new Float32Array(N);
    this.refractoryUntil = new Float32Array(N);
    this.lastSpike = new Float32Array(N).fill(-1e9);
    this.isExc = new Uint8Array(N);
    for (let i = 0; i < N; i++) this.isExc[i] = i < this.NE ? 1 : 0;

    // Synaptic current accumulators (separate exc/inh for distinct kinetics)
    this.gExc = new Float32Array(N);
    this.gInh = new Float32Array(N);

    // STDP traces
    this.preTrace = new Float32Array(N);
    this.postTrace = new Float32Array(N);

    const state = {
      v: this.v,
      u: this.u,
      refractoryUntil: this.refractoryUntil,
      rng: this.rng,
    };
    this.state = state;
    for (let i = 0; i < N; i++) this.model.init(state, i, this.params);

    this.buildConnectivity();
    this.buildDelayBuffer();

    this.time = 0; // ms
    this.stepCount = 0;
    this.totalSpikes = 0;
    // Decay factors recomputed when dt / tau change
    this.refreshDecay();
  }

  refreshDecay() {
    const c = this.config;
    this.decExc = Math.exp(-c.dt / c.tauSynExc);
    this.decInh = Math.exp(-c.dt / c.tauSynInh);
    this.decStdp = Math.exp(-c.dt / c.stdpTau);
    // Expected external events per neuron per dt (Poisson rate in Hz, dt in ms)
    this.pInput = (c.inputRate * c.dt) / 1000.0;
    this.delaySteps = Math.max(1, Math.round(c.delay / c.dt));
  }

  /** Generate sparse random connectivity in CSR layout. */
  buildConnectivity() {
    const c = this.config;
    const N = this.N;
    const p = c.connectionProb;
    const offsets = new Int32Array(N + 1);
    const targetsTmp = [];
    const weightsTmp = [];
    const plasticTmp = [];

    for (let i = 0; i < N; i++) {
      offsets[i] = targetsTmp.length;
      const wBase = this.isExc[i] ? c.J : -c.g * c.J;
      for (let j = 0; j < N; j++) {
        if (i === j) continue;
        if (this.rng() < p) {
          targetsTmp.push(j);
          weightsTmp.push(wBase);
          // Plastic only for exc->exc synapses when STDP is on.
          plasticTmp.push(this.isExc[i] && this.isExc[j] ? 1 : 0);
        }
      }
    }
    offsets[N] = targetsTmp.length;
    this.outOffsets = offsets;
    this.outTargets = Int32Array.from(targetsTmp);
    this.outWeights = Float32Array.from(weightsTmp);
    this.outPlastic = Uint8Array.from(plasticTmp);
    this.numSynapses = targetsTmp.length;

    // Build reverse (incoming) index for STDP post-spike updates.
    this.buildReverseIndex();
  }

  buildReverseIndex() {
    const N = this.N;
    const inCount = new Int32Array(N + 1);
    for (let s = 0; s < this.outTargets.length; s++) inCount[this.outTargets[s] + 1]++;
    for (let i = 0; i < N; i++) inCount[i + 1] += inCount[i];
    this.inOffsets = inCount.slice();
    const inSyn = new Int32Array(this.outTargets.length); // index into out arrays
    const inPre = new Int32Array(this.outTargets.length); // presynaptic neuron
    const cursor = inCount.slice();
    for (let i = 0; i < N; i++) {
      for (let s = this.outOffsets[i]; s < this.outOffsets[i + 1]; s++) {
        const j = this.outTargets[s];
        const pos = cursor[j]++;
        inSyn[pos] = s;
        inPre[pos] = i;
      }
    }
    this.inSyn = inSyn;
    this.inPre = inPre;
  }

  buildDelayBuffer() {
    const N = this.N;
    const D = this.delaySteps || Math.max(1, Math.round(this.config.delay / this.config.dt));
    this.delaySteps = D;
    // Two delivery rings: excitatory and inhibitory contributions per neuron.
    this.ringExc = [];
    this.ringInh = [];
    for (let d = 0; d < D; d++) {
      this.ringExc.push(new Float32Array(N));
      this.ringInh.push(new Float32Array(N));
    }
    this.ringHead = 0;
  }

  /** Deliver a presynaptic spike from neuron i into the delay ring. */
  emitSpike(i) {
    const slot = (this.ringHead + this.delaySteps - 1) % this.delaySteps;
    const exc = this.ringExc[slot];
    const inh = this.ringInh[slot];
    const start = this.outOffsets[i];
    const end = this.outOffsets[i + 1];
    const targets = this.outTargets;
    const weights = this.outWeights;
    if (this.isExc[i]) {
      for (let s = start; s < end; s++) exc[targets[s]] += weights[s];
    } else {
      for (let s = start; s < end; s++) inh[targets[s]] += weights[s]; // weights already negative
    }
  }

  /**
   * Advance the simulation by `steps` integration steps.
   * Returns a frame summary: spike ids/times for this chunk + probe voltage.
   * @param {number} steps
   * @param {object} opts { collectVoltages, probe }
   */
  run(steps, opts = {}) {
    const c = this.config;
    const dt = c.dt;
    const N = this.N;
    const spikeIds = [];
    const spikeTimes = [];
    const probe = opts.probe ?? -1;
    const probeTrace = probe >= 0 ? [] : null;
    const useNoise = c.noise > 0;
    const stdp = c.stdp;

    for (let s = 0; s < steps; s++) {
      // 1. Collect delivered synaptic input for this step from the ring head.
      const exc = this.ringExc[this.ringHead];
      const inh = this.ringInh[this.ringHead];
      for (let i = 0; i < N; i++) {
        this.gExc[i] = this.gExc[i] * this.decExc + exc[i];
        this.gInh[i] = this.gInh[i] * this.decInh + inh[i];
        exc[i] = 0;
        inh[i] = 0;
      }

      // 2. External Poisson drive.
      const pIn = this.pInput;
      if (pIn > 0) {
        for (let i = 0; i < N; i++) {
          if (this.rng() < pIn) this.gExc[i] += c.inputWeight;
        }
      }

      // 3. Integrate every neuron, detect spikes.
      const now = this.time;
      for (let i = 0; i < N; i++) {
        let I = this.gExc[i] + this.gInh[i];
        if (useNoise) I += gaussian(this.rng) * c.noise;
        const fired = this.model.step(this.state, i, this.params, I, dt, now);
        if (stdp) {
          this.preTrace[i] *= this.decStdp;
          this.postTrace[i] *= this.decStdp;
        }
        if (fired) {
          this.lastSpike[i] = now;
          this.totalSpikes++;
          spikeIds.push(i);
          spikeTimes.push(now);
          this.emitSpike(i);
          if (stdp) this.applyStdp(i);
        }
      }

      this.ringHead = (this.ringHead + 1) % this.delaySteps;
      this.time += dt;
      this.stepCount++;
      if (probeTrace) probeTrace.push(this.v[probe]);
    }

    return {
      spikeIds,
      spikeTimes,
      probeTrace,
      time: this.time,
      totalSpikes: this.totalSpikes,
    };
  }

  /** Pair-based STDP update triggered when neuron i spikes. */
  applyStdp(i) {
    const c = this.config;
    const lr = c.stdpRate;
    // Potentiation: i is post for its incoming synapses (pre fired earlier).
    for (let k = this.inOffsets[i]; k < this.inOffsets[i + 1]; k++) {
      const s = this.inSyn[k];
      if (!this.outPlastic[s]) continue;
      const pre = this.inPre[k];
      this.outWeights[s] += lr * this.preTrace[pre];
      if (this.outWeights[s] > c.wMax) this.outWeights[s] = c.wMax;
    }
    // Depression: i is pre for its outgoing synapses (post fired earlier).
    for (let s = this.outOffsets[i]; s < this.outOffsets[i + 1]; s++) {
      if (!this.outPlastic[s]) continue;
      const post = this.outTargets[s];
      this.outWeights[s] -= lr * this.postTrace[post];
      if (this.outWeights[s] < 0) this.outWeights[s] = 0;
    }
    // Bump traces for this spike.
    this.preTrace[i] += 1;
    this.postTrace[i] += 1;
  }

  /** Update a live parameter without rebuilding topology where possible. */
  setParam(key, value) {
    const topologyKeys = [
      "N",
      "excitatoryRatio",
      "connectionProb",
      "seed",
      "model",
    ];
    this.config[key] = value;
    if (key === "J" || key === "g") {
      // Rescale existing weights to preserve learned structure ratios.
      this.rescaleWeights();
    }
    if (topologyKeys.includes(key)) {
      this.build();
      return true; // rebuilt
    }
    this.refreshDecay();
    return false;
  }

  rescaleWeights() {
    const c = this.config;
    for (let i = 0; i < this.N; i++) {
      const wBase = this.isExc[i] ? c.J : -c.g * c.J;
      for (let s = this.outOffsets[i]; s < this.outOffsets[i + 1]; s++) {
        // Only reset non-plastic or when STDP off; keep learned exc weights sign.
        if (!c.stdp || !this.outPlastic[s]) this.outWeights[s] = wBase;
      }
    }
  }

  /** A compact, JSON-serialisable description of the network topology. */
  describe() {
    return {
      N: this.N,
      NE: this.NE,
      NI: this.NI,
      synapses: this.numSynapses,
      model: this.config.model,
      meanDegree: this.numSynapses / this.N,
      delaySteps: this.delaySteps,
    };
  }

  /** Positions for 3D layout (computed once, deterministic). */
  computeLayout(kind = "sphere") {
    const N = this.N;
    const pos = new Float32Array(N * 3);
    const rng = mulberry32((this.config.seed >>> 0) ^ 0x9e3779b9);
    if (kind === "layers") {
      // Excitatory and inhibitory in stacked slabs.
      for (let i = 0; i < N; i++) {
        const layer = this.isExc[i] ? 1 : -1;
        pos[i * 3] = (rng() - 0.5) * 60;
        pos[i * 3 + 1] = layer * 12 + (rng() - 0.5) * 6;
        pos[i * 3 + 2] = (rng() - 0.5) * 60;
      }
    } else if (kind === "grid") {
      const side = Math.ceil(Math.sqrt(N));
      for (let i = 0; i < N; i++) {
        const x = i % side;
        const z = Math.floor(i / side);
        pos[i * 3] = (x - side / 2) * (60 / side);
        pos[i * 3 + 1] = (rng() - 0.5) * 2;
        pos[i * 3 + 2] = (z - side / 2) * (60 / side);
      }
    } else {
      // Fibonacci sphere.
      const golden = Math.PI * (3 - Math.sqrt(5));
      const R = 30;
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / Math.max(1, N - 1)) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = golden * i;
        pos[i * 3] = Math.cos(theta) * r * R;
        pos[i * 3 + 1] = y * R;
        pos[i * 3 + 2] = Math.sin(theta) * r * R;
      }
    }
    return pos;
  }
}
