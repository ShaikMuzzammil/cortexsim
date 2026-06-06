/**
 * presets.js — Curated network configurations, several reproducing classic
 * computational-neuroscience regimes (Brunel 2000, Izhikevich 2003).
 * Each preset returns a partial config merged over DEFAULT_CONFIG.
 */
export const PRESETS = {
  brunel_ai: {
    label: "Brunel — Asynchronous Irregular (AI)",
    description:
      "Sparse random E/I network in the balanced regime. Produces low-rate, irregular, asynchronous firing — the cortical 'ground state' (Brunel 2000).",
    config: {
      model: "lif",
      N: 1000,
      excitatoryRatio: 0.8,
      connectionProb: 0.1,
      J: 0.2,
      g: 5.0,
      delay: 1.5,
      inputRate: 18,
      inputWeight: 0.6,
      stdp: false,
    },
  },
  brunel_si: {
    label: "Brunel — Synchronous Regular (SR)",
    description:
      "Weak inhibition + strong drive yields network-wide synchronous bursts. A classic instability regime.",
    config: {
      model: "lif",
      N: 1000,
      excitatoryRatio: 0.8,
      connectionProb: 0.1,
      J: 0.3,
      g: 3.0,
      delay: 1.5,
      inputRate: 30,
      inputWeight: 0.7,
      stdp: false,
    },
  },
  gamma: {
    label: "Gamma Oscillation (~40 Hz)",
    description:
      "Strong recurrent inhibition with delay generates a population gamma rhythm via the PING/ING mechanism.",
    config: {
      model: "lif",
      N: 1200,
      excitatoryRatio: 0.8,
      connectionProb: 0.15,
      J: 0.25,
      g: 6.0,
      delay: 2.0,
      inputRate: 28,
      inputWeight: 0.65,
      stdp: false,
    },
  },
  izhi_rs: {
    label: "Izhikevich — Regular Spiking Cortex",
    description:
      "Izhikevich neurons (regular-spiking excitatory + fast-spiking inhibitory) in a random network.",
    config: {
      model: "izhikevich",
      N: 1000,
      excitatoryRatio: 0.8,
      connectionProb: 0.1,
      J: 6.0,
      g: 4.0,
      delay: 1.0,
      inputRate: 6,
      inputWeight: 5.0,
      tauSynExc: 5,
      tauSynInh: 6,
      modelParams: { a: 0.02, b: 0.2, c: -65, d: 8, i_scale: 1.0 },
    },
  },
  adex_adapt: {
    label: "AdEx — Spike-Frequency Adaptation",
    description:
      "Adaptive exponential neurons show clear spike-frequency adaptation and richer transients.",
    config: {
      model: "adex",
      N: 800,
      excitatoryRatio: 0.8,
      connectionProb: 0.12,
      J: 8.0,
      g: 4.0,
      delay: 1.5,
      inputRate: 12,
      inputWeight: 40,
      tauSynExc: 5,
      tauSynInh: 8,
    },
  },
  stdp_demo: {
    label: "STDP Plasticity Demo",
    description:
      "Excitatory→excitatory synapses are plastic. Watch the weight distribution reorganise over time.",
    config: {
      model: "lif",
      N: 800,
      excitatoryRatio: 0.8,
      connectionProb: 0.12,
      J: 0.2,
      g: 4.0,
      delay: 1.5,
      inputRate: 20,
      inputWeight: 0.6,
      stdp: true,
      stdpRate: 0.008,
      wMax: 1.0,
    },
  },
  single_burst: {
    label: "Single Neuron — Izhikevich Bursting",
    description:
      "One intrinsically bursting Izhikevich neuron driven by constant current. Great for teaching dynamics.",
    config: {
      model: "izhikevich",
      N: 1,
      excitatoryRatio: 1,
      connectionProb: 0,
      inputRate: 0,
      noise: 0,
      modelParams: { a: 0.02, b: 0.2, c: -50, d: 2, i_scale: 1.0 },
    },
  },
};

export function presetList() {
  return Object.keys(PRESETS).map((id) => ({
    id,
    label: PRESETS[id].label,
    description: PRESETS[id].description,
  }));
}

export function getPreset(id) {
  return PRESETS[id] ? { ...PRESETS[id].config } : null;
}
