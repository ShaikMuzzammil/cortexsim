// Pure canvas drawing helpers for the simulator visualizations.
// Each takes a canvas and data, and renders immediately (called from rAF).

function prep(canvas: HTMLCanvasElement): {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
} | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = w * dpr;
    canvas.height = h * dpr;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}

const BG = "#070b16";

export interface RasterPoint {
  t: number;
  i: number;
  exc: boolean;
}

export function drawRaster(
  canvas: HTMLCanvasElement,
  points: RasterPoint[],
  N: number,
  windowSteps: number,
  nowStep: number,
) {
  const p = prep(canvas);
  if (!p) return;
  const { ctx, w, h } = p;
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  const t0 = nowStep - windowSteps;
  for (const pt of points) {
    if (pt.t < t0) continue;
    const x = ((pt.t - t0) / windowSteps) * w;
    const y = (1 - pt.i / N) * h;
    ctx.fillStyle = pt.exc ? "rgba(255,93,115,0.9)" : "rgba(93,177,255,0.9)";
    ctx.fillRect(x, y, 1.4, 1.4);
  }
}

export function drawLine(
  canvas: HTMLCanvasElement,
  series: number[],
  color: string,
  fill = true,
  yMax?: number,
) {
  const p = prep(canvas);
  if (!p) return;
  const { ctx, w, h } = p;
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  if (series.length < 2) return;
  let max = yMax ?? 0;
  if (yMax === undefined) for (const v of series) if (v > max) max = v;
  max = max || 1;
  ctx.beginPath();
  for (let i = 0; i < series.length; i++) {
    const x = (i / (series.length - 1)) * w;
    const y = h - (series[i] / max) * h * 0.92 - 4;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  if (fill) {
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = color.replace("1)", "0.12)").replace("rgb", "rgba");
    ctx.fillStyle = color + "22";
    ctx.fill();
  }
}

export function drawHistogram(
  canvas: HTMLCanvasElement,
  bins: number[],
  color: string,
) {
  const p = prep(canvas);
  if (!p) return;
  const { ctx, w, h } = p;
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  if (!bins.length) return;
  let max = 0;
  for (const v of bins) if (v > max) max = v;
  max = max || 1;
  const bw = w / bins.length;
  ctx.fillStyle = color;
  for (let i = 0; i < bins.length; i++) {
    const bh = (bins[i] / max) * h * 0.9;
    ctx.fillRect(i * bw + 1, h - bh, Math.max(1, bw - 2), bh);
  }
}

export function drawSpectrum(
  canvas: HTMLCanvasElement,
  freqs: number[],
  power: number[],
  maxHz = 120,
) {
  const p = prep(canvas);
  if (!p) return;
  const { ctx, w, h } = p;
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  if (freqs.length < 2) return;
  let max = 0;
  let count = 0;
  for (let i = 1; i < freqs.length; i++) {
    if (freqs[i] > maxHz) break;
    if (power[i] > max) max = power[i];
    count++;
  }
  max = max || 1;
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, "#5db1ff");
  grad.addColorStop(1, "#ff5d73");
  ctx.fillStyle = grad;
  const bw = w / Math.max(1, count);
  let drawn = 0;
  for (let i = 1; i < freqs.length && drawn < count; i++) {
    if (freqs[i] > maxHz) break;
    const bh = (power[i] / max) * h * 0.9;
    ctx.fillRect(drawn * bw, h - bh, Math.max(1, bw - 1), bh);
    drawn++;
  }
}

export function drawVoltage(
  canvas: HTMLCanvasElement,
  series: number[],
) {
  const p = prep(canvas);
  if (!p) return;
  const { ctx, w, h } = p;
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  if (series.length < 2) return;
  const min = -90;
  const max = 40;
  ctx.beginPath();
  for (let i = 0; i < series.length; i++) {
    const x = (i / (series.length - 1)) * w;
    const y = h - ((series[i] - min) / (max - min)) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "#36d399";
  ctx.lineWidth = 1.6;
  ctx.stroke();
}

export function drawPhasePlane(
  canvas: HTMLCanvasElement,
  vs: number[],
  us: number[],
) {
  const p = prep(canvas);
  if (!p) return;
  const { ctx, w, h } = p;
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  const vmin = -90;
  const vmax = 40;
  const umin = -20;
  const umax = 20;
  const X = (v: number) => ((v - vmin) / (vmax - vmin)) * w;
  const Y = (u: number) => h - ((u - umin) / (umax - umin)) * h;
  // v-nullcline: u = 0.04v^2 + 5v + 140
  ctx.strokeStyle = "rgba(110,168,255,0.4)";
  ctx.beginPath();
  for (let v = vmin; v <= vmax; v += 2) {
    const u = 0.04 * v * v + 5 * v + 140;
    const x = X(v);
    const y = Y(u);
    if (v === vmin) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // trajectory
  ctx.strokeStyle = "#fbbd23";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let i = 0; i < vs.length; i++) {
    const x = X(vs[i]);
    const y = Y(us[i]);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

export function drawCorrelation(
  canvas: HTMLCanvasElement,
  matrix: number[][],
) {
  const p = prep(canvas);
  if (!p) return;
  const { ctx, w, h } = p;
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  const m = matrix.length;
  if (!m) return;
  const cw = w / m;
  const ch = h / m;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      const c = matrix[i][j];
      const r = Math.round(((c + 1) / 2) * 255);
      const b = 255 - r;
      ctx.fillStyle = "rgb(" + r + ",80," + b + ")";
      ctx.fillRect(j * cw, i * ch, cw + 0.5, ch + 0.5);
    }
  }
}

// ---------------------------------------------------------------------------
// Extended visualizations (added for the advanced analysis dashboard).
// ---------------------------------------------------------------------------

export interface LineSeries {
  data: number[];
  color: string;
}

// Overlay several line series on one axis (e.g. excitatory / inhibitory / total).
export function drawMultiLine(
  canvas: HTMLCanvasElement,
  series: LineSeries[],
  yMax?: number,
) {
  const p = prep(canvas);
  if (!p) return;
  const { ctx, w, h } = p;
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  let max = yMax ?? 0;
  if (yMax === undefined)
    for (const s of series) for (const v of s.data) if (v > max) max = v;
  max = max || 1;
  for (const s of series) {
    if (s.data.length < 2) continue;
    ctx.beginPath();
    for (let i = 0; i < s.data.length; i++) {
      const x = (i / (s.data.length - 1)) * w;
      const y = h - (s.data[i] / max) * h * 0.92 - 4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

// Radial half-gauge for a normalized 0..1 value.
export function drawGauge(
  canvas: HTMLCanvasElement,
  value: number,
  color: string,
  label: string,
) {
  const p = prep(canvas);
  if (!p) return;
  const { ctx, w, h } = p;
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h * 0.82;
  const r = Math.min(w / 2 - 10, h * 0.66);
  const v = Math.max(0, Math.min(1, value));
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(6, r * 0.16);
  ctx.strokeStyle = "#1d2742";
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * v);
  ctx.stroke();
  ctx.fillStyle = "#e5edff";
  ctx.textAlign = "center";
  ctx.font = "700 20px Inter, system-ui, sans-serif";
  ctx.fillText((v * 100).toFixed(0) + "%", cx, cy - 6);
  ctx.fillStyle = "#7c8db5";
  ctx.font = "600 10px Inter, system-ui, sans-serif";
  ctx.fillText(label, cx, cy + 14);
}

function heatColor(t: number): string {
  const x = Math.max(0, Math.min(1, t));
  const r = Math.round(15 + x * 240);
  const g = Math.round(20 + 160 * Math.sin(Math.PI * x));
  const b = Math.round(130 * (1 - x) + 35);
  return "rgb(" + r + "," + g + "," + b + ")";
}

// Rolling spectrogram. Columns are oldest..newest; each column is a power[] vector.
export function drawSpectrogram(
  canvas: HTMLCanvasElement,
  columns: number[][],
  maxBins = 64,
) {
  const p = prep(canvas);
  if (!p) return;
  const { ctx, w, h } = p;
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  const cols = columns.length;
  if (!cols) return;
  let max = 0;
  for (const c of columns)
    for (let k = 0; k < maxBins && k < c.length; k++)
      if (c[k] > max) max = c[k];
  max = max || 1;
  const cw = w / cols;
  for (let x = 0; x < cols; x++) {
    const col = columns[x];
    const bins = Math.min(maxBins, col.length);
    if (bins === 0) continue;
    const ch = h / bins;
    for (let k = 0; k < bins; k++) {
      const y = h - (k + 1) * ch;
      ctx.fillStyle = heatColor(col[k] / max);
      ctx.fillRect(x * cw, y, cw + 0.5, ch + 0.5);
    }
  }
}

// Generic intensity heatmap (rows x cols), used for the neuron activity map.
export function drawHeatmap(canvas: HTMLCanvasElement, grid: number[][]) {
  const p = prep(canvas);
  if (!p) return;
  const { ctx, w, h } = p;
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  const rows = grid.length;
  if (!rows) return;
  const cols = grid[0].length || 1;
  let max = 0;
  for (const row of grid) for (const v of row) if (v > max) max = v;
  max = max || 1;
  const cw = w / cols;
  const chh = h / rows;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const t = grid[i][j] / max;
      if (t <= 0) continue;
      ctx.fillStyle = "rgba(110,168,255," + (0.12 + t * 0.88).toFixed(3) + ")";
      ctx.fillRect(j * cw, i * chh, cw + 0.5, chh + 0.5);
    }
  }
}
