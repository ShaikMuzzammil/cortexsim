import type { Guide } from "../types";

export const izhikevichModel: Guide = {
  slug: "izhikevich-model",
  title: "The Izhikevich neuron model",
  category: "Neuroscience",
  summary:
    "How a two-variable model reproduces the rich firing patterns of real cortical neurons, and what the a, b, c, d parameters actually do.",
  readingTimeMin: 8,
  updated: "2026-06-10",
  blocks: [
    {
      type: "p",
      text: "CortexSim's engine is built on the Izhikevich model, published by Eugene Izhikevich in 2003. It is famous for hitting a sweet spot: it is almost as computationally cheap as the simplest integrate-and-fire neuron, yet it can reproduce the firing patterns of roughly twenty different biological neuron types. That efficiency is exactly why we can run thousands of them per frame in your browser.",
    },
    { type: "h", text: "The equations" },
    {
      type: "p",
      text: "Each neuron tracks two state variables: a membrane potential v (roughly the voltage across the cell membrane in millivolts) and a recovery variable u (an abstraction of slow ionic currents that pull the neuron back toward rest).",
    },
    {
      type: "code",
      lang: "text",
      code: "dv/dt = 0.04 v^2 + 5 v + 140 - u + I\ndu/dt = a (b v - u)\n\nif v >= 30 mV:    // spike threshold\n    v <- c        // membrane reset\n    u <- u + d    // recovery jump",
    },
    {
      type: "p",
      text: "The quadratic term in the first equation is what gives the model its sharp, spike-like upstroke. When v crosses +30 mV the neuron is said to fire: we record a spike, reset v to c, and bump u by d. The current I bundles together synaptic input from other neurons, any injected stimulus, and background noise.",
    },
    {
      type: "tip",
      text: "In the Equation Editor you can rewrite dv/dt and du/dt yourself. The expressions are compiled into fast functions, so you can explore variants of the model live without touching code.",
    },
    { type: "h", text: "The four parameters" },
    {
      type: "table",
      headers: ["Param", "Controls", "Intuition"],
      rows: [
        ["a", "Recovery time scale", "Small a = slow recovery (u changes lazily). Larger a = faster recovery."],
        ["b", "Recovery sensitivity", "How strongly u tracks v. Higher b couples recovery to subthreshold voltage, encouraging bursting and rebound."],
        ["c", "Reset voltage", "The value v snaps to after a spike (typically around -65 to -50 mV)."],
        ["d", "Recovery reset", "How much u jumps after a spike. Large d produces strong spike-frequency adaptation."],
      ],
    },
    { type: "h", text: "The firing types in CortexSim" },
    {
      type: "p",
      text: "The model selectors expose five canonical regimes. Excitatory populations usually use RS or IB; inhibitory populations usually use FS.",
    },
    {
      type: "list",
      items: [
        "RS - Regular spiking (a=0.02, b=0.2, c=-65, d=8): the workhorse excitatory cortical neuron. Fires, then adapts to a steady slower rate.",
        "IB - Intrinsically bursting (c=-55, d=4): opens with a burst of spikes, then settles into regular firing.",
        "CH - Chattering (c=-50, d=2): fires fast, rhythmic bursts; a strong driver of high-frequency rhythms.",
        "FS - Fast spiking (a=0.1, d=2): the classic inhibitory interneuron - high sustained rates with little adaptation.",
        "LTS - Low-threshold spiking (b=0.25, d=2): inhibitory cells that fire readily and show rebound bursts.",
      ],
    },
    {
      type: "warn",
      text: "Because the model is a simplification, v is in millivolts but time is in a dimensionless unit close to one millisecond. Treat absolute frequencies as biologically plausible rather than exact.",
    },
    { type: "h", text: "Integration: Euler vs RK4" },
    {
      type: "p",
      text: "CortexSim integrates the equations with either forward Euler (fast, default) or fourth-order Runge-Kutta (more accurate per step, more expensive). For large networks Euler with a small time step is usually the right trade-off; switch to RK4 when you need precise single-neuron trajectories in the phase plane.",
    },
    {
      type: "tip",
      text: "Open the Phase plane chart and probe a neuron to watch the (v, u) trajectory spiral and reset. It is the clearest way to build intuition for what a, b, c and d do.",
    },
  ],
};
