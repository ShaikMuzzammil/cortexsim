/**
 * Lightweight discrete Fourier transform helpers for the population-rate
 * power spectrum. Sample rate is 1000 Hz (one rate sample per simulated ms).
 */
const FS = 1000;

export interface Spectrum {
  mags: number[];
  freqs: number[];
}

export function powerSpectrum(samples: number[], nfft = 128): Spectrum {
  const n = Math.min(nfft, samples.length);
  if (n < 8) return { mags: [], freqs: [] };
  const seg = samples.slice(samples.length - n);
  const mean = seg.reduce((acc, x) => acc + x, 0) / n;
  const half = Math.floor(n / 2);
  const mags: number[] = [];
  const freqs: number[] = [];
  for (let k = 1; k < half; k++) {
    let re = 0;
    let im = 0;
    for (let t = 0; t < n; t++) {
      const w = (2 * Math.PI * k * t) / n;
      const val = seg[t] - mean;
      re += val * Math.cos(w);
      im -= val * Math.sin(w);
    }
    mags.push(Math.sqrt(re * re + im * im) / n);
    freqs.push((k * FS) / n);
  }
  return { mags, freqs };
}

export function dominantHz(spectrum: Spectrum): number {
  const { mags, freqs } = spectrum;
  let bestIdx = 0;
  let bestVal = -1;
  for (let i = 0; i < mags.length; i++) {
    if (mags[i] > bestVal) {
      bestVal = mags[i];
      bestIdx = i;
    }
  }
  return freqs[bestIdx] ?? 0;
}
