import type { Activity, ActState, Params, DrawArgs } from "../types";
import {
  PAL,
  IZH,
  izhStep,
  frame,
  plot,
  label,
  fmt,
  clamp,
} from "../kit";
import { engineBus } from "../engineBus";

function ensurePop(s: ActState, N: number) {
  if (!s.pop || s.pop.length !== N) {
    s.pop = [];
    for (let i = 0; i < N; i++) {
      const exc = i % 5 !== 0;
      s.pop.push({ v: -65 + Math.random() * 6, u: -13, exc });
    }
    s.spikes = [];
  }
}

const raster: Activity = {
  slug: "enhanced-spike-raster",
  id: 4,
  title: "Enhanced spike raster",
  group: "Visualization",
  status: "live",
  what: "Spikes by neuron and time, colored by excitatory / inhibitory type, on a rolling window.",
  outcome: "Diagnose the whole network state at a single glance.",
  tips: [
    "Speckle = asynchronous, vertical bands = synchronized, diagonals = travelling waves.",
    "Push synchrony up to watch independent firing collapse into population bursts.",
    "Red dots are excitatory cells, blue are inhibitory.",
  ],
  controls: [
    { key: "window", label: "Window", type: "range", min: 100, max: 2000, step: 50, default: 500, unit: " ms" },
  ],
  animated: true,
  init: (p: Params) => {
    const s: ActState = {};
    ensurePop(s, Math.round(p.N));
    return s;
  },
  // Reads the shared engine: every spike in the live SNN flows in here so this
  // raster is a real view of the running network, not a synthetic demo.
  step: (s, _p, _t) => {
    s.spikes = engineBus.latest.recentSpikes;
  },
  draw: (d: DrawArgs, s, p) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h, 8, 6);
    const N = Math.max(1, engineBus.latest.N);
    const tNow = engineBus.latest.tMs;
    const winMs = Math.max(50, Number(p.window) || 500);
    const t0 = tNow - winMs;
    const spikes = engineBus.latest.recentSpikes;
    for (let k = 0; k < spikes.length; k++) {
      const sp = spikes[k];
      if (sp.tMs < t0) continue;
      const x = ((sp.tMs - t0) / winMs) * w;
      const y = (sp.i / N) * h;
      ctx.fillStyle = sp.exc ? PAL.exc : PAL.inh;
      ctx.fillRect(x, y, 2.2, 2.2);
    }
    label(ctx, "neuron \u2191   t (ms) \u2192", 8, h - 8, PAL.dim, "10px ui-sans-serif");
  },
  readouts: () => {
    const N = Math.max(1, engineBus.latest.N);
    const tNow = engineBus.latest.tMs;
    const winMs = 500;
    const t0 = tNow - winMs;
    let cnt = 0;
    let exc = 0;
    const spikes = engineBus.latest.recentSpikes;
    for (let k = 0; k < spikes.length; k++) {
      const sp = spikes[k];
      if (sp.tMs < t0) continue;
      cnt++;
      if (sp.exc) exc++;
    }
    const rate = cnt / N / (winMs / 1000);
    return [
      { label: "Spikes / window", value: fmt(cnt, 0), accent: PAL.brand },
      { label: "Mean rate", value: fmt(rate, 1) + " Hz" },
      { label: "Excitatory share", value: fmt(cnt ? (100 * exc) / cnt : 0, 0) + "%", accent: PAL.exc },
      { label: "Engine N", value: String(N) },
    ];
  },
};

const popRate: Activity = {
  slug: "population-firing-rate",
  id: 5,
  title: "Population firing rate",
  group: "Visualization",
  status: "live",
  what: "Excitatory, inhibitory and total population rates over time with smoothing.",
  outcome: "See the heartbeat of the whole network and how E and I chase each other.",
  tips: [
    "Watch the inhibitory (blue) trace lag the excitatory (red) one \u2014 that lag drives rhythms.",
    "Raise inhibition to damp runaway excitation.",
    "A flat total rate with oscillating E/I means tightly balanced dynamics.",
  ],
  controls: [
    { key: "smooth", label: "Smoothing", type: "range", min: 1, max: 20, step: 1, default: 6 },
  ],
  animated: true,
  init: (p: Params) => {
    const s: ActState = { e: [], i: [], tot: [], se: 0, si: 0, st: 0 };
    ensurePop(s, 160);
    return s;
  },
  // Reads firing rates directly from the shared live engine.
  step: (s, p) => {
    const eHz = engineBus.latest.eRateNow;
    const iHz = engineBus.latest.iRateNow;
    const a = 1 / Math.max(1, Number(p.smooth) || 6);
    s.se = s.se * (1 - a) + eHz * a;
    s.si = s.si * (1 - a) + iHz * a;
    s.st = s.st * (1 - a) + (eHz + iHz) * 0.5 * a;
    if (s.e.length > 600) {
      s.e.shift();
      s.i.shift();
      s.tot.shift();
    }
    s.e.push(s.se);
    s.i.push(s.si);
    s.tot.push(s.st);
  },
  draw: (d, s) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    let mx = 1;
    for (const v of s.e) if (v > mx) mx = v;
    for (const v of s.i) if (v > mx) mx = v;
    plot(ctx, w, h, s.tot, "#6ea8ff", { yMin: 0, yMax: mx, width: 1.2 });
    plot(ctx, w, h, s.e, PAL.exc, { yMin: 0, yMax: mx, width: 2 });
    plot(ctx, w, h, s.i, PAL.inh, { yMin: 0, yMax: mx, width: 2 });
    label(ctx, "excitatory", 10, 16, PAL.exc);
    label(ctx, "inhibitory", 84, 16, PAL.inh);
    label(ctx, "total", 162, 16, "#6ea8ff");
  },
  readouts: (s) => [
    { label: "Exc rate", value: fmt(s.se, 1) + " Hz", accent: PAL.exc },
    { label: "Inh rate", value: fmt(s.si, 1) + " Hz", accent: PAL.inh },
    { label: "E/I ratio", value: fmt(s.si > 0.1 ? s.se / s.si : 0, 2) },
  ],
};

const phasePlane: Activity = {
  slug: "phase-plane",
  id: 10,
  title: "Phase plane (single neuron)",
  group: "Visualization",
  status: "live",
  what: "Nullclines and the live (v, u) trajectory of one Izhikevich neuron.",
  outcome: "Build deep intuition for how a single neuron's state evolves and resets.",
  tips: [
    "The parabola is the v-nullcline; the straight line is the u-nullcline.",
    "Spikes appear as the trajectory shooting right then snapping back to reset.",
    "Switch models to see how bursting vs fast-spiking reshape the orbit.",
  ],
  controls: [
    {
      key: "model",
      label: "Neuron model",
      type: "select",
      default: "rs",
      options: [
        { label: "Regular spiking", value: "rs" },
        { label: "Intrinsically bursting", value: "ib" },
        { label: "Chattering", value: "ch" },
        { label: "Fast spiking", value: "fs" },
        { label: "Low-threshold", value: "lts" },
      ],
    },
    { key: "I", label: "Input current", type: "range", min: 0, max: 20, step: 0.5, default: 10 },
  ],
  animated: true,
  init: () => ({ v: -65, u: -13, trail: [], spikes: 0 }),
  step: (s, p) => {
    const model = IZH[p.model] || IZH.rs;
    for (let k = 0; k < 2; k++) {
      const fired = izhStep(s, p.I, model, 0.5);
      if (fired) s.spikes++;
    }
    s.trail.push({ v: s.v, u: s.u });
    if (s.trail.length > 360) s.trail.shift();
  },
  draw: (d, s, p) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    const model = IZH[p.model] || IZH.rs;
    const vMin = -80;
    const vMax = 30;
    const uMin = -22;
    const uMax = 8;
    const X = (v: number) => ((v - vMin) / (vMax - vMin)) * w;
    const Y = (u: number) => (1 - (u - uMin) / (uMax - uMin)) * h;
    ctx.strokeStyle = "#3a4a6a";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let v = vMin; v <= vMax; v += 1) {
      const u = 0.04 * v * v + 5 * v + 140 + p.I;
      const yy = Y(clamp(u, uMin, uMax));
      if (v === vMin) ctx.moveTo(X(v), yy);
      else ctx.lineTo(X(v), yy);
    }
    ctx.stroke();
    ctx.strokeStyle = "#8a6bcc";
    ctx.beginPath();
    ctx.moveTo(X(vMin), Y(model.b * vMin));
    ctx.lineTo(X(vMax), Y(model.b * vMax));
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < s.trail.length; i++) {
      const pt = s.trail[i];
      const xx = X(clamp(pt.v, vMin, vMax));
      const yy = Y(clamp(pt.u, uMin, uMax));
      if (i === 0) ctx.moveTo(xx, yy);
      else ctx.lineTo(xx, yy);
    }
    ctx.strokeStyle = PAL.good;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = PAL.warn;
    ctx.beginPath();
    ctx.arc(X(clamp(s.v, vMin, vMax)), Y(clamp(s.u, uMin, uMax)), 4, 0, 6.2832);
    ctx.fill();
    label(ctx, "v-nullcline", 10, 16, "#7f8ab0");
    label(ctx, "u-nullcline", 92, 16, "#8a6bcc");
    label(ctx, "membrane potential v \u2192", 10, h - 8, PAL.dim, "10px ui-sans-serif");
  },
  readouts: (s, p) => [
    { label: "Model", value: (IZH[p.model] || IZH.rs).label },
    { label: "v", value: fmt(s.v, 1) + " mV", accent: PAL.good },
    { label: "recovery u", value: fmt(s.u, 1) },
    { label: "Spikes", value: fmt(s.spikes, 0), accent: PAL.warn },
  ],
};

const twoComp: Activity = {
  slug: "multi-compartment",
  id: 16,
  title: "Multi-compartment neuron inspector",
  group: "Visualization",
  status: "roadmap",
  what: "Dendritic and somatic voltage for a two-compartment cell with adjustable coupling.",
  outcome: "See beyond the point-neuron abstraction as signals travel dendrite to soma.",
  tips: [
    "Compare soma (green) and dendrite (purple) traces to see propagation delay.",
    "Weak coupling isolates the compartments; strong coupling fuses them.",
    "Drive the dendrite and watch whether the soma reaches spike threshold.",
  ],
  controls: [
    { key: "coupling", label: "Dendrite\u2013soma coupling", type: "range", min: 0.02, max: 1, step: 0.02, default: 0.35 },
    { key: "input", label: "Dendritic input", type: "range", min: 0, max: 18, step: 0.5, default: 9 },
    { key: "tau", label: "Dendrite time constant", type: "range", min: 4, max: 40, step: 1, default: 16 },
  ],
  animated: true,
  init: () => ({ soma: { v: -65, u: -13 }, dend: -65, ts: [], td: [] }),
  step: (s, p) => {
    for (let k = 0; k < 2; k++) {
      s.dend += 0.5 * ((-(s.dend + 65)) / p.tau + p.input - p.coupling * (s.dend - s.soma.v));
      const Isoma = p.coupling * (s.dend - s.soma.v) * 6;
      izhStep(s.soma, Isoma, IZH.rs, 0.5);
    }
    if (s.ts.length > 280) {
      s.ts.shift();
      s.td.shift();
    }
    s.ts.push(s.soma.v);
    s.td.push(s.dend);
  },
  draw: (d, s) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    plot(ctx, w, h, s.td, PAL.purple, { yMin: -90, yMax: 40, width: 1.8 });
    plot(ctx, w, h, s.ts, PAL.good, { yMin: -90, yMax: 40, width: 1.8 });
    label(ctx, "soma", 10, 16, PAL.good);
    label(ctx, "dendrite", 60, 16, PAL.purple);
  },
  readouts: (s) => [
    { label: "Soma v", value: fmt(s.soma.v, 1) + " mV", accent: PAL.good },
    { label: "Dendrite v", value: fmt(s.dend, 1) + " mV", accent: PAL.purple },
  ],
};

export const visualizationActivities: Activity[] = [raster, popRate, phasePlane, twoComp];
