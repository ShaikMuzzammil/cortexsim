// Interactive metadata layered on top of each guide. This is what turns the
// guides into a real learning platform: every module has concrete objectives
// ("what to do"), hands-on experiments, and the outcomes a learner should
// observe. The learn store tracks completion of these per user (localStorage).

export interface ModuleMeta {
  slug: string;
  objectives: string[];
  tryThis: string[];
  outcomes: string[];
  xp: number;
}

export const MODULE_META: Record<string, ModuleMeta> = {
  "getting-started": {
    slug: "getting-started",
    objectives: [
      "Launch the simulator and confirm neurons are firing in the 3D view.",
      "Identify the three columns: Controls, Visualization, Tools.",
      "Apply the Gamma preset and locate the peak in the Power Spectrum.",
      "Click a neuron to probe it and watch its voltage stream in.",
    ],
    tryThis: [
      "Pause with Space, then press the Right Arrow to step one frame at a time.",
      "Drag Input drive from low to high and narrate what each metric does.",
    ],
    outcomes: [
      "You can start, pause, reset and read the live metrics with confidence.",
      "You understand what each panel of the workspace is for.",
    ],
    xp: 100,
  },
  "izhikevich-model": {
    slug: "izhikevich-model",
    objectives: [
      "Read the two-variable model equations and name what v and u represent.",
      "Switch the excitatory model between RS, IB and CH and watch the raster.",
      "Open the Phase plane and probe a neuron to see the (v, u) trajectory.",
    ],
    tryThis: [
      "In the Equation Editor, change the +140 constant and observe the rate shift.",
      "Set the inhibitory model to LTS and compare rebound bursts vs FS.",
    ],
    outcomes: [
      "You can predict how a, b, c and d reshape a neuron's firing pattern.",
      "You can read a phase-plane trajectory and connect it to spikes.",
    ],
    xp: 150,
  },
  "spiking-dynamics": {
    slug: "spiking-dynamics",
    objectives: [
      "Drive the network from silent into sparse asynchronous firing.",
      "Raise excitatory gain until a clear oscillation appears.",
      "Use inhibitory gain to pull a seizure-like storm back to balance.",
    ],
    tryThis: [
      "Find the smallest Input drive that keeps activity alive but irregular.",
      "Hold everything fixed and sweep only Noise; watch synchrony fall.",
    ],
    outcomes: [
      "You can locate the balanced regime and explain why cortex lives there.",
      "You can diagnose and fix a silent or storming network.",
    ],
    xp: 150,
  },
  "network-topologies": {
    slug: "network-topologies",
    objectives: [
      "Run the same parameters under random, small-world and grid wiring.",
      "Enable conduction delays with grid topology to produce traveling waves.",
      "Compare the correlation matrix structure across topologies.",
    ],
    tryThis: [
      "On scale-free wiring, raise connectivity slightly and watch hubs ignite.",
      "With grid + delays, look for diagonal streaks in the raster.",
    ],
    outcomes: [
      "You can match a topology to the dynamics you want to study.",
      "You understand how wiring, not just neurons, shapes computation.",
    ],
    xp: 150,
  },
  "spectral-analysis": {
    slug: "spectral-analysis",
    objectives: [
      "Produce a clean gamma peak and read the Dominant Hz metric.",
      "Identify which band (theta / beta / gamma) your network is in.",
      "Relate changes in inhibition to shifts in the spectral peak.",
    ],
    tryThis: [
      "Add conduction delays and watch the peak slide toward the beta band.",
      "Lower drive and strengthen adaptation to find a slow (delta) rhythm.",
    ],
    outcomes: [
      "You can read a power spectrum and name the rhythm a network produces.",
      "You can deliberately drive a target frequency band.",
    ],
    xp: 200,
  },
  "synchrony-metrics": {
    slug: "synchrony-metrics",
    objectives: [
      "Watch the synchrony index cross from low to high as you add excitation.",
      "Read the correlation matrix and spot a co-firing assembly.",
      "Connect entropy to the richness of the activity.",
    ],
    tryThis: [
      "Find the parameter setting where entropy is highest.",
      "Catch the moment structure appears in the correlation matrix.",
    ],
    outcomes: [
      "You can quantify coordination, not just eyeball it.",
      "You can read a raster like a dashboard of network state.",
    ],
    xp: 200,
  },
  "stdp-plasticity": {
    slug: "stdp-plasticity",
    objectives: [
      "Enable STDP and choose a stable learning rate.",
      "Inject a repeated stimulus and watch an assembly form.",
      "Combine STDP with delays to explore polychronous groups.",
    ],
    tryThis: [
      "Compare a low vs high learning rate and note where it destabilizes.",
      "Disable STDP mid-run and see whether learned structure persists.",
    ],
    outcomes: [
      "You can explain how spike timing changes synaptic weights.",
      "You can make a network self-organize toward a stimulus.",
    ],
    xp: 250,
  },
  "exporting-data": {
    slug: "exporting-data",
    objectives: [
      "Export a spikes CSV and a state JSON of a run you like.",
      "Capture a chart as PNG and generate a PDF report.",
      "Save a named experiment with a note describing your hypothesis.",
    ],
    tryThis: [
      "Record metrics while sweeping a parameter, then export the time series.",
      "Reload a saved experiment and confirm it reproduces exactly.",
    ],
    outcomes: [
      "You can get every result out of the simulator in a usable format.",
      "You keep a reproducible lab notebook of your experiments.",
    ],
    xp: 150,
  },
};

export function getModuleMeta(slug: string): ModuleMeta | undefined {
  return MODULE_META[slug];
}

export const TOTAL_XP = Object.values(MODULE_META).reduce((s, m) => s + m.xp, 0);
