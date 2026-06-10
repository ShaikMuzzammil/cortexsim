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
