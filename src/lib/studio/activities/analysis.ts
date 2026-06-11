import type { Activity, ActState, Params, DrawArgs } from "../types";
import {
  PAL,
  IZH,
  izhStep,
  frame,
  plot,
  bars,
  heat,
  scatter,
  label,
  fmt,
  mean,
  std,
  clamp,
  pushCap,
  heatColor,
  gauss,
} from "../kit";
import { welch } from "@/lib/dsp/fft";

// Synthetic local field potential built from the user's chosen rhythms.
function lfpSample(p: Params, t: number): number {
  const theta = (p.theta / 100) * Math.sin((2 * Math.PI * 6 * t) / 1000);
  const beta = (p.beta / 100) * Math.sin((2 * Math.PI * 22 * t) / 1000);
  const gamma = (p.gamma / 100) * Math.sin((2 * Math.PI * 42 * t) / 1000);
  const noise = (p.noise / 100) * gauss() * 0.6;
  return theta + beta + gamma + noise;
}

const spectrum: Activity = {
  slug: "power-spectrum",
  id: 28,
  title: "Power spectrum + peak detection",
  group: "Analysis",
  status: "live",
  what: "Welch power spectrum (0\u2013120 Hz) with automatic theta / beta / gamma peak detection.",
  outcome: "Read the frequency content of the network instantly.",
  tips: [
    "The dominant-Hz readout is just the tallest detected peak.",
    "Raise one band's slider and watch a sharp peak grow at its frequency.",
    "Broadband lift with no peak means the signal is noise-dominated.",
  ],
  controls: [
    { key: "theta", label: "Theta (6 Hz) power", type: "range", min: 0, max: 100, step: 1, default: 40 },
    { key: "beta", label: "Beta (22 Hz) power", type: "range", min: 0, max: 100, step: 1, default: 25 },
    { key: "gamma", label: "Gamma (42 Hz) power", type: "range", min: 0, max: 100, step: 1, default: 60 },
    { key: "noise", label: "Background noise", type: "range", min: 0, max: 100, step: 1, default: 20 },
  ],
  animated: true,
  init: () => ({ buf: [], freqs: [], power: [], peakHz: 0 }),
  step: (s, p, t) => {
    pushCap(s.buf, lfpSample(p, t), 512);
    if (t % 6 === 0 && s.buf.length >= 256) {
      const res = welch(s.buf, 1000, 256);
      s.freqs = res.freqs;
      s.power = res.power;
      let bi = 0;
      let bv = -1;
      for (let i = 0; i < res.power.length; i++) {
        if (res.freqs[i] <= 120 && res.power[i] > bv) {
          bv = res.power[i];
          bi = i;
        }
      }
      s.peakHz = res.freqs[bi] || 0;
    }
  },
  draw: (d, s) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    if (!s.power.length) return;
    const vals: number[] = [];
    for (let i = 0; i < s.freqs.length; i++) if (s.freqs[i] <= 120) vals.push(s.power[i]);
    bars(ctx, w, h, vals, (i: number) => heatColor(i / Math.max(1, vals.length)));
    label(ctx, "0 Hz", 6, h - 6, PAL.dim, "10px ui-sans-serif");
    label(ctx, "120 Hz", w - 6, h - 6, PAL.dim, "10px ui-sans-serif", "right");
    label(ctx, "peak \u2248 " + fmt(s.peakHz, 0) + " Hz", w - 6, 16, PAL.warn, "11px ui-sans-serif", "right");
  },
  readouts: (s) => [
    { label: "Dominant", value: fmt(s.peakHz, 0) + " Hz", accent: PAL.warn },
    { label: "Bins", value: fmt(s.freqs.length, 0) },
  ],
};

const spectrogram: Activity = {
  slug: "lfp-spectrogram",
  id: 6,
  title: "LFP spectrogram",
  group: "Analysis",
  status: "roadmap",
  what: "Time\u2013frequency view of the local field potential as it evolves.",
  outcome: "Catch transient bursts of rhythm that a static spectrum misses.",
  tips: [
    "Brighter rows are stronger frequencies; time runs left to right.",
    "Pulse a band slider up and down to paint a transient streak.",
    "Compare a steady gamma against a flickering one to see the difference.",
  ],
  controls: [
    { key: "theta", label: "Theta (6 Hz) power", type: "range", min: 0, max: 100, step: 1, default: 30 },
    { key: "beta", label: "Beta (22 Hz) power", type: "range", min: 0, max: 100, step: 1, default: 20 },
    { key: "gamma", label: "Gamma (42 Hz) power", type: "range", min: 0, max: 100, step: 1, default: 55 },
    { key: "noise", label: "Background noise", type: "range", min: 0, max: 100, step: 1, default: 25 },
  ],
  animated: true,
  init: () => ({ buf: [], cols: [] }),
  step: (s, p, t) => {
    pushCap(s.buf, lfpSample(p, t), 512);
    if (t % 8 === 0 && s.buf.length >= 256) {
      const res = welch(s.buf, 1000, 256);
      const col: number[] = [];
      for (let i = 0; i < res.freqs.length && res.freqs[i] <= 80; i++) col.push(res.power[i]);
      s.cols.push(col);
      if (s.cols.length > 120) s.cols.shift();
    }
  },
  draw: (d, s) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h, 1, 1);
    const cols = s.cols;
    if (!cols.length) return;
    let mx = 1e-6;
    for (const c of cols) for (const v of c) if (v > mx) mx = v;
    const bins = cols[0].length;
    const cw = w / cols.length;
    const ch = h / bins;
    for (let x = 0; x < cols.length; x++) {
      const c = cols[x];
      for (let f = 0; f < c.length; f++) {
        ctx.fillStyle = heatColor(Math.sqrt(c[f] / mx));
        ctx.fillRect(x * cw, h - (f + 1) * ch, cw + 1, ch + 1);
      }
    }
    label(ctx, "time \u2192", 8, h - 8, "#cdd8f0", "10px ui-sans-serif");
    label(ctx, "freq \u2191 (0\u201380 Hz)", 8, 16, "#cdd8f0", "10px ui-sans-serif");
  },
  readouts: (s) => [
    { label: "Columns", value: fmt(s.cols.length, 0) },
    { label: "Window", value: "256 samples" },
  ],
};

const crossCorr: Activity = {
  slug: "cross-correlation",
  id: 7,
  title: "Cross-correlation & coherence",
  group: "Analysis",
  status: "roadmap",
  what: "Cross-correlogram between two coupled signals, revealing lead/lag at each delay.",
  outcome: "Quantify who leads and who follows between two populations.",
  tips: [
    "A peak to the right of zero means signal A leads signal B.",
    "Stronger coupling raises the central peak.",
    "More noise flattens the correlogram toward zero.",
  ],
  controls: [
    { key: "coupling", label: "Coupling", type: "range", min: 0, max: 1, step: 0.02, default: 0.6 },
    { key: "lag", label: "True lag", type: "range", min: -20, max: 20, step: 1, default: 8, unit: " ms" },
    { key: "noise", label: "Noise", type: "range", min: 0, max: 100, step: 1, default: 30 },
  ],
  animated: true,
  init: () => ({ a: [], b: [], corr: [] }),
  step: (s, p, t) => {
    const drive = Math.sin(t * 0.12) + 0.5 * Math.sin(t * 0.05);
    pushCap(s.a, drive + (p.noise / 100) * gauss(), 256);
    const lag = Math.round(p.lag);
    const past = s.a.length - 1 - Math.abs(lag);
    const src = past >= 0 ? s.a[past] : 0;
    const bVal = p.coupling * (lag >= 0 ? src : drive) + (1 - p.coupling) * drive + (p.noise / 100) * gauss();
    pushCap(s.b, bVal, 256);
    if (t % 4 === 0 && s.a.length > 80) {
      const maxLag = 40;
      const out: number[] = [];
      const am = mean(s.a);
      const bm = mean(s.b);
      const as = std(s.a) || 1;
      const bs = std(s.b) || 1;
      const n = Math.min(s.a.length, s.b.length);
      for (let L = -maxLag; L <= maxLag; L++) {
        let acc = 0;
        let cnt = 0;
        for (let i = 0; i < n; i++) {
          const j = i + L;
          if (j < 0 || j >= n) continue;
          acc += (s.a[i] - am) * (s.b[j] - bm);
          cnt++;
        }
        out.push(cnt ? acc / cnt / (as * bs) : 0);
      }
      s.corr = out;
    }
  },
  draw: (d, s) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    if (!s.corr.length) return;
    const mid = (s.corr.length - 1) / 2;
    bars(ctx, w, h * 0.5 + h * 0.5, s.corr.map((v: number) => v + 1), (i: number) => (Math.abs(i - mid) < 0.5 ? PAL.warn : PAL.brand), 2);
    ctx.strokeStyle = PAL.axis;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    label(ctx, "lag 0", w / 2 + 4, 14, PAL.dim, "10px ui-sans-serif");
    label(ctx, "A leads \u2192", w - 6, 14, PAL.dim, "10px ui-sans-serif", "right");
  },
  readouts: (s) => {
    if (!s.corr.length) return [{ label: "Peak lag", value: "\u2014" }];
    let bi = 0;
    let bv = -2;
    for (let i = 0; i < s.corr.length; i++) if (s.corr[i] > bv) {
      bv = s.corr[i];
      bi = i;
    }
    const mid = (s.corr.length - 1) / 2;
    return [
      { label: "Peak lag", value: fmt(bi - mid, 0) + " ms", accent: PAL.warn },
      { label: "Peak corr", value: fmt(bv, 2) },
    ];
  },
};

const kuramoto: Activity = {
  slug: "synchrony-metrics",
  id: 8,
  title: "Synchrony metrics panel",
  group: "Analysis",
  status: "live",
  what: "A Kuramoto oscillator population with the order parameter as a live synchrony gauge.",
  outcome: "Measure coordination instead of guessing it.",
  tips: [
    "Order parameter R near 1 means the population fires in lockstep.",
    "Raise coupling K past the critical point to watch sudden synchronization.",
    "Frequency spread fights coupling \u2014 more spread needs more K.",
  ],
  controls: [
    { key: "K", label: "Coupling K", type: "range", min: 0, max: 4, step: 0.05, default: 1.4 },
    { key: "N", label: "Oscillators", type: "range", min: 12, max: 120, step: 4, default: 64 },
    { key: "spread", label: "Frequency spread", type: "range", min: 0, max: 100, step: 1, default: 30 },
  ],
  animated: true,
  init: (p: Params) => {
    const N = Math.round(p.N);
    const ph: number[] = [];
    const om: number[] = [];
    for (let i = 0; i < N; i++) {
      ph.push(Math.random() * 6.2832);
      om.push(0.1 + gauss() * 0.02 * (p.spread / 30 + 0.01));
    }
    return { ph, om, R: 0, psi: 0 };
  },
  step: (s, p) => {
    const N = Math.round(p.N);
    if (s.ph.length !== N) {
      const ph: number[] = [];
      const om: number[] = [];
      for (let i = 0; i < N; i++) {
        ph.push(Math.random() * 6.2832);
        om.push(0.1 + gauss() * 0.02 * (p.spread / 30 + 0.01));
      }
      s.ph = ph;
      s.om = om;
    }
    let sx = 0;
    let sy = 0;
    for (let i = 0; i < N; i++) {
      sx += Math.cos(s.ph[i]);
      sy += Math.sin(s.ph[i]);
    }
    sx /= N;
    sy /= N;
    const R = Math.sqrt(sx * sx + sy * sy);
    const psi = Math.atan2(sy, sx);
    s.R = R;
    s.psi = psi;
    for (let i = 0; i < N; i++) {
      s.ph[i] += s.om[i] + (p.K * R * Math.sin(psi - s.ph[i])) * 0.1 + gauss() * 0.01;
    }
  },
  draw: (d, s, p) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h, 1, 1);
    const cx = w / 2;
    const cy = h / 2;
    const rad = Math.min(w, h) * 0.38;
    ctx.strokeStyle = PAL.axis;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, 6.2832);
    ctx.stroke();
    const N = s.ph.length;
    for (let i = 0; i < N; i++) {
      const a = s.ph[i];
      ctx.fillStyle = heatColor(i / N);
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * rad, cy - Math.sin(a) * rad, 3, 0, 6.2832);
      ctx.fill();
    }
    ctx.strokeStyle = PAL.warn;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(s.psi) * rad * s.R, cy - Math.sin(s.psi) * rad * s.R);
    ctx.stroke();
    label(ctx, "R = " + fmt(s.R, 2), cx - 18, cy - rad - 8, PAL.warn, "12px ui-sans-serif");
  },
  readouts: (s, p) => [
    { label: "Order param R", value: fmt(s.R, 3), accent: PAL.warn },
    { label: "State", value: s.R > 0.7 ? "Synchronized" : s.R > 0.3 ? "Partial" : "Incoherent" },
    { label: "Coupling K", value: fmt(p.K, 2) },
  ],
};

const infoFlow: Activity = {
  slug: "information-dynamics",
  id: 9,
  title: "Information dynamics toolbox",
  group: "Analysis",
  status: "roadmap",
  what: "Directed influence estimate (lagged predictive gain) between two coupled populations.",
  outcome: "Measure how information moves through the network, not just that it correlates.",
  tips: [
    "The bars compare A\u2192B against B\u2192A directed influence.",
    "This is a fast lagged-prediction estimate, not full transfer entropy.",
    "Drive coupling one way and watch the asymmetry appear.",
  ],
  controls: [
    { key: "coupling", label: "A \u2192 B coupling", type: "range", min: 0, max: 1, step: 0.02, default: 0.7 },
    { key: "back", label: "B \u2192 A coupling", type: "range", min: 0, max: 1, step: 0.02, default: 0.1 },
    { key: "noise", label: "Noise", type: "range", min: 0, max: 100, step: 1, default: 30 },
  ],
  animated: true,
  init: () => ({ a: [], b: [], teAB: 0, teBA: 0, hist: [] }),
  step: (s, p, t) => {
    const pa = s.a.length ? s.a[s.a.length - 1] : 0;
    const pb = s.b.length ? s.b[s.b.length - 1] : 0;
    const na = 0.6 * pa + p.back * pb + Math.sin(t * 0.07) * 0.4 + (p.noise / 100) * gauss();
    const nb = 0.6 * pb + p.coupling * pa + (p.noise / 100) * gauss();
    pushCap(s.a, na, 200);
    pushCap(s.b, nb, 200);
    if (t % 6 === 0 && s.a.length > 40) {
      s.teAB = predGain(s.a, s.b);
      s.teBA = predGain(s.b, s.a);
      pushCap(s.hist, s.teAB - s.teBA, 120);
    }
  },
  draw: (d, s) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    const bw = w * 0.18;
    const maxv = Math.max(0.01, s.teAB, s.teBA);
    const hAB = (s.teAB / maxv) * (h - 40);
    const hBA = (s.teBA / maxv) * (h - 40);
    ctx.fillStyle = PAL.exc;
    ctx.fillRect(w * 0.22, h - 24 - hAB, bw, hAB);
    ctx.fillStyle = PAL.inh;
    ctx.fillRect(w * 0.6, h - 24 - hBA, bw, hBA);
    label(ctx, "A \u2192 B", w * 0.22, h - 8, PAL.exc, "11px ui-sans-serif");
    label(ctx, "B \u2192 A", w * 0.6, h - 8, PAL.inh, "11px ui-sans-serif");
    if (s.hist.length > 2) plot(ctx, w, h, s.hist, PAL.warn, { yMin: -maxv, yMax: maxv, width: 1.2 });
  },
  readouts: (s) => [
    { label: "A \u2192 B", value: fmt(s.teAB, 3), accent: PAL.exc },
    { label: "B \u2192 A", value: fmt(s.teBA, 3), accent: PAL.inh },
    { label: "Net flow", value: fmt(s.teAB - s.teBA, 3), accent: PAL.warn },
  ],
};

function predGain(src: number[], dst: number[]): number {
  const n = Math.min(src.length, dst.length);
  if (n < 20) return 0;
  let acc = 0;
  let cnt = 0;
  const dm = mean(dst);
  const sm = mean(src);
  const ds = std(dst) || 1;
  const ss = std(src) || 1;
  for (let i = 1; i < n; i++) {
    acc += ((src[i - 1] - sm) / ss) * ((dst[i] - dm) / ds);
    cnt++;
  }
  const r = cnt ? acc / cnt : 0;
  return Math.max(0, -0.5 * Math.log(1 - clamp(r * r, 0, 0.999)));
}

const burst: Activity = {
  slug: "burst-analysis",
  id: 17,
  title: "Burst analysis & detection",
  group: "Analysis",
  status: "beta",
  what: "Automatic burst detection on the population rate with duration and inter-burst interval.",
  outcome: "Quantify bursting rather than just seeing it.",
  tips: [
    "Shaded spans are detected bursts above the adaptive threshold.",
    "Raise burstiness to make bursts longer and more separated.",
    "The dashed line is the detection threshold (mean + k\u00b7sd).",
  ],
  controls: [
    { key: "burstiness", label: "Burstiness", type: "range", min: 0, max: 100, step: 1, default: 60 },
    { key: "rate", label: "Base rate", type: "range", min: 1, max: 12, step: 0.5, default: 5 },
    { key: "k", label: "Threshold k", type: "range", min: 0.5, max: 3, step: 0.1, default: 1.4 },
  ],
  animated: true,
  init: () => ({ buf: [], bursts: 0, inBurst: false, lastEnd: 0, ibi: 0 }),
  step: (s, p, t) => {
    const env = Math.max(0, Math.sin(t * 0.03 * (0.5 + p.burstiness / 100)));
    const drive = p.rate * (1 + (p.burstiness / 100) * 4 * Math.pow(env, 3));
    pushCap(s.buf, drive + Math.abs(gauss()) * 0.6, 260);
    if (s.buf.length > 30) {
      const m = mean(s.buf);
      const sd = std(s.buf);
      const thr = m + p.k * sd;
      const cur = s.buf[s.buf.length - 1] > thr;
      if (cur && !s.inBurst) {
        s.inBurst = true;
        s.bursts++;
        s.ibi = t - s.lastEnd;
      } else if (!cur && s.inBurst) {
        s.inBurst = false;
        s.lastEnd = t;
      }
      s.thr = thr;
    }
  },
  draw: (d, s) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    if (s.buf.length < 2) return;
    let mx = 1;
    for (const v of s.buf) if (v > mx) mx = v;
    if (s.thr) {
      const yy = (1 - s.thr / mx) * h;
      ctx.strokeStyle = PAL.warn;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(0, yy);
      ctx.lineTo(w, yy);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0; i < s.buf.length; i++) {
        if (s.buf[i] > s.thr) {
          const x = (i / (s.buf.length - 1)) * w;
          ctx.fillStyle = "rgba(255,93,115,0.16)";
          ctx.fillRect(x - 1, 0, 3, h);
        }
      }
    }
    plot(ctx, w, h, s.buf, PAL.good, { yMin: 0, yMax: mx, width: 1.8 });
  },
  readouts: (s) => [
    { label: "Bursts", value: fmt(s.bursts, 0), accent: PAL.exc },
    { label: "Inter-burst interval", value: fmt(s.ibi, 0) + " ms" },
    { label: "Status", value: s.inBurst ? "In burst" : "Quiet" },
  ],
};

const sta: Activity = {
  slug: "spike-triggered-average",
  id: 23,
  title: "Spike-triggered average",
  group: "Analysis",
  status: "roadmap",
  what: "The average input waveform preceding a neuron's spikes.",
  outcome: "Uncover the drive that reliably makes a neuron fire.",
  tips: [
    "The bump just before time zero is the feature that triggers spikes.",
    "More spikes average out the noise and sharpen the STA.",
    "A flat STA means firing is unrelated to the recent input.",
  ],
  controls: [
    { key: "drive", label: "Mean drive", type: "range", min: 2, max: 12, step: 0.5, default: 6 },
    { key: "feature", label: "Feature strength", type: "range", min: 0, max: 100, step: 1, default: 60 },
    { key: "noise", label: "Input noise", type: "range", min: 0, max: 100, step: 1, default: 40 },
  ],
  animated: true,
  init: () => ({ neuron: { v: -65, u: -13 }, inbuf: [], sta: new Array(60).fill(0), nspk: 0 }),
  step: (s, p, t) => {
    const feature = (p.feature / 100) * 5 * Math.exp(-Math.pow((t % 40) - 6, 2) / 20);
    const I = p.drive + feature + (p.noise / 100) * gauss() * 4;
    pushCap(s.inbuf, I, 80);
    let fired = false;
    for (let k = 0; k < 2; k++) if (izhStep(s.neuron, I, IZH.rs, 0.5)) fired = true;
    if (fired && s.inbuf.length >= 60) {
      const start = s.inbuf.length - 60;
      for (let i = 0; i < 60; i++) s.sta[i] = (s.sta[i] * s.nspk + s.inbuf[start + i]) / (s.nspk + 1);
      s.nspk++;
    }
  },
  draw: (d, s) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    plot(ctx, w, h, s.sta, PAL.brand, { width: 2 });
    ctx.strokeStyle = PAL.axis;
    ctx.beginPath();
    ctx.moveTo(w - 1, 0);
    ctx.lineTo(w - 1, h);
    ctx.stroke();
    label(ctx, "\u221260 ms", 6, 14, PAL.dim, "10px ui-sans-serif");
    label(ctx, "spike (t=0)", w - 6, 14, PAL.warn, "10px ui-sans-serif", "right");
  },
  readouts: (s) => [
    { label: "Spikes averaged", value: fmt(s.nspk, 0), accent: PAL.brand },
  ],
};

const dimred: Activity = {
  slug: "dimensionality-reduction",
  id: 24,
  title: "Dimensionality reduction",
  group: "Analysis",
  status: "roadmap",
  what: "A 2D projection of multi-group population activity, tracing a moving trajectory.",
  outcome: "View high-dimensional network activity as a single readable path.",
  tips: [
    "Loops in the trajectory are rhythms; tangles are chaotic activity.",
    "Points fade from old (dim) to new (bright) so you read direction.",
    "Raise coupling to collapse the cloud onto a low-dimensional orbit.",
  ],
  controls: [
    { key: "coupling", label: "Group coupling", type: "range", min: 0, max: 1, step: 0.02, default: 0.5 },
    { key: "noise", label: "Noise", type: "range", min: 0, max: 100, step: 1, default: 30 },
  ],
  animated: true,
  init: () => {
    const G = 8;
    const r: number[] = new Array(G).fill(0).map(() => Math.random());
    const px: number[] = [];
    const py: number[] = [];
    for (let i = 0; i < G; i++) {
      px.push(Math.cos((i / G) * 6.2832));
      py.push(Math.sin((i / G) * 6.2832 * 1.3));
    }
    return { r, px, py, trail: [] };
  },
  step: (s, p, t) => {
    const G = s.r.length;
    const m = mean(s.r);
    for (let i = 0; i < G; i++) {
      const drive = Math.sin(t * 0.05 + i) * 0.5 + 0.5;
      s.r[i] += 0.1 * (drive - s.r[i]) + p.coupling * 0.1 * (m - s.r[i]) + (p.noise / 100) * gauss() * 0.05;
      s.r[i] = clamp(s.r[i], 0, 1);
    }
    let x = 0;
    let y = 0;
    for (let i = 0; i < G; i++) {
      x += s.r[i] * s.px[i];
      y += s.r[i] * s.py[i];
    }
    s.trail.push({ x, y });
    if (s.trail.length > 200) s.trail.shift();
  },
  draw: (d, s) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h, 6, 6);
    const n = s.trail.length;
    const pts = s.trail.map((pt: any, i: number) => ({
      x: pt.x,
      y: pt.y,
      c: heatColor(i / Math.max(1, n)),
      r: 1.5 + 2 * (i / Math.max(1, n)),
    }));
    scatter(ctx, w, h, pts, { xMin: -3, xMax: 3, yMin: -3, yMax: 3 });
    label(ctx, "PC1 \u2192   PC2 \u2191", 8, h - 8, PAL.dim, "10px ui-sans-serif");
  },
  readouts: (s) => [{ label: "Groups", value: fmt(s.r.length, 0) }, { label: "Trail", value: fmt(s.trail.length, 0) }],
};

const prc: Activity = {
  slug: "phase-response-curve",
  id: 34,
  title: "Phase-response curve",
  group: "Analysis",
  status: "roadmap",
  what: "Phase shift produced by a perturbation delivered at each phase of the spike cycle.",
  outcome: "Predict whether two neurons will synchronize from their PRC shape.",
  tips: [
    "Positive shift = the spike is advanced; negative = delayed.",
    "A purely positive PRC (type I) synchronizes differently than a biphasic one.",
    "Bigger perturbations scale the whole curve up.",
  ],
  controls: [
    { key: "strength", label: "Perturbation", type: "range", min: 1, max: 12, step: 0.5, default: 6 },
    {
      key: "model",
      label: "Model",
      type: "select",
      default: "rs",
      options: [
        { label: "Regular spiking", value: "rs" },
        { label: "Fast spiking", value: "fs" },
        { label: "Low-threshold", value: "lts" },
      ],
    },
  ],
  animated: false,
  init: () => ({}),
  draw: (d, s, p) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    const model = IZH[p.model] || IZH.rs;
    const base = measurePeriod(model, 10, -1, 0);
    const curve: number[] = [];
    const M = 48;
    for (let i = 0; i < M; i++) {
      const phase = i / M;
      const per = measurePeriod(model, 10, phase, p.strength);
      curve.push((base - per) / base);
    }
    const mm = curve.reduce((a, b) => Math.max(a, Math.abs(b)), 0.01);
    ctx.strokeStyle = PAL.axis;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    plot(ctx, w, h, curve, PAL.good, { yMin: -mm, yMax: mm, width: 2 });
    label(ctx, "phase 0 \u2192 1", 8, h - 8, PAL.dim, "10px ui-sans-serif");
    label(ctx, "advance \u2191 / delay \u2193", 8, 16, PAL.dim, "10px ui-sans-serif");
  },
  readouts: (s, p) => [{ label: "Model", value: (IZH[p.model] || IZH.rs).label }],
};

function measurePeriod(model: any, I: number, phase: number, strength: number): number {
  const s = { v: -65, u: -13 };
  let spikes = 0;
  let firstAfter = -1;
  let injected = phase < 0;
  let approxPeriod = 0;
  let lastSpike = -1;
  for (let t = 0; t < 4000; t++) {
    const fired = izhStep(s, I, model, 0.5);
    if (fired) {
      spikes++;
      if (spikes === 2) lastSpike = t;
      if (spikes >= 2 && approxPeriod === 0 && spikes === 3) approxPeriod = t - lastSpike;
      if (spikes === 3) firstAfter = t;
    }
    if (!injected && spikes >= 2 && approxPeriod > 0) {
      const into = t - lastSpike;
      if (into / approxPeriod >= phase) {
        s.v += strength;
        injected = true;
      }
    }
    if (spikes >= 4) {
      return (t - firstAfter) || approxPeriod || 1;
    }
  }
  return approxPeriod || 1;
}

const fI: Activity = {
  slug: "transfer-function",
  id: 35,
  title: "Input-output transfer function",
  group: "Analysis",
  status: "beta",
  what: "Steady-state firing rate versus constant input current, with the linear range marked.",
  outcome: "Measure how a neuron converts input into output rate.",
  tips: [
    "The slope of the rising part is the neuron's gain.",
    "The flat tail is saturation; the flat start is the rheobase region.",
    "Fast-spiking cells have a steeper, higher f\u2013I curve.",
  ],
  controls: [
    {
      key: "model",
      label: "Model",
      type: "select",
      default: "rs",
      options: [
        { label: "Regular spiking", value: "rs" },
        { label: "Fast spiking", value: "fs" },
        { label: "Intrinsically bursting", value: "ib" },
        { label: "Low-threshold", value: "lts" },
      ],
    },
    { key: "maxI", label: "Max current", type: "range", min: 8, max: 30, step: 1, default: 20 },
  ],
  animated: false,
  init: () => ({}),
  draw: (d, s, p) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    const model = IZH[p.model] || IZH.rs;
    const M = 40;
    const curve: number[] = [];
    for (let i = 0; i < M; i++) {
      const I = (i / (M - 1)) * p.maxI;
      const st = { v: -65, u: -13 };
      let spk = 0;
      for (let t = 0; t < 2000; t++) if (izhStep(st, I, model, 0.5)) spk++;
      curve.push(spk / 1);
    }
    const mm = curve.reduce((a, b) => Math.max(a, b), 1);
    plot(ctx, w, h, curve, PAL.brand, { yMin: 0, yMax: mm, width: 2, fill: "rgba(110,168,255,0.12)" });
    label(ctx, "input current \u2192", 8, h - 8, PAL.dim, "10px ui-sans-serif");
    label(ctx, "firing rate \u2191", 8, 16, PAL.dim, "10px ui-sans-serif");
  },
  readouts: (s, p) => [{ label: "Model", value: (IZH[p.model] || IZH.rs).label }, { label: "Sweep", value: "40 points" }],
};

export const analysisActivities: Activity[] = [
  spectrum,
  spectrogram,
  crossCorr,
  kuramoto,
  infoFlow,
  burst,
  sta,
  dimred,
  prc,
  fI,
];
