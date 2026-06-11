// Population-level analytics computed from spike and rate buffers.

export function shannonEntropy(counts: number[]): number {
  let total = 0;
  for (const c of counts) total += c;
  if (total === 0) return 0;
  let h = 0;
  for (const c of counts) {
    if (c <= 0) continue;
    const p = c / total;
    h -= p * Math.log2(p);
  }
  return h;
}

export function pearson(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;
  let mx = 0;
  let my = 0;
  for (let i = 0; i < n; i++) {
    mx += x[i];
    my += y[i];
  }
  mx /= n;
  my /= n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const a = x[i] - mx;
    const b = y[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? 0 : num / den;
}

// Synchrony index from the variance of the population rate signal.
export function synchronyIndex(rate: number[]): number {
  const n = rate.length;
  if (n < 2) return 0;
  let mean = 0;
  for (const r of rate) mean += r;
  mean /= n;
  if (mean === 0) return 0;
  let varr = 0;
  for (const r of rate) varr += (r - mean) * (r - mean);
  varr /= n;
  const cv = Math.sqrt(varr) / mean;
  return Math.max(0, Math.min(1, cv / 2));
}

// Build a correlation matrix from per-neuron binned spike counts.
export function correlationMatrix(binned: number[][]): number[][] {
  const m = binned.length;
  const out: number[][] = [];
  for (let i = 0; i < m; i++) {
    out[i] = [];
    for (let j = 0; j < m; j++) {
      out[i][j] = i === j ? 1 : pearson(binned[i], binned[j]);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Extended analytics for the advanced dashboard.
// ---------------------------------------------------------------------------

// Inter-spike-interval histogram across all neurons (intervals measured in steps).
export function isiHistogram(
  spikes: { t: number; i: number }[],
  nbins = 28,
  maxIsi = 140,
): number[] {
  const last = new Map<number, number>();
  const hist = new Array(nbins).fill(0);
  for (const s of spikes) {
    const prev = last.get(s.i);
    if (prev !== undefined) {
      const isi = s.t - prev;
      if (isi > 0 && isi <= maxIsi) {
        const b = Math.min(nbins - 1, Math.floor((isi / maxIsi) * nbins));
        hist[b] += 1;
      }
    }
    last.set(s.i, s.t);
  }
  return hist;
}

// Distribution of per-neuron spike counts within a recent window.
export function rateDistribution(
  points: { t: number; i: number }[],
  windowStart: number,
  nbins = 24,
): number[] {
  const counts = new Map<number, number>();
  for (const p of points) {
    if (p.t < windowStart) continue;
    counts.set(p.i, (counts.get(p.i) || 0) + 1);
  }
  let max = 0;
  for (const c of counts.values()) if (c > max) max = c;
  max = max || 1;
  const hist = new Array(nbins).fill(0);
  for (const c of counts.values()) {
    const b = Math.min(nbins - 1, Math.floor((c / max) * nbins));
    hist[b] += 1;
  }
  return hist;
}

// Detect population bursts as threshold crossings of the rate signal.
export function detectBursts(
  rate: number[],
  k = 1.7,
): { count: number; threshold: number } {
  const n = rate.length;
  if (!n) return { count: 0, threshold: 0 };
  let mean = 0;
  for (const r of rate) mean += r;
  mean /= n;
  let varr = 0;
  for (const r of rate) varr += (r - mean) * (r - mean);
  varr /= n;
  const sd = Math.sqrt(varr);
  const thr = mean + k * sd;
  let count = 0;
  let inBurst = false;
  for (const r of rate) {
    if (r > thr && !inBurst) {
      count += 1;
      inBurst = true;
    } else if (r <= thr) {
      inBurst = false;
    }
  }
  return { count, threshold: thr };
}

// Histogram of out-degrees across the network.
export function degreeHistogram(degrees: number[], nbins = 20): number[] {
  if (!degrees.length) return [];
  let max = 0;
  for (const d of degrees) if (d > max) max = d;
  max = max || 1;
  const hist = new Array(nbins).fill(0);
  for (const d of degrees) {
    const b = Math.min(nbins - 1, Math.floor((d / max) * nbins));
    hist[b] += 1;
  }
  return hist;
}
