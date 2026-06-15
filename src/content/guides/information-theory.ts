import type { Guide } from "../types";

export const informationTheory: Guide = {
  slug: "information-theory",
  title: "Information theory for spike trains",
  category: "Analysis",
  summary:
    "Entropy, mutual information and how to quantify how much a population of neurons is actually computing.",
  readingTimeMin: 9,
  updated: "2026-06-14",
  blocks: [
    {
      type: "p",
      text: "Spikes are the alphabet of the brain. Information theory gives us a rigorous way to ask how much each spike pattern tells us about the world - or about another part of the network. CortexSim computes several of these measures live so you can watch information flow as you change the network.",
    },
    { type: "h", text: "Shannon entropy" },
    {
      type: "p",
      text: "Entropy measures uncertainty. A network that always does the same thing has low entropy; one that visits many distinct states has high entropy. Computing entropy over binned population states tells you how rich the repertoire of activity is.",
    },
    { type: "math", text: "H(X) = -\\sum_i p_i \\log_2 p_i" },
    { type: "h", text: "Mutual information" },
    {
      type: "p",
      text: "Mutual information measures how much knowing one signal reduces uncertainty about another. Between a stimulus and a population response it quantifies how much the network encodes; between two groups it quantifies effective coupling.",
    },
    { type: "math", text: "I(X;Y) = H(X) + H(Y) - H(X,Y)" },
    { type: "h", text: "Reading the numbers" },
    {
      type: "table",
      headers: ["Measure", "Low", "High"],
      rows: [
        ["Entropy", "Stereotyped, locked activity", "Diverse, exploratory activity"],
        ["Mutual information", "Independent groups", "Strongly coupled / encoding"],
        ["Redundancy", "Each neuron unique", "Many neurons say the same thing"],
      ],
    },
    {
      type: "list",
      items: [
        "Maximal entropy is not maximal information - pure noise has high entropy but encodes nothing.",
        "The useful regime is structured variability: enough entropy to represent many things, enough order to be reliable.",
        "Synchrony usually lowers entropy because neurons become redundant.",
      ],
    },
    {
      type: "ol",
      items: [
        "Open the Information / Entropy readout in the analysis group.",
        "Drive the network into a synchronous regime and watch entropy fall.",
        "Return to balance and watch entropy and mutual information rise together.",
      ],
    },
    {
      type: "tip",
      text: "Always report the bin size you used. Entropy estimates depend on it, and comparisons are only fair at the same resolution.",
    },
    {
      type: "code",
      lang: "text",
      code: "Pipeline\n1. Bin spikes into windows of width dt.\n2. Build the population word for each window.\n3. Estimate p(word) and compute H.\n4. For MI, repeat jointly across two groups.",
    },
  ],
};
