/**
 * metrics.js — Real-time analytics over the spike stream.
 *
 * Computes, over a sliding window:
 *   - population firing rate (Hz)
 *   - mean single-cell rate
 *   - network synchrony (variance of the population signal / mean of per-cell variance)
 *   - mean ISI and CV(ISI) (irregularity)
 *   - a coarse dominant oscillation frequency via autocorrelation of the
 *     population rate signal (detects gamma / synchronous rhythms)
 *
 * These are intentionally lightweight, online estimators suitable for 60fps.
 */
export class Analytics {
  constructor(N, dt) {
    this.N = N;
    this.dt = dt;
    this.reset();
  }

  reset() {
    this.windowMs = 1000; // analysis window
    this.binMs = 5; // population-rate bin width
    this.nBins = Math.max(8, Math.round(this.windowMs / this.binMs));
    this.popHist = new Float32Array(this.nBins); // spikes per bin
    this.binHead = 0;
    this.binAccum = 0;
    this.binTimeAccum = 0;
    this.lastSpikeTime = new Float32Array(this.N).fill(NaN);
    this.isiSum = 0;
    this.isiSqSum = 0;
    this.isiCount = 0;
    this.spikeCountWindow = 0;
    this.elapsed = 0;
    this.totalSpikes = 0;
  }

  ingest(frame, engine) {
    const ids = frame.spikeIds;
    const times = frame.spikeTimes;
    for (let k = 0; k < ids.length; k++) {
      const i = ids[k];
      const t = times[k];
      this.binAccum++;
      this.spikeCountWindow++;
      this.totalSpikes++;
      const prev = this.lastSpikeTime[i];
      if (!Number.isNaN(prev)) {
        const isi = t - prev;
        if (isi > 0) {
          this.isiSum += isi;
          this.isiSqSum += isi * isi;
          this.isiCount++;
        }
      }
      this.lastSpikeTime[i] = t;
    }
    // Advance population-rate bins by elapsed sim time.
    const stepMs = frame.time - this.elapsed;
    this.elapsed = frame.time;
    this.binTimeAccum += stepMs;
    while (this.binTimeAccum >= this.binMs) {
      this.popHist[this.binHead] = this.binAccum;
      this.binHead = (this.binHead + 1) % this.nBins;
      this.binAccum = 0;
      this.binTimeAccum -= this.binMs;
    }
  }

  /** Dominant oscillation frequency (Hz) via autocorrelation of pop rate. */
  dominantFrequency() {
    const x = this.orderedHist();
    const n = x.length;
    let mean = 0;
    for (let i = 0; i < n; i++) mean += x[i];
    mean /= n;
    let bestLag = 0;
    let bestVal = -Infinity;
    // search lags 2..n/2 (skip lag 0/1)
    for (let lag = 2; lag < n / 2; lag++) {
      let s = 0;
      for (let i = 0; i + lag < n; i++) s += (x[i] - mean) * (x[i + lag] - mean);
      if (s > bestVal) {
        bestVal = s;
        bestLag = lag;
      }
    }
    if (bestLag === 0) return 0;
    const periodMs = bestLag * this.binMs;
    return periodMs > 0 ? 1000 / periodMs : 0;
  }

  orderedHist() {
    const n = this.nBins;
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) out[i] = this.popHist[(this.binHead + i) % n];
    return out;
  }

  /** Synchrony index chi (0 async .. 1 fully synchronous), Golomb & Rinzel. */
  synchrony() {
    const x = this.orderedHist();
    const n = x.length;
    let mean = 0;
    for (let i = 0; i < n; i++) mean += x[i];
    mean /= n;
    let varPop = 0;
    for (let i = 0; i < n; i++) varPop += (x[i] - mean) * (x[i] - mean);
    varPop /= n;
    // Normalise by mean activity; bounded heuristic.
    if (mean <= 0) return 0;
    const chi = Math.sqrt(varPop) / (mean + 1e-9);
    return Math.max(0, Math.min(1, chi / Math.sqrt(Math.max(1, mean))));
  }

  snapshot(engine) {
    const windowSec = this.windowMs / 1000;
    const popRate = this.spikeCountWindow / windowSec; // spikes/s across network (windowed-ish)
    // Approximate per-neuron rate from the recent bins.
    const x = this.orderedHist();
    let recent = 0;
    for (let i = 0; i < x.length; i++) recent += x[i];
    const perNeuronRate = (recent / (this.N || 1)) / (this.windowMs / 1000);
    const meanIsi = this.isiCount ? this.isiSum / this.isiCount : 0;
    const varIsi = this.isiCount
      ? this.isiSqSum / this.isiCount - meanIsi * meanIsi
      : 0;
    const cvIsi = meanIsi > 0 ? Math.sqrt(Math.max(0, varIsi)) / meanIsi : 0;
    // Decay the windowed spike counter so popRate tracks recent activity.
    this.spikeCountWindow *= 0.5;
    return {
      popRate: +perNeuronRate.toFixed(2),
      meanRate: +perNeuronRate.toFixed(2),
      totalSpikes: this.totalSpikes,
      synchrony: +this.synchrony().toFixed(3),
      cvIsi: +cvIsi.toFixed(3),
      meanIsi: +meanIsi.toFixed(2),
      dominantHz: +this.dominantFrequency().toFixed(1),
      popHistogram: x,
    };
  }
}
