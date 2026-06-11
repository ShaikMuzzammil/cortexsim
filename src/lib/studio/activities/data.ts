import type { Activity, ActState, Params, DrawArgs } from "../types";
import { PAL, IZH, izhStep, frame, plot, label, fmt, clamp, pushCap } from "../kit";

const protocol: Activity = {
  slug: "protocol-scheduler",
  id: 21,
  title: "Experimental protocol scheduler",
  group: "Data & Protocols",
  status: "roadmap",
  what: "Design a timed stimulation sequence on a visual timeline with a moving playhead.",
  outcome: "Run reproducible, scripted experiments instead of ad-hoc poking.",
  tips: [
    "Toggle each event on to place it on the timeline at its time.",
    "Script a pulse then an inhibition to test a causal interaction.",
    "The yellow playhead loops, showing where the protocol currently is.",
  ],
  controls: [
    { key: "pulse", label: "Excitatory pulse @ 20%", type: "toggle", default: true },
    { key: "inhib", label: "Inhibition @ 50%", type: "toggle", default: true },
    { key: "ramp", label: "Ramp @ 75%", type: "toggle", default: false },
    { key: "dur", label: "Protocol length", type: "range", min: 2, max: 20, step: 1, default: 8, unit: " s" },
  ],
  animated: true,
  init: () => ({ play: 0 }),
  step: (s, p) => {
    s.play += 1 / (p.dur * 60);
    if (s.play > 1) s.play = 0;
  },
  draw: (d, s, p) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h, 10, 3);
    const lanes = [
      { on: p.pulse, at: 0.2, len: 0.06, color: PAL.exc, name: "Exc pulse" },
      { on: p.inhib, at: 0.5, len: 0.1, color: PAL.inh, name: "Inhibition" },
      { on: p.ramp, at: 0.75, len: 0.18, color: PAL.warn, name: "Ramp" },
    ];
    const laneH = h / 3;
    for (let i = 0; i < lanes.length; i++) {
      const ln = lanes[i];
      const y = i * laneH;
      ctx.fillStyle = "#0c1326";
      ctx.fillRect(0, y + 6, w, laneH - 12);
      if (ln.on) {
        ctx.fillStyle = ln.color;
        ctx.fillRect(ln.at * w, y + 6, Math.max(6, ln.len * w), laneH - 12);
      }
      label(ctx, ln.name, 8, y + laneH / 2 + 4, ln.on ? "#e6edff" : PAL.dim, "11px ui-sans-serif");
    }
    ctx.strokeStyle = PAL.warn;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.play * w, 0);
    ctx.lineTo(s.play * w, h);
    ctx.stroke();
  },
  readouts: (s, p) => {
    let n = 0;
    if (p.pulse) n++;
    if (p.inhib) n++;
    if (p.ramp) n++;
    return [
      { label: "Events", value: fmt(n, 0), accent: PAL.brand },
      { label: "Length", value: fmt(p.dur, 0) + " s" },
      { label: "Playhead", value: fmt(s.play * 100, 0) + "%", accent: PAL.warn },
    ];
  },
};

const calculator: Activity = {
  slug: "metric-calculator",
  id: 30,
  title: "Live equation & metric calculator",
  group: "Data & Protocols",
  status: "live",
  what: "Compute custom metrics like E/I ratio or synchrony\u00d7rate from live-ish inputs.",
  outcome: "Define and watch exactly the quantities you care about.",
  tips: [
    "Pick a metric, then move the input sliders to see it update.",
    "E/I ratio divides excitatory by inhibitory rate.",
    "Compose your own by reading the formula under the gauge.",
  ],
  controls: [
    {
      key: "metric",
      label: "Metric",
      type: "select",
      default: "ei",
      options: [
        { label: "E/I ratio", value: "ei" },
        { label: "Synchrony \u00d7 rate", value: "syncrate" },
        { label: "Net excitation", value: "net" },
      ],
    },
    { key: "exc", label: "Excitatory rate", type: "range", min: 0, max: 40, step: 1, default: 18, unit: " Hz" },
    { key: "inh", label: "Inhibitory rate", type: "range", min: 0, max: 40, step: 1, default: 12, unit: " Hz" },
    { key: "sync", label: "Synchrony", type: "range", min: 0, max: 100, step: 1, default: 40, unit: "%" },
  ],
  animated: false,
  init: () => ({}),
  draw: (d, s, p) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h, 1, 1);
    const val = calcMetric(p);
    const formula =
      p.metric === "ei" ? "excRate / (inhRate + 1)" : p.metric === "syncrate" ? "synchrony \u00d7 (excRate + inhRate)" : "excRate \u2212 inhRate";
    ctx.fillStyle = PAL.good;
    ctx.font = "bold 46px ui-sans-serif, system-ui";
    ctx.textAlign = "center";
    ctx.fillText(fmt(val, 2), w / 2, h / 2);
    ctx.font = "13px ui-mono, monospace";
    ctx.fillStyle = PAL.dim;
    ctx.fillText(formula, w / 2, h / 2 + 30);
    ctx.textAlign = "left";
  },
  readouts: (s, p) => [
    { label: "Result", value: fmt(calcMetric(p), 3), accent: PAL.good },
    { label: "Inputs", value: "E " + fmt(p.exc, 0) + " / I " + fmt(p.inh, 0) },
  ],
};

function calcMetric(p: Params): number {
  if (p.metric === "ei") return p.exc / (p.inh + 1);
  if (p.metric === "syncrate") return (p.sync / 100) * (p.exc + p.inh);
  return p.exc - p.inh;
}

const recorder: Activity = {
  slug: "data-recorder",
  id: 31,
  title: "Data recorder & report generator",
  group: "Data & Protocols",
  status: "live",
  what: "Schedule recording of a metric to a growing buffer and watch it fill in real time.",
  outcome: "Capture results continuously, ready to export to CSV / JSON or a report.",
  tips: [
    "The trace is the recorded signal; the bar shows buffer fill.",
    "A shorter interval captures finer detail but fills the buffer faster.",
    "In the full app this buffer exports straight to CSV, JSON or PDF.",
  ],
  controls: [
    { key: "interval", label: "Sample interval", type: "range", min: 1, max: 20, step: 1, default: 4, unit: " frames" },
    { key: "capacity", label: "Buffer capacity", type: "range", min: 100, max: 2000, step: 100, default: 600, unit: " rows" },
  ],
  animated: true,
  init: () => ({ buf: [], rows: 0 }),
  step: (s, p, t) => {
    if (t % Math.max(1, Math.round(p.interval)) === 0) {
      const v = 10 + 6 * Math.sin(t * 0.04) + 2 * Math.sin(t * 0.17);
      s.buf.push(v);
      s.rows++;
      if (s.buf.length > 280) s.buf.shift();
      if (s.rows > p.capacity) s.rows = p.capacity;
    }
  },
  draw: (d, s, p) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    plot(ctx, w, h - 14, s.buf, PAL.brand, { yMin: 0, yMax: 22, width: 1.8 });
    const fill = clamp(s.rows / p.capacity, 0, 1);
    ctx.fillStyle = "#142038";
    ctx.fillRect(0, h - 10, w, 10);
    ctx.fillStyle = fill > 0.9 ? PAL.exc : PAL.good;
    ctx.fillRect(0, h - 10, w * fill, 10);
    label(ctx, "recorded metric", 10, 16, PAL.brand, "10px ui-sans-serif");
  },
  readouts: (s, p) => [
    { label: "Rows captured", value: fmt(s.rows, 0), accent: PAL.brand },
    { label: "Buffer fill", value: fmt(clamp((s.rows / p.capacity) * 100, 0, 100), 0) + "%" },
  ],
};

const zoo: Activity = {
  slug: "model-zoo",
  id: 32,
  title: "Model zoo & preset manager",
  group: "Data & Protocols",
  status: "live",
  what: "Network archetypes \u2014 gamma, bursting, asynchronous, seizure \u2014 each with its own signature.",
  outcome: "Reach any dynamical regime in a single click, then tune from there.",
  tips: [
    "Each preset loads parameters that produce a recognisable raster.",
    "Start from the closest preset, then change one slider at a time.",
    "Seizure-like presets are dense vertical bands; asynchronous is speckle.",
  ],
  controls: [
    {
      key: "preset",
      label: "Archetype",
      type: "select",
      default: "gamma",
      options: [
        { label: "Gamma oscillation", value: "gamma" },
        { label: "Bursting", value: "burst" },
        { label: "Asynchronous", value: "async" },
        { label: "Seizure-like", value: "seizure" },
      ],
    },
  ],
  animated: true,
  init: () => {
    const N = 90;
    const pop: any[] = [];
    for (let i = 0; i < N; i++) pop.push({ v: -65 + Math.random() * 6, u: -13, exc: i % 5 !== 0 });
    return { pop, spikes: [] };
  },
  step: (s, p, t) => {
    const cfg = presetCfg(p.preset, t);
    const N = s.pop.length;
    for (let i = 0; i < N; i++) {
      const nrn = s.pop[i];
      const model = nrn.exc ? (cfg.bursty ? IZH.ib : IZH.rs) : IZH.fs;
      const I = cfg.drive + cfg.osc + (Math.random() - 0.5) * cfg.noise;
      const f1 = izhStep(nrn, I, model, 0.5);
      const f2 = izhStep(nrn, I, model, 0.5);
      if (f1 || f2) s.spikes.push({ t, i, exc: nrn.exc });
    }
    while (s.spikes.length && s.spikes[0].t < t - 220) s.spikes.shift();
  },
  draw: (d, s, p) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h, 8, 6);
    const W = 200;
    const x0 = (s.spikes.length ? s.spikes[s.spikes.length - 1].t : 0) - W;
    const N = s.pop.length;
    for (const sp of s.spikes) {
      if (sp.t < x0) continue;
      const x = ((sp.t - x0) / W) * w;
      const y = (sp.i / N) * h;
      ctx.fillStyle = sp.exc ? PAL.exc : PAL.inh;
      ctx.fillRect(x, y, 2.4, 2.4);
    }
    label(ctx, p.preset + " signature", 8, 14, "#cdd8f0", "10px ui-sans-serif");
  },
  readouts: (s, p) => [
    { label: "Preset", value: String(p.preset) },
    { label: "Spikes / window", value: fmt(s.spikes.length, 0), accent: PAL.brand },
  ],
};

function presetCfg(preset: string, t: number): { drive: number; osc: number; noise: number; bursty: boolean } {
  if (preset === "gamma") return { drive: 6, osc: 3 * Math.sin(t * 0.25), noise: 4, bursty: false };
  if (preset === "burst") return { drive: 5, osc: 4 * Math.max(0, Math.sin(t * 0.03)), noise: 3, bursty: true };
  if (preset === "seizure") return { drive: 11, osc: 5 * Math.sin(t * 0.12), noise: 2, bursty: false };
  return { drive: 6, osc: 0, noise: 9, bursty: false };
}

export const dataActivities: Activity[] = [protocol, calculator, recorder, zoo];
