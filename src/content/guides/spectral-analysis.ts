import type { Guide } from "../types";

export const spectralAnalysis: Guide = {
  slug: "spectral-analysis",
  title: "Reading the power spectrum",
  category: "Analysis",
  summary:
    "How CortexSim turns population activity into a frequency spectrum, and how to recognize delta, theta, alpha, beta and gamma rhythms.",
  readingTimeMin: 8,
  updated: "2026-06-10",
  blocks: [
    {
      type: "p",
      text: "Brain rhythms are one of the most studied signatures of neural computation. CortexSim computes them live: it takes the population firing rate over time, runs a spectral estimate, and plots power against frequency. This guide explains how that works and how to interpret what you see.",
    },
    { type: "h", text: "From spikes to a signal" },
    {
      type: "p",
      text: "Each step, the engine counts how many neurons fired and divides by the population size to get an instantaneous rate. Stacked over time, these values form a one-dimensional signal - a proxy for the local field potential (LFP) that an electrode would record. That signal is what we analyze.",
    },
    { type: "h", text: "Welch's method" },
    {
      type: "p",
      text: "A raw Fourier transform of a noisy signal is itself very noisy. Welch's method fixes this: it splits the signal into overlapping segments, windows each one, computes the power spectrum of each, and averages them. The result is a smooth, reliable estimate of how power is distributed across frequencies. CortexSim uses a radix-2 FFT under the hood, padding each segment to the next power of two.",
    },
    {
      type: "code",
      lang: "text",
      code: "1. Split rate signal into overlapping windows (e.g. 256 samples)\n2. Apply a Hann window to each segment\n3. FFT each segment, take squared magnitude\n4. Average the segment spectra\n5. Map bins to Hz using the effective sampling rate",
    },
    { type: "h", text: "The classic frequency bands" },
    {
      type: "table",
      headers: ["Band", "Range (Hz)", "Associated with"],
      rows: [
        ["Delta", "1 - 4", "Deep sleep, large-scale slow waves"],
        ["Theta", "4 - 8", "Navigation, memory encoding"],
        ["Alpha", "8 - 13", "Relaxed wakefulness, idling cortex"],
        ["Beta", "13 - 30", "Active concentration, motor control"],
        ["Gamma", "30 - 80+", "Local processing, attention, binding"],
      ],
    },
    {
      type: "tip",
      text: "The 'Dominant Hz' metric simply reports the frequency of the largest spectral peak below a cutoff. Use it as a quick readout while you tune parameters, and read the full spectrum for the detailed shape.",
    },
    { type: "h", text: "Driving specific rhythms" },
    {
      type: "list",
      items: [
        "Gamma: strong, fast inhibition (FS interneurons) creates the pyramidal-interneuron gamma (PING) loop. Try the Gamma preset.",
        "Beta: moderate inhibition with conduction delays slows the rhythm into the beta band.",
        "Slow oscillations: low drive with strong adaptation produces alternating up and down states in the delta range.",
      ],
    },
    {
      type: "warn",
      text: "Frequencies here are in the model's time units. Treat the relationships between conditions as meaningful, and the absolute numbers as approximate.",
    },
  ],
};
