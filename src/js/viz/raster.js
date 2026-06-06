/**
 * raster.js — Scrolling spike raster plot on a 2D canvas.
 * X axis = time (scrolling), Y axis = neuron id. Excitatory and inhibitory
 * spikes are drawn in distinct colours.
 */
export class RasterPlot {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.N = opts.N || 1000;
    this.isExc = opts.isExc || null;
    this.excColor = opts.excColor || "#5b8bff";
    this.inhColor = opts.inhColor || "#ff5a7e";
    this.bg = opts.bg || "#080a16";
    this.maxRows = 400; // subsample neurons for display
    this._resize();
    window.addEventListener("resize", () => this._resize());
  }

  configure(N, isExc) {
    this.N = N;
    this.isExc = isExc;
    this.clear();
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
    this.clear();
  }

  clear() {
    const ctx = this.ctx;
    ctx.fillStyle = this.bg;
    ctx.fillRect(0, 0, this.W, this.H);
  }

  /** Push spikes for the latest frame and scroll left by `dx` px. */
  push(spikeIds, dx = 2) {
    const ctx = this.ctx;
    if (!this.W) this._resize();
    // Scroll existing content left.
    const img = ctx.getImageData(dx * (window.devicePixelRatio > 1 ? Math.min(window.devicePixelRatio, 2) : 1), 0, this.canvas.width, this.canvas.height);
    ctx.putImageData(img, 0, 0);
    // Clear the new strip on the right.
    ctx.fillStyle = this.bg;
    ctx.fillRect(this.W - dx, 0, dx, this.H);
    // Draw spikes in the new strip.
    const x = this.W - dx;
    const step = this.N > this.maxRows ? this.N / this.maxRows : 1;
    for (let k = 0; k < spikeIds.length; k++) {
      const id = spikeIds[k];
      const row = Math.floor(id / step);
      const y = this.H - (row / (this.N > this.maxRows ? this.maxRows : this.N)) * this.H;
      ctx.fillStyle = this.isExc && !this.isExc[id] ? this.inhColor : this.excColor;
      ctx.fillRect(x, y, dx, 1.5);
    }
  }
}
