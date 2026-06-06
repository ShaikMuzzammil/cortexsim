/**
 * charts.js — Lightweight canvas line/area charts for live signals:
 *  - Population firing-rate histogram (bar)
 *  - Membrane-voltage trace of the probed neuron (scrolling line)
 * No charting library required — keeps the bundle tiny and offline-friendly.
 */
export class TraceChart {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.color = opts.color || "#41e0c8";
    this.bg = opts.bg || "#080a16";
    this.min = opts.min ?? -80;
    this.max = opts.max ?? 40;
    this.cap = opts.cap || 600;
    this.data = [];
    this._resize();
    window.addEventListener("resize", () => this._resize());
  }
  _resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = w;
    this.H = h;
  }
  pushMany(values) {
    for (let i = 0; i < values.length; i++) this.data.push(values[i]);
    if (this.data.length > this.cap) this.data.splice(0, this.data.length - this.cap);
    this.draw();
  }
  setRange(min, max) {
    this.min = min;
    this.max = max;
  }
  draw() {
    const ctx = this.ctx;
    if (!this.W) this._resize();
    ctx.fillStyle = this.bg;
    ctx.fillRect(0, 0, this.W, this.H);
    // zero / threshold gridline
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, this.H / 2);
    ctx.lineTo(this.W, this.H / 2);
    ctx.stroke();
    const n = this.data.length;
    if (n < 2) return;
    const span = this.max - this.min || 1;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = (i / (this.cap - 1)) * this.W;
      const norm = (this.data[i] - this.min) / span;
      const y = this.H - norm * this.H;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

export class BarChart {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.color = opts.color || "#7b6bff";
    this.bg = opts.bg || "#080a16";
    this._resize();
    window.addEventListener("resize", () => this._resize());
  }
  _resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = w;
    this.H = h;
  }
  draw(values) {
    const ctx = this.ctx;
    if (!this.W) this._resize();
    ctx.fillStyle = this.bg;
    ctx.fillRect(0, 0, this.W, this.H);
    const n = values.length;
    if (!n) return;
    let max = 1;
    for (let i = 0; i < n; i++) if (values[i] > max) max = values[i];
    const bw = this.W / n;
    const grad = ctx.createLinearGradient(0, 0, 0, this.H);
    grad.addColorStop(0, "#8a7bff");
    grad.addColorStop(1, "#41e0c8");
    ctx.fillStyle = grad;
    for (let i = 0; i < n; i++) {
      const h = (values[i] / max) * (this.H - 4);
      ctx.fillRect(i * bw, this.H - h, Math.max(1, bw - 1), h);
    }
  }
}
