import type { Activity, ActState, Params, DrawArgs } from "../types";
import { PAL, frame, plot, bars, label, fmt, clamp, pushCap, gauss } from "../kit";

const perf: Activity = {
  slug: "performance-dashboard",
  id: 1,
  title: "Real-time performance dashboard",
  group: "Performance & Systems",
  status: "live",
  what: "Live frame timing, real-time factor and synaptic throughput for the simulation loop.",
  outcome: "Always know whether your device, not the model, is the bottleneck.",
  tips: [
    "Real-time factor above 1 means the sim runs faster than wall-clock.",
    "Bigger networks raise synaptic ops per second and frame time together.",
    "Frame time spikes show up as tall bars in the history.",
  ],
  controls: [
    { key: "N", label: "Network size", type: "range", min: 100, max: 5000, step: 100, default: 1000 },
    { key: "density", label: "Connection density", type: "range", min: 0.01, max: 0.3, step: 0.01, default: 0.1 },
    { key: "stepsPerFrame", label: "Steps / frame", type: "range", min: 1, max: 8, step: 1, default: 2 },
  ],
  animated: true,
  init: () => ({ ftimes: [], last: 0, fps: 60, syn: 0, rtf: 1 }),
  step: (s, p) => {
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    if (s.last) {
      const dt = now - s.last;
      const modeled = (p.N * p.N * p.density) / 5e6 + (p.N * p.stepsPerFrame) / 4e5;
      const frameMs = clamp(dt * 0.2 + modeled + Math.abs(gauss()) * 0.4, 1, 60);
      pushCap(s.ftimes, frameMs, 110);
      s.fps = 1000 / frameMs;
      s.syn = p.N * p.N * p.density * p.stepsPerFrame * s.fps;
      s.rtf = (s.fps * p.stepsPerFrame) / 1000;
    }
    s.last = now;
  },
  draw: (d, s) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    bars(ctx, w, h, s.ftimes, (i: number, v: number) => (v > 18 ? PAL.exc : v > 10 ? PAL.warn : PAL.good), 40);
    label(ctx, "frame time history (ms, lower is better)", 8, 14, "#cdd8f0", "10px ui-sans-serif");
  },
  readouts: (s) => [
    { label: "FPS", value: fmt(s.fps, 0), accent: PAL.good },
    { label: "Real-time factor", value: fmt(s.rtf, 2) + "\u00d7", accent: PAL.brand },
    { label: "Synaptic ops/s", value: fmt(s.syn, 1) },
    { label: "Frame time", value: fmt(s.ftimes.length ? s.ftimes[s.ftimes.length - 1] : 0, 1) + " ms" },
  ],
};

const scheduler: Activity = {
  slug: "scheduler-settings",
  id: 18,
  title: "Real-time scheduler settings",
  group: "Performance & Systems",
  status: "beta",
  what: "Trade simulation speed against UI responsiveness with a frame-budget visualizer.",
  outcome: "Decide how much of each frame goes to the sim versus the interface.",
  tips: [
    "The green part of each bar is sim compute; grey is UI / idle budget.",
    "A higher cap squeezes more steps in but can drop UI frames.",
    "Background priority keeps the interface smooth during heavy sweeps.",
  ],
  controls: [
    {
      key: "priority",
      label: "Priority",
      type: "select",
      default: "balanced",
      options: [
        { label: "Responsive UI", value: "ui" },
        { label: "Balanced", value: "balanced" },
        { label: "Max throughput", value: "throughput" },
      ],
    },
    { key: "maxFps", label: "Frame cap", type: "range", min: 15, max: 120, step: 5, default: 60, unit: " fps" },
  ],
  animated: true,
  init: () => ({ bars: [] }),
  step: (s, p, t) => {
    const budget = 1000 / p.maxFps;
    const frac = p.priority === "ui" ? 0.4 : p.priority === "throughput" ? 0.92 : 0.65;
    const used = budget * frac * (0.85 + 0.3 * Math.abs(Math.sin(t * 0.1)));
    pushCap(s.bars, clamp(used / budget, 0, 1), 60);
    s.budget = budget;
    s.used = used;
  },
  draw: (d, s) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    const n = s.bars.length;
    const bw = w / Math.max(1, n);
    for (let i = 0; i < n; i++) {
      const x = i * bw;
      ctx.fillStyle = "#1a2440";
      ctx.fillRect(x, 0, bw - 1, h);
      const gh = s.bars[i] * h;
      ctx.fillStyle = s.bars[i] > 0.9 ? PAL.exc : PAL.good;
      ctx.fillRect(x, h - gh, bw - 1, gh);
    }
    label(ctx, "sim compute per frame (of budget)", 8, 14, "#cdd8f0", "10px ui-sans-serif");
  },
  readouts: (s) => [
    { label: "Frame budget", value: fmt(s.budget || 0, 1) + " ms" },
    { label: "Sim uses", value: fmt(s.used || 0, 1) + " ms", accent: PAL.good },
    { label: "Headroom", value: fmt(clamp(100 - ((s.used || 0) / (s.budget || 1)) * 100, 0, 100), 0) + "%" },
  ],
};

const distributed: Activity = {
  slug: "distributed-manager",
  id: 19,
  title: "Distributed simulation manager",
  group: "Performance & Systems",
  status: "roadmap",
  what: "Split the network into partitions and watch load balance and communication overhead.",
  outcome: "Understand the cost of parallelizing a neural network across cores.",
  tips: [
    "Each bar is one partition's compute load; even bars mean good balance.",
    "More partitions cut compute per core but raise communication overhead.",
    "There is a sweet spot \u2014 too many partitions and comms dominate.",
  ],
  controls: [
    { key: "partitions", label: "Partitions", type: "range", min: 1, max: 16, step: 1, default: 4 },
    { key: "N", label: "Neurons", type: "range", min: 500, max: 8000, step: 500, default: 2000 },
  ],
  animated: true,
  init: () => ({ loads: [], comm: 0 }),
  step: (s, p, t) => {
    const P = Math.round(p.partitions);
    const base = p.N / P;
    const loads: number[] = [];
    for (let i = 0; i < P; i++) loads.push(base * (0.85 + 0.3 * Math.abs(Math.sin(t * 0.05 + i))));
    s.loads = loads;
    s.comm = (P - 1) * (p.N / 100) * (0.5 + 0.5 * Math.sin(t * 0.03));
    const mx = Math.max.apply(null, loads);
    const mn = Math.min.apply(null, loads);
    s.imbalance = mx > 0 ? (mx - mn) / mx : 0;
  },
  draw: (d, s) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    bars(ctx, w, h, s.loads, (i: number) => heatBar(i, s.loads.length));
    label(ctx, "compute load per partition", 8, 14, "#cdd8f0", "10px ui-sans-serif");
  },
  readouts: (s) => [
    { label: "Partitions", value: fmt(s.loads.length, 0), accent: PAL.brand },
    { label: "Load imbalance", value: fmt((s.imbalance || 0) * 100, 0) + "%" },
    { label: "Comm overhead", value: fmt(s.comm || 0, 0) + " msg/step", accent: PAL.warn },
  ],
};

function heatBar(i: number, n: number): string {
  const pal = [PAL.brand, PAL.good, PAL.purple, PAL.warn, PAL.inh, PAL.exc];
  return pal[i % pal.length];
}

const procMon: Activity = {
  slug: "process-monitor",
  id: 33,
  title: "Process monitor (desktop)",
  group: "Performance & Systems",
  status: "roadmap",
  what: "CPU, memory and power-impact sparklines for a long-running desktop simulation.",
  outcome: "See the OS-level footprint of a long simulation at a glance.",
  tips: [
    "This models the resource curve an Electron build would report.",
    "Heavier workloads lift the CPU and power traces together.",
    "Memory creeps up as recording buffers fill, then plateaus.",
  ],
  controls: [
    { key: "workload", label: "Workload", type: "range", min: 0, max: 100, step: 1, default: 55 },
    { key: "recording", label: "Recording on", type: "toggle", default: true },
  ],
  animated: true,
  init: () => ({ cpu: [], mem: [], pow: [], memv: 30 }),
  step: (s, p, t) => {
    const cpu = clamp(p.workload * 0.8 + 10 * Math.abs(Math.sin(t * 0.06)) + Math.abs(gauss()) * 3, 0, 100);
    s.memv = clamp(s.memv + (p.recording ? 0.05 : -0.03), 25, 90);
    const pow = clamp(cpu * 0.7 + 12, 0, 100);
    pushCap(s.cpu, cpu, 160);
    pushCap(s.mem, s.memv, 160);
    pushCap(s.pow, pow, 160);
  },
  draw: (d, s) => {
    const { ctx, w, h } = d;
    frame(ctx, w, h);
    plot(ctx, w, h, s.cpu, PAL.exc, { yMin: 0, yMax: 100, width: 1.6 });
    plot(ctx, w, h, s.mem, PAL.brand, { yMin: 0, yMax: 100, width: 1.6 });
    plot(ctx, w, h, s.pow, PAL.warn, { yMin: 0, yMax: 100, width: 1.6 });
    label(ctx, "CPU", 10, 16, PAL.exc);
    label(ctx, "memory", 44, 16, PAL.brand);
    label(ctx, "power", 98, 16, PAL.warn);
  },
  readouts: (s) => [
    { label: "CPU", value: fmt(s.cpu.length ? s.cpu[s.cpu.length - 1] : 0, 0) + "%", accent: PAL.exc },
    { label: "Memory", value: fmt(s.memv, 0) + "%", accent: PAL.brand },
    { label: "Power", value: fmt(s.pow.length ? s.pow[s.pow.length - 1] : 0, 0) + "%", accent: PAL.warn },
  ],
};

export const performanceActivities: Activity[] = [perf, scheduler, distributed, procMon];
