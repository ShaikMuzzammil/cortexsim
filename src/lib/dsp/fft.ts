// Minimal radix-2 FFT and Welch power spectral density (no dependencies).

export function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

// In-place iterative Cooley-Tukey FFT on real/imag arrays (length power of 2).
export function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i];
      re[i] = re[j];
      re[j] = tr;
      const ti = im[i];
      im[i] = im[j];
      im[j] = ti;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cwr = 1;
      let cwi = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k];
        const ui = im[i + k];
        const vr = re[i + k + len / 2] * cwr - im[i + k + len / 2] * cwi;
        const vi = re[i + k + len / 2] * cwi + im[i + k + len / 2] * cwr;
        re[i + k] = ur + vr;
        im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr;
        im[i + k + len / 2] = ui - vi;
        const ncwr = cwr * wr - cwi * wi;
        cwi = cwr * wi + cwi * wr;
        cwr = ncwr;
      }
    }
  }
}

// Welch PSD estimate. signal sampled at fsHz. Returns freqs (Hz) and power.
export function welch(
  signal: number[] | Float64Array,
  fsHz: number,
  segLen = 256,
): { freqs: number[]; power: number[] } {
  const n = signal.length;
  if (n < 8) return { freqs: [], power: [] };
  const L = Math.min(nextPow2(segLen), nextPow2(n));
  const step = Math.max(1, Math.floor(L / 2));
  const win = new Float64Array(L);
  for (let i = 0; i < L; i++) {
    // Hann window
    win[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (L - 1)));
  }
  const acc = new Float64Array(L / 2);
  let segs = 0;
  for (let start = 0; start + L <= n; start += step) {
    const re = new Float64Array(L);
    const im = new Float64Array(L);
    let mean = 0;
    for (let i = 0; i < L; i++) mean += signal[start + i];
    mean /= L;
    for (let i = 0; i < L; i++) re[i] = (signal[start + i] - mean) * win[i];
    fft(re, im);
    for (let k = 0; k < L / 2; k++) acc[k] += re[k] * re[k] + im[k] * im[k];
    segs++;
  }
  if (segs === 0) return { freqs: [], power: [] };
  const freqs: number[] = [];
  const power: number[] = [];
  for (let k = 0; k < L / 2; k++) {
    freqs.push((k * fsHz) / L);
    power.push(acc[k] / segs);
  }
  return { freqs, power };
}

export function dominantFrequency(
  signal: number[] | Float64Array,
  fsHz: number,
  maxHz = 120,
): number {
  const { freqs, power } = welch(signal, fsHz);
  let best = 0;
  let bestP = -1;
  for (let k = 1; k < freqs.length; k++) {
    if (freqs[k] > maxHz) break;
    if (power[k] > bestP) {
      bestP = power[k];
      best = freqs[k];
    }
  }
  return best;
}
