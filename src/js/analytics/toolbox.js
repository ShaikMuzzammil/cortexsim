/**
 * toolbox.js — Advanced (but real, working) analysis routines that operate on
 * the engine's connectivity graph and spike output:
 *   - Connectome graph metrics: mean degree, clustering, degree distribution
 *   - Lesion study: knock out a fraction of nodes and report connectivity loss
 *   - Information theory: mutual information between two binned spike trains
 *   - Optogenetics: convert opsin + light power into an injected current
 *   - Calcium proxy: GCaMP6f-like fluorescence from a spike train
 *
 * These are deliberately tractable in-browser versions of the corresponding
 * research methods, exact enough to be scientifically meaningful for teaching
 * and exploration.
 */

/** Graph-theory metrics on the CSR connectivity. */
export function connectomeMetrics(engine) {
  const N = engine.N;
  const outOff = engine.outOffsets;
  const inOff = engine.inOffsets;
  const outDeg = new Int32Array(N);
  const inDeg = new Int32Array(N);
  for (let i = 0; i < N; i++) {
    outDeg[i] = outOff[i + 1] - outOff[i];
    inDeg[i] = inOff[i + 1] - inOff[i];
  }
  let meanOut = 0;
  for (let i = 0; i < N; i++) meanOut += outDeg[i];
  meanOut /= N || 1;
  // Clustering (sampled directed transitivity over a subset for speed).
  const sample = Math.min(N, 200);
  const adj = new Set();
  const key = (a, b) => a * N + b;
  for (let i = 0; i < N; i++)
    for (let s = outOff[i]; s < outOff[i + 1]; s++) adj.add(key(i, engine.outTargets[s]));
  let triangles = 0;
  let triples = 0;
  for (let n = 0; n < sample; n++) {
    const i = (Math.random() * N) | 0;
    const nbrs = [];
    for (let s = outOff[i]; s < outOff[i + 1]; s++) nbrs.push(engine.outTargets[s]);
    for (let a = 0; a < nbrs.length; a++)
      for (let b = 0; b < nbrs.length; b++) {
        if (a === b) continue;
        triples++;
        if (adj.has(key(nbrs[a], nbrs[b]))) triangles++;
      }
  }
  const clustering = triples ? triangles / triples : 0;
  return {
    N,
    synapses: engine.numSynapses,
    meanDegree: +meanOut.toFixed(2),
    density: +(engine.numSynapses / (N * (N - 1) || 1)).toFixed(4),
    clustering: +clustering.toFixed(3),
    outDegree: outDeg,
    inDegree: inDeg,
  };
}

/** Lesion study: estimate fraction of synapses lost when knocking out nodes. */
export function lesionStudy(engine, fraction) {
  const N = engine.N;
  const k = Math.floor(N * fraction);
  // Knock out highest out-degree (hub) nodes first.
  const deg = [];
  for (let i = 0; i < N; i++) deg.push([i, engine.outOffsets[i + 1] - engine.outOffsets[i]]);
  deg.sort((a, b) => b[1] - a[1]);
  const killed = new Set();
  for (let i = 0; i < k; i++) killed.add(deg[i][0]);
  let lost = 0;
  for (let i = 0; i < N; i++) {
    const srcDead = killed.has(i);
    for (let s = engine.outOffsets[i]; s < engine.outOffsets[i + 1]; s++) {
      if (srcDead || killed.has(engine.outTargets[s])) lost++;
    }
  }
  return {
    knockedOut: k,
    targeting: "hub (highest out-degree)",
    synapsesLost: lost,
    fractionLost: +(lost / (engine.numSynapses || 1)).toFixed(3),
  };
}

/** Mutual information (bits) between two binary spike-train bin vectors. */
export function mutualInformation(binsA, binsB) {
  const n = Math.min(binsA.length, binsB.length);
  if (!n) return 0;
  let p1 = 0;
  let q1 = 0;
  const joint = [0, 0, 0, 0]; // 00,01,10,11
  for (let i = 0; i < n; i++) {
    const a = binsA[i] > 0 ? 1 : 0;
    const b = binsB[i] > 0 ? 1 : 0;
    p1 += a;
    q1 += b;
    joint[a * 2 + b]++;
  }
  const pa = [1 - p1 / n, p1 / n];
  const pb = [1 - q1 / n, q1 / n];
  let mi = 0;
  for (let a = 0; a < 2; a++)
    for (let b = 0; b < 2; b++) {
      const pj = joint[a * 2 + b] / n;
      if (pj > 0 && pa[a] > 0 && pb[b] > 0) mi += pj * Math.log2(pj / (pa[a] * pb[b]));
    }
  return Math.max(0, mi);
}

/** Optogenetics: opsin activation -> injected current (arbitrary engine units). */
export const OPSINS = {
  ChR2: { type: "excitatory", peakNm: 473, gain: 8.0, tauOn: 2, label: "ChR2 (473nm, depolarising)" },
  ChrimsonR: { type: "excitatory", peakNm: 595, gain: 6.5, tauOn: 3, label: "ChrimsonR (595nm, depolarising)" },
  eNpHR: { type: "inhibitory", peakNm: 589, gain: -7.0, tauOn: 4, label: "eNpHR3.0 (589nm, silencing)" },
  ArchT: { type: "inhibitory", peakNm: 566, gain: -6.0, tauOn: 5, label: "ArchT (566nm, silencing)" },
};

export function opsinCurrent(opsinName, powerMW) {
  const o = OPSINS[opsinName] || OPSINS.ChR2;
  // Saturating (Hill-like) activation curve.
  const p = Math.max(0, powerMW);
  const activation = p / (p + 2.0);
  return o.gain * activation * 5.0;
}

/** GCaMP6f-like calcium fluorescence (dF/F) from a spike train (online). */
export class CalciumProxy {
  constructor(dt = 1, tauDecay = 400, ampPerSpike = 0.18, noise = 0.02) {
    this.dt = dt;
    this.decay = Math.exp(-dt / tauDecay);
    this.amp = ampPerSpike;
    this.noise = noise;
    this.f = 0;
  }
  step(spiked) {
    this.f = this.f * this.decay + (spiked ? this.amp : 0);
    return this.f + (Math.random() - 0.5) * 2 * this.noise;
  }
}
