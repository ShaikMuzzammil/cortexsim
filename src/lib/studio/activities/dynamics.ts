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
  mean,
  pushCap,
  gauss,
} from "../kit";

const paramExplorer: Activity = {
  slug: "parameter-space-explorer",
  id: 2,
  title: "Parameter space explorer",
  group: "Dynamics & Learning",
  status: "live",
  what: "Sweep one parameter across a range and plot the resulting firing rate as a curve.",
  outcome: "Find the parameter region that produces the behaviour you want.",
  tips: [
    "Each point runs a short simulation, so the curve maps cause to effect.",
    "Look for steep sections \u2014 those are sensitive operating points.",
    "Switch the swept parameter to compare what the network cares about.",
  ],
  controls: [
    {
      key: "param",
      label: "Sweep parameter",
      type: "select",
      default: "drive",
      options: [
        { label: "Input drive", value: "drive" },
        { label: "Inhibition gain", value: "inh" },
      ],
    },
    { key: "res", label: "Resolution", type: "range", min: 10, max: 40, step: 2, default: 24 },
  ],
  animated: false,
  init: () => ({}),
  draw: (d, s, p) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    const M = Math.round(p.res);
    const curve: number[] = [];
    for (let i = 0; i < M; i++) {
      const val = (i / (M - 1)) * (p.param === "drive" ? 13 : 3);
      curve.push(runRate(p.param, val));
    }
    const mm = curve.reduce((a, b) => Math.max(a, b), 1);
    plot(ctx, w, h, curve, PAL.brand, { yMin: 0, yMax: mm, width: 2, fill: "rgba(110,168,255,0.12)" });
    label(ctx, (p.param === "drive" ? "input drive" : "inhibition gain") + " \u2192", 8, h - 8, PAL.dim, "10px ui-sans-serif");
    label(ctx, "mean rate \u2191", 8, 16, PAL.dim, "10px ui-sans-serif");
  },
  readouts: (s, p) => [{ label: "Sweeping", value: p.param === "drive" ? "Input drive" : "Inhibition" }, { label: "Points", value: fmt(p.res, 0) }],
};

function runRate(param: string, val: number): number {
  const N = 50;
  const pop: any[] = [];
  for (let i = 0; i < N; i++) pop.push({ v: -65 + Math.random() * 6, u: -13, exc: i % 5 !== 0 });
  let spk = 0;
  const drive = param === "drive" ? val : 7;
  const inh = param === "inh" ? val : 1.2;
  for (let t = 0; t < 160; t++) {
    for (let i = 0; i < N; i++) {
      const nrn = pop[i];
      const gain = nrn.exc ? 1 : inh;
      const I = drive * gain + (Math.random() - 0.5) * 5;
      if (izhStep(nrn, I, nrn.exc ? IZH.rs : IZH.fs, 0.5)) spk++;
      if (izhStep(nrn, I, nrn.exc ? IZH.rs : IZH.fs, 0.5)) spk++;
    }
  }
  return spk / N / 0.16;
}

const clamp_: Activity = {
  slug: "dynamic-clamp",
  id: 3,
  title: "Dynamic clamp & input injector",
  group: "Dynamics & Learning",
  status: "live",
  what: "Inject sine, pulse, ramp or noise current into a neuron and watch its membrane response.",
  outcome: "Probe how a cell reacts to controlled stimulation.",
  tips: [
    "Green is the membrane voltage; orange is the injected current.",
    "A sine near the neuron's natural rate produces clean entrainment.",
    "Short pulses reveal the impulse response; ramps reveal the threshold.",
  ],
  controls: [
    {
      key: "wave",
      label: "Waveform",
      type: "select",
      default: "sine",
      options: [
        { label: "Sine", value: "sine" },
        { label: "Pulse train", value: "pulse" },
        { label: "Ramp", value: "ramp" },
        { label: "Noise", value: "noise" },
      ],
    },
    { key: "amp", label: "Amplitude", type: "range", min: 1, max: 18, step: 0.5, default: 9 },
    { key: "freq", label: "Frequency", type: "range", min: 1, max: 30, step: 1, default: 8, unit: " Hz" },
  ],
  animated: true,
  init: () => ({ neuron: { v: -65, u: -13 }, vbuf: [], ibuf: [], spikes: 0 }),
  step: (s, p, t) => {
    let I = 0;
    const ph = (2 * Math.PI * p.freq * t) / 1000;
    if (p.wave === "sine") I = p.amp * (0.5 + 0.5 * Math.sin(ph));
    else if (p.wave === "pulse") I = (t % Math.max(4, Math.round(1000 / p.freq))) < 6 ? p.amp : 0;
    else if (p.wave === "ramp") I = p.amp * ((t % 200) / 200);
    else I = p.amp * (0.5 + 0.5 * gauss());
    for (let k = 0; k < 2; k++) if (izhStep(s.neuron, I, IZH.rs, 0.5)) s.spikes++;
    pushCap(s.vbuf, s.neuron.v, 260);
    pushCap(s.ibuf, I, 260);
  },
  draw: (d, s) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    plot(ctx, w, h, s.ibuf, PAL.warn, { yMin: -2, yMax: 20, width: 1.2 });
    plot(ctx, w, h, s.vbuf, PAL.good, { yMin: -90, yMax: 40, width: 1.8 });
    label(ctx, "voltage", 10, 16, PAL.good);
    label(ctx, "injected current", 64, 16, PAL.warn);
  },
  readouts: (s) => [{ label: "Spikes", value: fmt(s.spikes, 0), accent: PAL.good }, { label: "v", value: fmt(s.neuron.v, 1) + " mV" }],
};

const bifurcation: Activity = {
  slug: "bifurcation-explorer",
  id: 11,
  title: "Bifurcation diagram explorer",
  group: "Dynamics & Learning",
  status: "roadmap",
  what: "Sweep the input current and plot the inter-spike intervals at each value.",
  outcome: "Map the boundaries between resting, tonic and bursting regimes.",
  tips: [
    "A single dot per column = regular tonic firing.",
    "Several dots stacked = bursting or irregular firing.",
    "Sudden jumps between bands are bifurcations.",
  ],
  controls: [
    {
      key: "model",
      label: "Model",
      type: "select",
      default: "ib",
      options: [
        { label: "Intrinsically bursting", value: "ib" },
        { label: "Chattering", value: "ch" },
        { label: "Regular spiking", value: "rs" },
      ],
    },
    { key: "maxI", label: "Max current", type: "range", min: 8, max: 26, step: 1, default: 18 },
  ],
  animated: false,
  init: () => ({}),
  draw: (d, s, p) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    const model = IZH[p.model] || IZH.ib;
    const cols = 90;
    for (let c = 0; c < cols; c++) {
      const I = (c / (cols - 1)) * p.maxI;
      const st = { v: -65, u: -13 };
      const isis: number[] = [];
      let last = -1;
      for (let t = 0; t < 2600; t++) {
        if (izhStep(st, I, model, 0.5)) {
          if (last >= 0 && t > 800) isis.push(t - last);
          last = t;
        }
      }
      const x = (c / (cols - 1)) * w;
      for (const isi of isis) {
        const y = h - clamp(isi / 200, 0, 1) * h;
        ctx.fillStyle = "rgba(110,168,255,0.65)";
        ctx.fillRect(x, y, 1.6, 1.6);
      }
    }
    label(ctx, "input current \u2192", 8, h - 8, PAL.dim, "10px ui-sans-serif");
    label(ctx, "inter-spike interval \u2191", 8, 16, PAL.dim, "10px ui-sans-serif");
  },
  readouts: (s, p) => [{ label: "Model", value: (IZH[p.model] || IZH.ib).label }],
};

const stdp: Activity = {
  slug: "stdp-learning",
  id: 13,
  title: "STDP learning curve visualiser",
  group: "Dynamics & Learning",
  status: "live",
  what: "The spike-timing-dependent plasticity window and a sample synapse's weight over time.",
  outcome: "Watch the network learn in real time and see the rule that drives it.",
  tips: [
    "The top curve is the STDP window: pre-before-post potentiates, the reverse depresses.",
    "Lower the learning rate if the weight runs away to the bounds.",
    "A longer tau widens the timing window that counts as 'coincident'.",
  ],
  controls: [
    { key: "aPlus", label: "Potentiation A+", type: "range", min: 0, max: 1, step: 0.02, default: 0.5 },
    { key: "aMinus", label: "Depression A-", type: "range", min: 0, max: 1, step: 0.02, default: 0.52 },
    { key: "tau", label: "Window tau", type: "range", min: 5, max: 40, step: 1, default: 20, unit: " ms" },
  ],
  animated: true,
  init: () => ({ wbuf: [0.5], w: 0.5 }),
  step: (s, p) => {
    const dt = (Math.random() - 0.5) * 60;
    const dw = dt > 0 ? p.aPlus * Math.exp(-dt / p.tau) : -p.aMinus * Math.exp(dt / p.tau);
    s.w = clamp(s.w + dw * 0.05, 0, 1);
    pushCap(s.wbuf, s.w, 260);
  },
  draw: (d, s, p) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    const top = h * 0.46;
    ctx.strokeStyle = PAL.axis;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, top);
    ctx.moveTo(0, top / 2);
    ctx.lineTo(w, top / 2);
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const dt = (i / 80) * 80 - 40;
      const val = dt > 0 ? p.aPlus * Math.exp(-dt / p.tau) : -p.aMinus * Math.exp(dt / p.tau);
      const x = (i / 80) * w;
      const y = top / 2 - (val / 1) * (top / 2 - 4);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = PAL.purple;
    ctx.lineWidth = 2;
    ctx.stroke();
    label(ctx, "STDP window (\u0394t pre\u2013post)", 8, 14, PAL.purple, "10px ui-sans-serif");
    ctx.save();
    ctx.translate(0, top);
    plot(ctx, w, h - top, s.wbuf, PAL.good, { yMin: 0, yMax: 1, width: 2 });
    ctx.restore();
    label(ctx, "synaptic weight", 8, top + 14, PAL.good, "10px ui-sans-serif");
  },
  readouts: (s) => [{ label: "Weight", value: fmt(s.w, 3), accent: PAL.good }],
};

const homeo: Activity = {
  slug: "homeostatic-scaling",
  id: 14,
  title: "Homeostatic scaling panel",
  group: "Dynamics & Learning",
  status: "roadmap",
  what: "A neuron's rate driven back toward a target by multiplicative synaptic scaling.",
  outcome: "Keep a plastic network stable over long runs.",
  tips: [
    "The green trace is the rate; the dashed line is your target.",
    "A gentle time constant scales slowly without fighting fast dynamics.",
    "Purple is the synaptic gain the controller is adjusting.",
  ],
  controls: [
    { key: "target", label: "Target rate", type: "range", min: 2, max: 20, step: 1, default: 10, unit: " Hz" },
    { key: "tau", label: "Scaling tau", type: "range", min: 5, max: 60, step: 1, default: 25 },
  ],
  animated: true,
  init: () => ({ rate: 4, gain: 1, rbuf: [], gbuf: [] }),
  step: (s, p, t) => {
    const intrinsic = 6 + 5 * Math.sin(t * 0.02);
    s.rate = s.rate * 0.9 + intrinsic * s.gain * 0.1;
    s.gain += ((p.target - s.rate) / p.target) * (1 / p.tau);
    s.gain = clamp(s.gain, 0.1, 3);
    pushCap(s.rbuf, s.rate, 280);
    pushCap(s.gbuf, s.gain * 8, 280);
  },
  draw: (d, s, p) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    const yMax = 24;
    const ty = (1 - p.target / yMax) * h;
    ctx.strokeStyle = PAL.warn;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(0, ty);
    ctx.lineTo(w, ty);
    ctx.stroke();
    ctx.setLineDash([]);
    plot(ctx, w, h, s.gbuf, PAL.purple, { yMin: 0, yMax, width: 1.2 });
    plot(ctx, w, h, s.rbuf, PAL.good, { yMin: 0, yMax, width: 2 });
    label(ctx, "rate", 10, 16, PAL.good);
    label(ctx, "synaptic gain", 48, 16, PAL.purple);
  },
  readouts: (s, p) => [
    { label: "Rate", value: fmt(s.rate, 1) + " Hz", accent: PAL.good },
    { label: "Target", value: fmt(p.target, 0) + " Hz", accent: PAL.warn },
    { label: "Gain", value: fmt(s.gain, 2), accent: PAL.purple },
  ],
};

const customModel: Activity = {
  slug: "custom-model-editor",
  id: 20,
  title: "Custom model editor",
  group: "Dynamics & Learning",
  status: "live",
  what: "Tune the Izhikevich a, b, c, d parameters live and watch the spike pattern reshape.",
  outcome: "Experiment with neuron models without writing any code.",
  tips: [
    "Raise d for stronger spike-frequency adaptation and bursting.",
    "Lower a to slow the recovery variable and widen bursts.",
    "Set c less negative for chattering-style fast bursts.",
  ],
  controls: [
    { key: "a", label: "a (recovery speed)", type: "range", min: 0.01, max: 0.12, step: 0.005, default: 0.02 },
    { key: "b", label: "b (sensitivity)", type: "range", min: 0.1, max: 0.3, step: 0.01, default: 0.2 },
    { key: "c", label: "c (reset v)", type: "range", min: -70, max: -45, step: 1, default: -65 },
    { key: "dd", label: "d (reset jump)", type: "range", min: 0.5, max: 10, step: 0.5, default: 8 },
    { key: "I", label: "Input", type: "range", min: 2, max: 20, step: 0.5, default: 10 },
  ],
  animated: true,
  init: () => ({ v: -65, u: -13, buf: [], spikes: 0 }),
  step: (s, p) => {
    const model = { a: p.a, b: p.b, c: p.c, d: p.dd };
    for (let k = 0; k < 2; k++) if (izhStep(s, p.I, model, 0.5)) s.spikes++;
    pushCap(s.buf, s.v, 280);
  },
  draw: (d, s) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    plot(ctx, w, h, s.buf, PAL.brand, { yMin: -90, yMax: 40, width: 1.8 });
    label(ctx, "membrane voltage", 10, 16, PAL.brand, "10px ui-sans-serif");
  },
  readouts: (s) => [{ label: "Spikes", value: fmt(s.spikes, 0), accent: PAL.brand }, { label: "v", value: fmt(s.v, 1) + " mV" }],
};

const noise: Activity = {
  slug: "noise-config",
  id: 22,
  title: "Noise & stochasticity configuration",
  group: "Dynamics & Learning",
  status: "beta",
  what: "White, colored (Ornstein-Uhlenbeck) and frozen noise injected into a membrane.",
  outcome: "Add realistic variability and see how its colour changes the dynamics.",
  tips: [
    "White noise is jagged; colored noise is smooth and correlated.",
    "Longer correlation time makes excursions last longer.",
    "The histogram on the right shows the noise distribution.",
  ],
  controls: [
    {
      key: "type",
      label: "Noise type",
      type: "select",
      default: "ou",
      options: [
        { label: "White", value: "white" },
        { label: "Colored (OU)", value: "ou" },
      ],
    },
    { key: "sigma", label: "Amplitude", type: "range", min: 0, max: 100, step: 1, default: 50 },
    { key: "tau", label: "Correlation time", type: "range", min: 1, max: 40, step: 1, default: 12 },
  ],
  animated: true,
  init: () => ({ x: 0, buf: [], hist: new Array(28).fill(0) }),
  step: (s, p) => {
    const sig = p.sigma / 25;
    if (p.type === "white") s.x = gauss() * sig;
    else s.x += (-s.x / p.tau + gauss() * sig * 0.6);
    pushCap(s.buf, s.x, 260);
    const bin = clamp(Math.floor((s.x / 8 + 0.5) * 28), 0, 27);
    s.hist[bin] += 1;
  },
  draw: (d, s) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    const split = w * 0.68;
    ctx.save();
    plot(ctx, split, h, s.buf, PAL.brand, { yMin: -8, yMax: 8, width: 1.4 });
    ctx.restore();
    ctx.strokeStyle = PAL.axis;
    ctx.beginPath();
    ctx.moveTo(split, 0);
    ctx.lineTo(split, h);
    ctx.stroke();
    let mx = 1;
    for (const v of s.hist) if (v > mx) mx = v;
    const bw = (w - split) / s.hist.length;
    for (let i = 0; i < s.hist.length; i++) {
      const bh = (s.hist[i] / mx) * (h - 8);
      ctx.fillStyle = PAL.purple;
      ctx.fillRect(split + i * bw + 1, h - bh, bw - 1, bh);
    }
    label(ctx, "trace", 10, 16, PAL.brand, "10px ui-sans-serif");
    label(ctx, "distribution", split + 6, 16, PAL.purple, "10px ui-sans-serif");
  },
  readouts: (s) => [{ label: "Value", value: fmt(s.x, 2), accent: PAL.brand }],
};

const attractor: Activity = {
  slug: "attractor-landscape",
  id: 25,
  title: "Attractor landscape viewer",
  group: "Dynamics & Learning",
  status: "roadmap",
  what: "A mean-field energy landscape showing fixed points and the basin the state falls into.",
  outcome: "See the network's stable states as a terrain with a rolling ball.",
  tips: [
    "The ball rolls downhill into the nearest well \u2014 a stable state.",
    "Bias the input to tilt the landscape and flip between up and down states.",
    "Two wells of equal depth give bistability; one deep well is monostable.",
  ],
  controls: [
    { key: "bias", label: "Input bias", type: "range", min: -1, max: 1, step: 0.05, default: 0 },
    { key: "noise", label: "Noise", type: "range", min: 0, max: 100, step: 1, default: 20 },
  ],
  animated: true,
  init: () => ({ x: 0.2, v: 0 }),
  step: (s, p) => {
    const force = -(s.x * s.x * s.x - s.x) + p.bias;
    s.v = s.v * 0.8 + force * 0.05 + (p.noise / 100) * gauss() * 0.05;
    s.x = clamp(s.x + s.v, -1.6, 1.6);
  },
  draw: (d, s, p) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    const X = (x: number) => ((x + 1.6) / 3.2) * w;
    const U = (x: number) => (x * x * x * x) / 4 - (x * x) / 2 - p.bias * x;
    let umin = 1e9;
    let umax = -1e9;
    for (let i = 0; i <= 120; i++) {
      const x = -1.6 + (i / 120) * 3.2;
      const u = U(x);
      if (u < umin) umin = u;
      if (u > umax) umax = u;
    }
    const Y = (u: number) => 12 + (1 - (u - umin) / (umax - umin || 1)) * (h - 40);
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const x = -1.6 + (i / 120) * 3.2;
      const yy = Y(U(x));
      if (i === 0) ctx.moveTo(X(x), yy);
      else ctx.lineTo(X(x), yy);
    }
    ctx.strokeStyle = PAL.brand;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = PAL.warn;
    ctx.beginPath();
    ctx.arc(X(s.x), Y(U(s.x)) - 5, 6, 0, 6.2832);
    ctx.fill();
    label(ctx, "state x \u2192", 8, h - 8, PAL.dim, "10px ui-sans-serif");
    label(ctx, "energy \u2191", 8, 16, PAL.dim, "10px ui-sans-serif");
  },
  readouts: (s) => [
    { label: "State", value: fmt(s.x, 2), accent: PAL.warn },
    { label: "Basin", value: s.x > 0 ? "Up state" : "Down state" },
  ],
};

const eiController: Activity = {
  slug: "ei-ratio-controller",
  id: 26,
  title: "E/I ratio controller",
  group: "Dynamics & Learning",
  status: "beta",
  what: "A PI controller that adjusts inhibition to hold the excitation/inhibition ratio at a target.",
  outcome: "Maintain a precise E/I balance automatically while you change other things.",
  tips: [
    "The green trace is the live ratio; the dashed line is your target.",
    "Raise the controller gain for faster correction \u2014 but watch for overshoot.",
    "This is the kind of loop that keeps cortical networks from runaway excitation.",
  ],
  controls: [
    { key: "target", label: "Target E/I", type: "range", min: 1, max: 6, step: 0.1, default: 4 },
    { key: "kp", label: "Controller gain", type: "range", min: 0.01, max: 0.4, step: 0.01, default: 0.12 },
    { key: "disturb", label: "Disturbance", type: "range", min: 0, max: 100, step: 1, default: 25 },
  ],
  animated: true,
  init: () => ({ inhG: 1, ratio: 4, buf: [], integ: 0 }),
  step: (s, p, t) => {
    const excDrive = 8 + (p.disturb / 100) * 4 * Math.sin(t * 0.03);
    s.ratio = excDrive / (s.inhG * 2 + 0.2);
    const err = p.target - s.ratio;
    s.integ = clamp(s.integ + err * 0.01, -4, 4);
    s.inhG = clamp(s.inhG - (p.kp * err + 0.02 * s.integ) * 0.3, 0.1, 4);
    pushCap(s.buf, s.ratio, 280);
  },
  draw: (d, s, p) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    const yMax = 8;
    const ty = (1 - p.target / yMax) * h;
    ctx.strokeStyle = PAL.warn;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(0, ty);
    ctx.lineTo(w, ty);
    ctx.stroke();
    ctx.setLineDash([]);
    plot(ctx, w, h, s.buf, PAL.good, { yMin: 0, yMax, width: 2 });
    label(ctx, "E/I ratio", 10, 16, PAL.good, "10px ui-sans-serif");
  },
  readouts: (s, p) => [
    { label: "E/I ratio", value: fmt(s.ratio, 2), accent: PAL.good },
    { label: "Target", value: fmt(p.target, 1), accent: PAL.warn },
    { label: "Inh gain", value: fmt(s.inhG, 2) },
  ],
};

const kinetics: Activity = {
  slug: "synaptic-kinetics",
  id: 27,
  title: "Synaptic kinetics editor",
  group: "Dynamics & Learning",
  status: "beta",
  what: "Independent AMPA / NMDA / GABA rise and decay times and the post-synaptic potential they produce.",
  outcome: "Tune the synaptic basis of network rhythms.",
  tips: [
    "Faster inhibition (GABA) sharpens gamma; slower inhibition lowers its frequency.",
    "NMDA's slow tail integrates inputs over tens of milliseconds.",
    "The PSP is the difference of two exponentials: rise then decay.",
  ],
  controls: [
    { key: "ampa", label: "AMPA decay", type: "range", min: 1, max: 20, step: 1, default: 5, unit: " ms" },
    { key: "nmda", label: "NMDA decay", type: "range", min: 20, max: 150, step: 5, default: 80, unit: " ms" },
    { key: "gaba", label: "GABA decay", type: "range", min: 2, max: 30, step: 1, default: 8, unit: " ms" },
  ],
  animated: false,
  init: () => ({}),
  draw: (d, s, p) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    const T = 160;
    const psp = (rise: number, decay: number, sign: number) => {
      const out: number[] = [];
      for (let t = 0; t < T; t++) out.push(sign * (Math.exp(-t / decay) - Math.exp(-t / rise)));
      const mx = out.reduce((a, b) => Math.max(a, Math.abs(b)), 0.001);
      return out.map((v) => v / mx);
    };
    const ampa = psp(0.8, p.ampa, 1);
    const nmda = psp(3, p.nmda, 1);
    const gaba = psp(1, p.gaba, -1);
    ctx.strokeStyle = PAL.axis;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    plot(ctx, w, h, ampa, PAL.exc, { yMin: -1.1, yMax: 1.1, width: 2 });
    plot(ctx, w, h, nmda, PAL.warn, { yMin: -1.1, yMax: 1.1, width: 2 });
    plot(ctx, w, h, gaba, PAL.inh, { yMin: -1.1, yMax: 1.1, width: 2 });
    label(ctx, "AMPA", 10, 16, PAL.exc);
    label(ctx, "NMDA", 54, 16, PAL.warn);
    label(ctx, "GABA", 100, 16, PAL.inh);
  },
  readouts: (s, p) => [
    { label: "AMPA", value: fmt(p.ampa, 0) + " ms", accent: PAL.exc },
    { label: "NMDA", value: fmt(p.nmda, 0) + " ms", accent: PAL.warn },
    { label: "GABA", value: fmt(p.gaba, 0) + " ms", accent: PAL.inh },
  ],
};

export const dynamicsActivities: Activity[] = [
  paramExplorer,
  clamp_,
  bifurcation,
  stdp,
  homeo,
  customModel,
  noise,
  attractor,
  eiController,
  kinetics,
];
