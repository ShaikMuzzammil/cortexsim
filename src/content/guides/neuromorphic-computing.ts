import type { Guide } from "../types";

export const neuromorphicComputing: Guide = {
  slug: "neuromorphic-computing",
  title: "Neuromorphic computing and SNNs",
  category: "Workflow",
  summary:
    "How spiking networks become hardware and algorithms - from event-driven chips to energy-efficient AI - and how CortexSim helps you prototype the ideas.",
  readingTimeMin: 8,
  updated: "2026-06-14",
  blocks: [
    {
      type: "p",
      text: "Neuromorphic computing borrows the brain's tricks - spikes, sparsity, co-located memory and compute - to build machines that are dramatically more energy-efficient than conventional processors for the right tasks. The spiking networks you build in CortexSim are the same primitives these systems run.",
    },
    { type: "h", text: "Why spikes are efficient" },
    {
      type: "list",
      items: [
        "Event-driven: a neuron only consumes energy when it spikes, so a quiet network is nearly free.",
        "Sparse: only a few percent of neurons are active at any moment, slashing communication.",
        "In-memory: synaptic weights sit next to the compute, avoiding the von Neumann bottleneck.",
      ],
    },
    { type: "h", text: "The neuromorphic landscape" },
    {
      type: "table",
      headers: ["Platform", "Maker", "Idea"],
      rows: [
        ["Loihi 2", "Intel", "Programmable digital spiking cores"],
        ["TrueNorth", "IBM", "Million-neuron low-power inference"],
        ["SpiNNaker", "Manchester", "Massively parallel ARM mesh"],
        ["BrainScaleS", "Heidelberg", "Accelerated analog neurons"],
      ],
    },
    { type: "h", text: "From CortexSim to silicon" },
    {
      type: "ol",
      items: [
        "Prototype the dynamics here: pick cell models, wiring and plasticity that solve your task.",
        "Export the configuration as JSON or YAML for a reproducible spec.",
        "Map the network onto a hardware backend (e.g. via Lava for Loihi or PyNN for SpiNNaker).",
        "Validate that the hardware behaviour matches the simulation you tuned.",
      ],
    },
    {
      type: "p",
      text: "Training spiking networks is an active field. Surrogate-gradient methods let you backpropagate through the non-differentiable spike, while local rules like STDP - which CortexSim implements - learn without a global error signal, exactly as neuromorphic hardware prefers.",
    },
    {
      type: "tip",
      text: "Sparsity is a feature, not a bug. When prototyping for hardware, aim for low average firing rates - they translate directly into lower energy on a real chip.",
    },
    {
      type: "warn",
      text: "Analog neuromorphic hardware has device mismatch and noise that an idealised simulation lacks. Treat CortexSim as the clean upper bound, then budget for hardware imperfections.",
    },
    {
      type: "code",
      lang: "text",
      code: "Export -> spec -> backend\nCortexSim JSON  ->  Lava / PyNN / Nengo  ->  Loihi / SpiNNaker",
    },
  ],
};
