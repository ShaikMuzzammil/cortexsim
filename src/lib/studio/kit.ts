// Shared drawing + math toolkit for Studio activities. Pure functions, no JSX.

export const PAL = {
  bg: "#070b16",
  grid: "#141d35",
  axis: "#26314f",
  text: "#9fb0d0",
  dim: "#5a6b88",
  brand: "#6ea8ff",
  exc: "#ff5d73",
  inh: "#5db1ff",
  good: "#36d399",
  warn: "#fbbd23",
  purple: "#b78cff",
};

export interface Izh {
  a: number;
  b: number;
  c: number;
  d: number;
  label: string;
}

export const IZH: Record<string, Izh> = {
  rs: { a: 0.02, b: 0.2, c: -65, d: 8, label: "Regular spiking" },
  ib: { a: 0.02, b: 0.2, c: -55, d: 4, label: "Intrinsically bursting" },
  ch: { a: 0.02, b: 0.2, c: -50, d: 2, label: "Chattering" },
  fs: { a: 0.1, b: 0.2, c: -65, d: 2, label: "Fast spiking" },
  lts: { a: 0.02, b: 0.25, c: -65, d: 2, label: "Low-threshold" },
};

export function izhStep(
  s: { v: number; u: number },
  I: number,
  p: { a: number; b: number; c: number; d: number },
  dt: number,
): boolean {
  s.v += dt * (0.04 * s.v * s.v + 5 * s.v + 140 - s.u + I);
  s.u += dt * (p.a * (p.b * s.v - s.u));
  if (s.v >= 30) {
    s.v = p.c;
    s.u += p.d;
    return true;
  }
  return false;
}

export function clamp(x: number, a: number, b: number): number {
  return x < a ? a : x > b ? b : x;
}
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
export function mean(a: number[]): number {
  if (!a.length) return 0;
  let s = 0;
  for (const v of a) s += v;
  return s / a.length;
}
export function std(a: number[]): number {
  if (a.length < 2) return 0;
  const m = mean(a);
  let s = 0;
  for (const v of a) s += (v - m) * (v - m);
  return Math.sqrt(s / a.length);
}
export function minMax(a: number[]): [number, number] {
  let mn = Infinity;
  let mx = -Infinity;
  for (const v of a) {
    if (v < mn) mn = v;
    if (v > mx) mx = v;
  }
  if (mn === Infinity) return [0, 1];
  return [mn, mx];
}
export function fmt(n: number, d?: number): string {
  if (!isFinite(n)) return "0";
  const x = Math.abs(n);
  const dd = d === undefined ? 1 : d;
  if (x >= 1e6) return (n / 1e6).toFixed(dd) + "M";
  if (x >= 1e3) return (n / 1e3).toFixed(dd) + "k";
  return n.toFixed(dd);
}
export function pushCap(arr: number[], v: number, cap: number): void {
  arr.push(v);
  if (arr.length > cap) arr.shift();
}

export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gauss(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function heatColor(t: number): string {
  const x = clamp(t, 0, 1);
  const stops = [
    [7, 11, 22],
    [40, 80, 160],
    [54, 211, 153],
    [251, 189, 35],
    [255, 93, 115],
  ];
  const seg = x * (stops.length - 1);
  const i = Math.floor(seg);
  const f = seg - i;
  const a = stops[i];
  const b = stops[Math.min(stops.length - 1, i + 1)];
  const r = Math.round(a[0] + (b[0] - a[0]) * f);
  const g = Math.round(a[1] + (b[1] - a[1]) * f);
  const bl = Math.round(a[2] + (b[2] - a[2]) * f);
  return "rgb(" + r + "," + g + "," + bl + ")";
}

// ---- canvas helpers (logical pixels; runner pre-scales the context) ----

export function frame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cols?: number,
  rows?: number,
): void {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = PAL.bg;
  ctx.fillRect(0, 0, w, h);
  const cc = cols || 8;
  const rr = rows || 4;
  ctx.strokeStyle = PAL.grid;
  ctx.lineWidth = 1;
  for (let i = 1; i < cc; i++) {
    const x = (w * i) / cc;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let j = 1; j < rr; j++) {
    const y = (h * j) / rr;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

export interface PlotOpts {
  yMin?: number;
  yMax?: number;
  width?: number;
  fill?: string;
  pad?: number;
}

export function plot(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  data: number[],
  color: string,
  opts?: PlotOpts,
): void {
  const o = opts || {};
  const n = data.length;
  if (n < 2) return;
  let yMin = o.yMin;
  let yMax = o.yMax;
  if (yMin === undefined || yMax === undefined) {
    const mm = minMax(data);
    yMin = mm[0];
    yMax = mm[1];
  }
  const pad = o.pad === undefined ? 8 : o.pad;
  const range = yMax - yMin || 1;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * w;
    const y = pad + (1 - (data[i] - yMin) / range) * (h - 2 * pad);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = o.width || 1.8;
  ctx.stroke();
  if (o.fill) {
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = o.fill;
    ctx.fill();
  }
}

export function bars(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  vals: number[],
  color: string | ((i: number, v: number) => string),
  max?: number,
): void {
  const n = vals.length;
  if (!n) return;
  let mx = max;
  if (mx === undefined) {
    mx = 0;
    for (const v of vals) if (v > mx) mx = v;
  }
  mx = mx || 1;
  const bw = w / n;
  for (let i = 0; i < n; i++) {
    const bh = (vals[i] / mx) * (h - 12);
    ctx.fillStyle = typeof color === "function" ? color(i, vals[i]) : color;
    ctx.fillRect(i * bw + 1, h - bh, Math.max(1, bw - 2), bh);
  }
}

export function heat(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  grid: number[][],
  colorFn?: (v: number) => string,
): void {
  const rows = grid.length;
  if (!rows) return;
  const cols = grid[0].length;
  if (!cols) return;
  const cw = w / cols;
  const ch = h / rows;
  const fn = colorFn || heatColor;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = fn(grid[r][c]);
      ctx.fillRect(c * cw, r * ch, cw + 1, ch + 1);
    }
  }
}

export interface Pt {
  x: number;
  y: number;
  c?: string;
  r?: number;
}
export interface ScatterOpts {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export function scatter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pts: Pt[],
  o: ScatterOpts,
): void {
  const xr = o.xMax - o.xMin || 1;
  const yr = o.yMax - o.yMin || 1;
  for (const p of pts) {
    const x = ((p.x - o.xMin) / xr) * w;
    const y = (1 - (p.y - o.yMin) / yr) * h;
    ctx.fillStyle = p.c || PAL.brand;
    ctx.beginPath();
    ctx.arc(x, y, p.r || 2.2, 0, 6.283185);
    ctx.fill();
  }
}

export function label(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  color?: string,
  font?: string,
  align?: CanvasTextAlign,
): void {
  ctx.fillStyle = color || PAL.text;
  ctx.font = font || "11px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = align || "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(s, x, y);
  ctx.textAlign = "left";
}

export function makeNeuron(exc: boolean): { v: number; u: number; exc: boolean } {
  return { v: -65 + Math.random() * 6, u: -13, exc };
}
