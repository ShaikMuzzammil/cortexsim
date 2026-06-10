import type { Guide } from "../types";

export const stdpPlasticity: Guide = {
  slug: "stdp-plasticity",
  title: "Plasticity and STDP",
  category: "Neuroscience",
  summary:
    "How spike-timing-dependent plasticity lets the network learn, and what to watch when you switch it on.",
  readingTimeMin: 6,
  updated: "2026-06-10",
  blocks: [
    {
      type: "p",
      text: "So far the wiring has been fixed. Real synapses change strength based on activity, and that is how brains learn. CortexSim implements spike-timing-dependent plasticity (STDP), the most influential biological learning rule, which you can toggle on at any time.",
    },
    { type: "h", text: "The rule in one sentence" },
    {
      type: "p",
      text: "Neurons that fire together wire together - but order matters. If a presynaptic spike arrives just before the postsynaptic neuron fires, the synapse is strengthened (it helped cause the spike). If it arrives just after, the synapse is weakened (it could not have helped). The closer in time, the larger the change.",
    },
    {
      type: "code",
      lang: "text",
      code: "dt = t_post - t_pre\nif dt > 0:   dw = +A_plus  * exp(-dt / tau_plus)   // potentiation\nif dt < 0:   dw = -A_minus * exp( dt / tau_minus)  // depression",
    },
    {
      type: "p",
      text: "This asymmetric window means the network discovers causal, predictive structure on its own: connections that reliably predict their target's firing grow stronger, while coincidental ones decay.",
    },
    { type: "h", text: "Using it in CortexSim" },
    {
      type: "ol",
      items: [
        "Enable the STDP toggle in the control panel.",
        "Set a learning rate - small values change weights slowly and stably; large values adapt fast but can destabilize.",
        "Run the network and watch the correlation matrix and synchrony evolve over time as structure self-organizes.",
        "Inject a repeated stimulus to a subset of neurons and watch an assembly form around it.",
      ],
    },
    {
      type: "tip",
      text: "STDP combined with conduction delays produces polychronous groups - reproducible time-locked firing sequences that Izhikevich proposed as a substrate for memory. Enable both to explore them.",
    },
    {
      type: "warn",
      text: "Plasticity is a positive-feedback process. Without homeostatic limits, high learning rates can drive runaway potentiation. If the network destabilizes, lower the learning rate or briefly disable STDP to let it settle.",
    },
  ],
};
