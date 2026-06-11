import type { Activity, ActState, Params, DrawArgs } from "../types";
import {
  PAL,
  IZH,
  izhStep,
  frame,
  plot,
  heat,
  label,
  fmt,
  rng,
  clamp,
  pushCap,
  heatColor,
} from "../kit";

function buildMatrix(type: string, n: number, density: number, seed: number): number[][] {
  const r = rng(seed);
  const m: number[][] = [];
  for (let i = 0; i < n; i++) m.push(new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      let pr = density;
      if (type === "smallworld") {
        const ring = Math.min(Math.abs(i - j), n - Math.abs(i - j));
        pr = ring <= 2 ? 0.9 : density * 0.25;
      } else if (type === "scalefree") {
        pr = density * (1 / (1 + Math.abs(i - j) * 0.15)) * 2;
      } else if (type === "grid") {
        const ring = Math.min(Math.abs(i - j), n - Math.abs(i - j));
        pr = ring === 1 ? 0.95 : 0;
      }
      if (r() < pr) m[i][j] = 0.3 + r() * 0.7;
    }
  }
  return m;
}

function graphMetrics(m: number[][]): { meanDeg: number; clustering: number; path: number } {
  const n = m.length;
  let edges = 0;
  const deg: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      if (m[i][j] > 0) {
        edges++;
        deg[i]++;
      }
  const meanDeg = edges / n;
  let triClosed = 0;
  let triAll = 0;
  for (let i = 0; i < n; i++) {
    const nb: number[] = [];
    for (let j = 0; j < n; j++) if (m[i][j] > 0 || m[j][i] > 0) nb.push(j);
    for (let a = 0; a < nb.length; a++)
      for (let b = a + 1; b < nb.length; b++) {
        triAll++;
        if (m[nb[a]][nb[b]] > 0 || m[nb[b]][nb[a]] > 0) triClosed++;
      }
  }
  const clustering = triAll ? triClosed / triAll : 0;
  const path = meanDeg > 1 ? Math.log(n) / Math.log(meanDeg) : n;
  return { meanDeg, clustering, path };
}

const matrix: Activity = {
  slug: "connectivity-matrix",
  id: 12,
  title: "Connectivity matrix viewer & editor",
  group: "Connectivity",
  status: "beta",
  what: "Visualize the weight matrix and graph metrics for different network topologies.",
  outcome: "Inspect and compare the connectome of each network type directly.",
  tips: [
    "Bright cells are strong synapses; the diagonal is always empty (no self-loops).",
    "Small-world shows a bright band plus scattered long-range shortcuts.",
    "Use Regenerate to draw a fresh random instance of the same topology.",
  ],
  controls: [
    {
      key: "type",
      label: "Topology",
      type: "select",
      default: "smallworld",
      options: [
        { label: "Random", value: "random" },
        { label: "Small-world", value: "smallworld" },
        { label: "Scale-free", value: "scalefree" },
        { label: "Ring grid", value: "grid" },
      ],
    },
    { key: "density", label: "Density", type: "range", min: 0.02, max: 0.4, step: 0.02, default: 0.12 },
    { key: "seed", label: "Regenerate", type: "button", default: 1 },
  ],
  animated: false,
  init: () => ({}),
  draw: (d, s, p) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h, 1, 1);
    const n = 46;
    const m = buildMatrix(p.type, n, p.density, (p.seed || 1) * 9973);
    s.metrics = graphMetrics(m);
    heat(ctx, w, h, m, (v) => (v > 0 ? heatColor(0.3 + v * 0.6) : "#0a0f1e"));
    label(ctx, "pre \u2192 post weight matrix", 8, 14, "#cdd8f0", "10px ui-sans-serif");
  },
  readouts: (s) => {
    const mm = s.metrics || { meanDeg: 0, clustering: 0, path: 0 };
    return [
      { label: "Mean degree", value: fmt(mm.meanDeg, 1), accent: PAL.brand },
      { label: "Clustering", value: fmt(mm.clustering, 2) },
      { label: "Path length", value: fmt(mm.path, 2) },
    ];
  },
};

const gap: Activity = {
  slug: "gap-junctions",
  id: 15,
  title: "Gap junctions & electrical coupling",
  group: "Connectivity",
  status: "roadmap",
  what: "Two neurons joined by an electrical synapse, with synchrony rising as coupling grows.",
  outcome: "Explore a second, faster route to synchrony than chemical synapses.",
  tips: [
    "With zero coupling the two traces drift apart; raise it and they lock.",
    "Electrical coupling synchronizes fast \u2014 add it sparingly in real models.",
    "The sync index near 1 means the membranes track each other closely.",
  ],
  controls: [
    { key: "g", label: "Gap strength", type: "range", min: 0, max: 1, step: 0.02, default: 0.2 },
    { key: "I", label: "Input", type: "range", min: 4, max: 16, step: 0.5, default: 10 },
  ],
  animated: true,
  init: () => ({ a: { v: -65, u: -13 }, b: { v: -60, u: -12 }, ba: [], bb: [], sync: 0 }),
  step: (s, p) => {
    for (let k = 0; k < 2; k++) {
      const ia = p.I + p.g * (s.b.v - s.a.v) * 8 + (Math.random() - 0.5) * 2;
      const ib = p.I * 0.96 + p.g * (s.a.v - s.b.v) * 8 + (Math.random() - 0.5) * 2;
      izhStep(s.a, ia, IZH.rs, 0.5);
      izhStep(s.b, ib, IZH.rs, 0.5);
    }
    const diff = Math.abs(s.a.v - s.b.v);
    s.sync = s.sync * 0.95 + (1 - clamp(diff / 60, 0, 1)) * 0.05;
    pushCap(s.ba, s.a.v, 260);
    pushCap(s.bb, s.b.v, 260);
  },
  draw: (d, s) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    plot(ctx, w, h, s.ba, PAL.exc, { yMin: -90, yMax: 40, width: 1.6 });
    plot(ctx, w, h, s.bb, PAL.inh, { yMin: -90, yMax: 40, width: 1.6 });
    label(ctx, "neuron A", 10, 16, PAL.exc);
    label(ctx, "neuron B", 70, 16, PAL.inh);
  },
  readouts: (s) => [{ label: "Sync index", value: fmt(s.sync, 2), accent: PAL.good }],
};

const funcConn: Activity = {
  slug: "functional-connectivity",
  id: 29,
  title: "Functional connectivity matrix",
  group: "Connectivity",
  status: "live",
  what: "Pairwise correlation between assembly firing rates, revealing functional groups.",
  outcome: "Reveal the network's co-firing assemblies rather than its wiring.",
  tips: [
    "Bright off-diagonal blocks are assemblies that fire together.",
    "More assemblies create a clearer block structure.",
    "Functional connectivity can differ from the anatomical wiring.",
  ],
  controls: [
    { key: "assemblies", label: "Assemblies", type: "range", min: 1, max: 6, step: 1, default: 3 },
    { key: "strength", label: "Co-firing strength", type: "range", min: 0, max: 100, step: 1, default: 60 },
  ],
  animated: true,
  init: () => {
    const n = 24;
    return { n, rates: new Array(n).fill(0), hist: [], mat: [] };
  },
  step: (s, p, t) => {
    const n = s.n;
    const A = Math.max(1, Math.round(p.assemblies));
    const drive: number[] = [];
    for (let a = 0; a < A; a++) drive.push(Math.sin(t * 0.04 + a * 2) * 0.5 + 0.5);
    for (let i = 0; i < n; i++) {
      const a = Math.floor((i / n) * A);
      const common = drive[a] * (p.strength / 100);
      s.rates[i] = clamp(common + (1 - p.strength / 100) * Math.random(), 0, 1);
    }
    s.hist.push(s.rates.slice());
    if (s.hist.length > 80) s.hist.shift();
    if (t % 10 === 0 && s.hist.length > 10) {
      const mat: number[][] = [];
      for (let i = 0; i < n; i++) {
        mat.push(new Array(n).fill(0));
      }
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) mat[i][j] = corrSeries(s.hist, i, j);
      s.mat = mat;
    }
  },
  draw: (d, s) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h, 1, 1);
    if (!s.mat.length) return;
    heat(ctx, w, h, s.mat, (v) => heatColor(clamp((v + 1) / 2, 0, 1)));
    label(ctx, "rate\u2013rate correlation", 8, 14, "#cdd8f0", "10px ui-sans-serif");
  },
  readouts: (s, p) => [
    { label: "Neurons", value: fmt(s.n, 0) },
    { label: "Assemblies", value: fmt(p.assemblies, 0), accent: PAL.brand },
  ],
};

function corrSeries(hist: number[][], i: number, j: number): number {
  const n = hist.length;
  let mi = 0;
  let mj = 0;
  for (let t = 0; t < n; t++) {
    mi += hist[t][i];
    mj += hist[t][j];
  }
  mi /= n;
  mj /= n;
  let num = 0;
  let di = 0;
  let dj = 0;
  for (let t = 0; t < n; t++) {
    const a = hist[t][i] - mi;
    const b = hist[t][j] - mj;
    num += a * b;
    di += a * a;
    dj += b * b;
  }
  const den = Math.sqrt(di * dj) || 1;
  return num / den;
}

export const connectivityActivities: Activity[] = [matrix, gap, funcConn];
