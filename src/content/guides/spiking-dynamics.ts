import type { Guide } from "../types";

export const spikingDynamics: Guide = {
  slug: "spiking-dynamics",
  title: "Excitation, inhibition and balance",
  category: "Neuroscience",
  summary:
    "Why the ratio of excitatory to inhibitory drive decides whether a network is silent, balanced, oscillating, or seizing.",
  readingTimeMin: 7,
  updated: "2026-06-10",
  blocks: [
    {
      type: "p",
      text: "Cortical networks live on a knife edge. Too little drive and they fall silent; too much and they erupt into runaway, seizure-like activity. The interesting regimes - the ones that look like a thinking brain - sit in a narrow balanced band in between. CortexSim gives you direct sliders over the forces that set this balance.",
    },
    { type: "h", text: "The synaptic current" },
    {
      type: "p",
      text: "When a presynaptic neuron fires, it injects current into its targets. Excitatory neurons push the membrane voltage up (toward firing); inhibitory neurons pull it down. Each input decays over a synaptic time constant tau, so a spike's influence fades smoothly rather than vanishing instantly.",
    },
    {
      type: "code",
      lang: "text",
      code: "I_syn(t+dt) = I_syn(t) * exp(-dt / tau)\nI_syn += excGain   for each excitatory spike arriving\nI_syn -= inhGain   for each inhibitory spike arriving\nI_total = I_syn + inputDrive + noise",
    },
    { type: "h", text: "The four levers" },
    {
      type: "table",
      headers: ["Control", "Effect"],
      rows: [
        ["Input drive", "A constant background current to every neuron. The master throttle for overall activity."],
        ["Excitatory gain", "How hard each excitatory spike pushes its targets. Raises positive feedback."],
        ["Inhibitory gain", "How hard each inhibitory spike brakes its targets. The stabilizer."],
        ["Noise", "Random jitter added each step. Desynchronizes the population and adds realism."],
      ],
    },
    { type: "h", text: "The E/I ratio" },
    {
      type: "p",
      text: "By default about 80% of neurons are excitatory and 20% inhibitory, matching cortex. That 4:1 ratio is deceptive: because fast-spiking inhibitory cells fire at much higher rates, the actual current contributed by each population is roughly balanced. This is the celebrated 'balanced state', and it is what lets the network respond quickly and linearly to inputs.",
    },
    {
      type: "tip",
      text: "To feel the balance, slowly raise Excitatory gain while watching Synchrony and Rate. You will pass from asynchronous irregular firing, into rhythmic oscillation, and finally into a synchronized storm.",
    },
    { type: "h", text: "Four regimes to find" },
    {
      type: "ol",
      items: [
        "Silent: drive too low, almost no spikes. Raise Input drive.",
        "Asynchronous irregular: balanced, low synchrony, biologically realistic resting activity.",
        "Oscillatory: inhibition periodically silences then releases the population, producing a clear spectral peak.",
        "Synchronized storm: excitation dominates, the whole population fires together - the Seizure Storm preset lives here.",
      ],
    },
    {
      type: "warn",
      text: "The storm regime is informative but visually intense and computationally heavy. Reduce network size if the frame rate suffers.",
    },
  ],
};
