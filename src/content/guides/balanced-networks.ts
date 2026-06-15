import type { Guide } from "../types";

export const balancedNetworks: Guide = {
  slug: "balanced-networks",
  title: "Balanced networks and the E/I ratio",
  category: "Networks",
  summary:
    "How the tug-of-war between excitation and inhibition keeps cortex stable, fast and information-rich - and how to break it on purpose.",
  readingTimeMin: 7,
  updated: "2026-06-14",
  blocks: [
    {
      type: "p",
      text: "Real cortex is a knife-edge. Each neuron receives a torrent of excitatory input that, on its own, would drive it to fire constantly - but an almost equal torrent of inhibition cancels most of it. What is left is a small, fluctuating net current. This is the balanced state, and it is why the brain is both stable and exquisitely responsive.",
    },
    { type: "h", text: "Why balance matters" },
    {
      type: "list",
      items: [
        "Stability: runaway excitation is impossible because inhibition scales up with it.",
        "Speed: neurons sit just below threshold, so a tiny extra input triggers an immediate spike.",
        "Richness: firing is driven by fluctuations, producing the irregular, Poisson-like spiking seen in vivo.",
      ],
    },
    { type: "h", text: "The E/I ratio" },
    {
      type: "p",
      text: "CortexSim exposes the fraction of inhibitory cells and the relative strength of inhibitory synapses. Together these set the effective E/I ratio. The canonical cortical mix is about 80% excitatory and 20% inhibitory, with inhibition roughly four times stronger per synapse so the two roughly cancel.",
    },
    { type: "math", text: "g_{inh} \\cdot N_{inh} \\approx g_{exc} \\cdot N_{exc}" },
    { type: "h", text: "Three regimes to explore" },
    {
      type: "table",
      headers: ["Tip the balance", "What you see", "Real-world analogue"],
      rows: [
        ["Toward inhibition", "Sparse, quiet, hard to ignite", "Anaesthesia, down-states"],
        ["Balanced", "Irregular, asynchronous firing", "Awake resting cortex"],
        ["Toward excitation", "Synchronous bursts, seizure-like", "Epileptiform activity"],
      ],
    },
    {
      type: "ol",
      items: [
        "Start from the asynchronous-cortex preset.",
        "Slowly reduce inhibitory strength and watch synchrony climb.",
        "Find the tipping point where irregular firing collapses into population bursts.",
        "Restore balance and confirm the irregular state returns.",
      ],
    },
    {
      type: "tip",
      text: "Track the synchrony index while you move the slider. The transition from balanced to synchronous is often surprisingly sharp - a hallmark of a phase transition.",
    },
    {
      type: "warn",
      text: "If the network goes completely silent, you have pushed inhibition too far or starved it of drive. Add background input to reignite it.",
    },
  ],
};
