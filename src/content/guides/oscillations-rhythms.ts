import type { Guide } from "../types";

export const oscillationsRhythms: Guide = {
  slug: "oscillations-and-rhythms",
  title: "Brain oscillations and rhythms",
  category: "Neuroscience",
  summary:
    "Why networks oscillate, what the classic frequency bands mean, and how to find and steer rhythms inside CortexSim.",
  readingTimeMin: 8,
  updated: "2026-06-14",
  blocks: [
    {
      type: "p",
      text: "Oscillations are the heartbeat of the brain. When large groups of neurons fire in a coordinated, repeating pattern, the summed activity rises and falls as a rhythm. These rhythms organise communication, route information between regions, and gate when learning happens.",
    },
    { type: "h", text: "The classic frequency bands" },
    {
      type: "table",
      headers: ["Band", "Range", "Associated with"],
      rows: [
        ["Delta", "1-4 Hz", "Deep sleep, large-scale coordination"],
        ["Theta", "4-8 Hz", "Navigation, memory encoding"],
        ["Alpha", "8-12 Hz", "Idling cortex, attention gating"],
        ["Beta", "12-30 Hz", "Motor control, active maintenance"],
        ["Gamma", "30-80 Hz", "Local processing, feature binding"],
      ],
    },
    { type: "h", text: "Where rhythms come from" },
    {
      type: "p",
      text: "The most robust generator in CortexSim is the interaction between excitatory and inhibitory populations. Excitation drives firing; inhibition catches up and silences the network; the silence releases inhibition and the cycle repeats. This pyramidal-interneuron gamma (PING) loop produces a rhythm whose frequency is set by the inhibitory time constant and the drive.",
    },
    { type: "math", text: "f_gamma \\approx 1 / (2 \\tau_{inh})" },
    {
      type: "list",
      items: [
        "Raise excitatory gain to speed the oscillation up.",
        "Lengthen inhibitory decay to slow it down.",
        "Add conduction delays to create travelling waves rather than standing rhythms.",
      ],
    },
    { type: "h", text: "Finding rhythms in the app" },
    {
      type: "ol",
      items: [
        "Open the Rate or LFP view and watch for periodic rises and falls.",
        "Switch to the Power Spectrum to read the dominant frequency as a peak.",
        "Open the Spectrogram to see which bands switch on and off over time.",
        "Use the Cross-correlation module to measure the lag between two groups.",
      ],
    },
    {
      type: "tip",
      text: "A sharp, tall spectral peak means a clean rhythm; a broad bump means a noisy, irregular oscillation. Both are biologically real - cortex spends most of its time in the broad, irregular regime.",
    },
    {
      type: "warn",
      text: "Very strong synchrony that locks the whole network into one giant spike every cycle is the model's version of a seizure. Interesting to study, but not the asynchronous state healthy cortex usually lives in.",
    },
    {
      type: "code",
      lang: "text",
      code: "Recipe: gamma oscillation\n- drive: medium-high\n- E/I balance: tip slightly toward excitation\n- inhibitory decay: short (fast interneurons)\n- delays: small\nResult: a 30-60 Hz peak in the spectrum.",
    },
  ],
};
