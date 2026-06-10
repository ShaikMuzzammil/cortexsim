import type { Guide } from "../types";

export const synchronyMetrics: Guide = {
  slug: "synchrony-metrics",
  title: "Synchrony, correlation and entropy",
  category: "Analysis",
  summary:
    "The three population-level metrics CortexSim computes every frame, what they mean, and how to read the raster and correlation matrix.",
  readingTimeMin: 6,
  updated: "2026-06-10",
  blocks: [
    {
      type: "p",
      text: "Beyond average firing rate, the interesting question is how neurons coordinate. CortexSim computes several coordination metrics live so you can quantify the regime you are in rather than just eyeballing it.",
    },
    { type: "h", text: "Synchrony index" },
    {
      type: "p",
      text: "The synchrony index measures how much the population fires together. It is derived from the variance of the population firing-rate signal relative to the variance of individual neurons: when everyone spikes in lockstep the population signal swings wildly (high synchrony, near 1); when firing is independent the swings cancel out (low synchrony, near 0).",
    },
    { type: "h", text: "Correlation matrix" },
    {
      type: "p",
      text: "The correlation chart bins the spikes of a sample of neurons into short time windows and computes the pairwise Pearson correlation between every pair. Bright off-diagonal blocks reveal assemblies - groups of neurons that fire together. In the asynchronous regime the matrix is nearly all zero except the diagonal; in oscillatory and storm regimes broad bright structure appears.",
    },
    {
      type: "tip",
      text: "Watch the correlation matrix as you cross from asynchronous to oscillatory: structure emerges suddenly, which is the visual signature of a phase transition in the network.",
    },
    { type: "h", text: "Entropy" },
    {
      type: "p",
      text: "Shannon entropy of the activity distribution captures how unpredictable the network is. A silent or fully synchronized network is highly predictable (low entropy); a richly varied, balanced network carries more information (high entropy). Entropy often peaks right in the balanced regime - the same place real cortex seems to operate.",
    },
    { type: "h", text: "Reading the raster plot" },
    {
      type: "p",
      text: "The raster is the most information-dense chart: each row is a neuron, each dot a spike, time flows left to right. Learn to read it and you can diagnose the network at a glance.",
    },
    {
      type: "list",
      items: [
        "Sparse random speckle = asynchronous irregular (healthy resting state).",
        "Vertical bands = synchronous volleys (oscillation or storm).",
        "Diagonal streaks = traveling waves (enable delays + grid topology).",
        "Empty = silent network; raise drive.",
      ],
    },
    {
      type: "p",
      text: "Excitatory and inhibitory spikes are colored differently so you can see the interplay - inhibitory volleys typically follow excitatory ones by a short lag, which is the engine of many rhythms.",
    },
  ],
};
