import type { Guide } from "../types";

export const networkTopologies: Guide = {
  slug: "network-topologies",
  title: "Network topologies explained",
  category: "Networks",
  summary:
    "Random, small-world, scale-free and grid wiring - how the shape of the connectome changes what the network can do.",
  readingTimeMin: 7,
  updated: "2026-06-10",
  blocks: [
    {
      type: "p",
      text: "A spiking network is not just a bag of neurons - it is neurons plus the wiring between them. CortexSim lets you swap the connection topology while keeping every other parameter fixed, which makes it easy to see how structure shapes dynamics. This guide explains the four available topologies and what each one is good for.",
    },
    { type: "h", text: "Random (Erdos-Renyi)" },
    {
      type: "p",
      text: "Every possible directed connection exists with the same fixed probability, set by the Connectivity slider. This is the classic baseline: there are no spatial preferences and no hubs. Random networks mix activity quickly and are ideal for studying mean-field behavior - the regime where you can reason about the whole population with averages.",
    },
    { type: "h", text: "Small-world (Watts-Strogatz)" },
    {
      type: "p",
      text: "Neurons are first wired to their near neighbors on a ring, then a fraction of those edges are randomly rewired to distant targets. The result has high local clustering (like a regular lattice) but short path lengths (like a random graph). Real cortex is strongly small-world, which is why this topology produces the most biologically realistic oscillations and traveling waves.",
    },
    {
      type: "tip",
      text: "Small-world wiring is the best starting point if your goal is to reproduce realistic rhythms. Combine it with the Gamma preset for a convincing demo.",
    },
    { type: "h", text: "Scale-free (Barabasi-Albert)" },
    {
      type: "p",
      text: "Connections are added with preferential attachment: new edges prefer already well-connected neurons. This produces a heavy-tailed degree distribution - a few hub neurons with enormous fan-out, and many neurons with few connections. Scale-free networks are robust to random failures but fragile if you silence a hub, which makes them great for studying targeted perturbations.",
    },
    { type: "h", text: "Grid (lattice)" },
    {
      type: "p",
      text: "Neurons sit on a regular 2D/3D lattice and connect only to nearby cells. Activity then propagates as visible spatial waves rather than mixing globally. Use the grid topology when you want to see structure in space - spiral waves, wavefronts, and localized bumps of activity.",
    },
    { type: "h", text: "Comparing them at a glance" },
    {
      type: "table",
      headers: ["Topology", "Clustering", "Path length", "Hubs", "Best for"],
      rows: [
        ["Random", "Low", "Short", "No", "Mean-field baselines"],
        ["Small-world", "High", "Short", "Mild", "Realistic rhythms"],
        ["Scale-free", "Medium", "Short", "Strong", "Robustness / attack studies"],
        ["Grid", "High", "Long", "No", "Spatial waves"],
      ],
    },
    { type: "h", text: "Conduction delays" },
    {
      type: "p",
      text: "Independent of topology, you can enable axonal conduction delays so that a spike takes several time steps to reach its targets, scaled by distance. Delays are what make polychronous groups and traveling waves possible. Turn them on, choose the grid topology, and watch activity ripple across space.",
    },
    {
      type: "warn",
      text: "Higher connectivity multiplies the work per step. If your FPS drops, reduce network size or connectivity before changing topology.",
    },
  ],
};
