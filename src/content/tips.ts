import type { Tip } from "./types";

export const KEYBOARD_SHORTCUTS: Array<{ combo: string; action: string }> = [
  { combo: "Space", action: "Play / pause the simulation" },
  { combo: "R", action: "Reset the network with current parameters" },
  { combo: "I", action: "Inject a stimulus pulse into the population" },
  { combo: "Right Arrow", action: "Advance a single step while paused" },
  { combo: "2 / 3", action: "Switch between 2D and 3D render modes" },
  { combo: "T", action: "Toggle light / dark theme" },
];

export const TIPS: Tip[] = [
  {
    title: "Start from a preset, then tweak",
    body: "Presets put you in a known regime instantly. Pick the one closest to what you want, then move one slider at a time so you can attribute every change to a cause.",
    category: "Workflow",
  },
  {
    title: "Change one variable at a time",
    body: "The network is nonlinear, so moving two controls at once makes results impossible to interpret. Isolate variables like a good experimentalist.",
    category: "Workflow",
  },
  {
    title: "Use the raster as your dashboard",
    body: "Before reading any metric, glance at the raster. Speckle means asynchronous, vertical bands mean synchronized, diagonals mean traveling waves, empty means silent.",
    category: "Analysis",
  },
  {
    title: "If it is silent, drive it",
    body: "A blank network almost always needs more Input drive or Excitatory gain. Raise them gradually until sparse firing appears.",
    category: "Troubleshooting",
  },
  {
    title: "If it storms, add inhibition",
    body: "Runaway synchronized firing is cured by raising Inhibitory gain or lowering connectivity. This is the network's version of applying the brakes.",
    category: "Troubleshooting",
  },
  {
    title: "Probe before you theorize",
    body: "Click a neuron to stream its voltage into the scope and phase plane. Watching a single cell often explains population behavior faster than any metric.",
    category: "Analysis",
  },
  {
    title: "Drop to 2D for big networks",
    body: "The 3D view is gorgeous but costs frames. If FPS sags on a large network, switch to the 2D projection - the science is identical.",
    category: "Performance",
  },
  {
    title: "Cap network size during sweeps",
    body: "Parameter sweeps run many short simulations back to back. Keep the network modest so each point finishes quickly and the sweep stays responsive.",
    category: "Performance",
  },
  {
    title: "Name and note every saved run",
    body: "A descriptive name plus a one-line note about your hypothesis turns a pile of saves into a usable lab notebook.",
    category: "Workflow",
  },
  {
    title: "Enable delays for spatial structure",
    body: "Conduction delays plus the grid topology unlock traveling waves and polychronous groups - some of the most beautiful behavior in the simulator.",
    category: "Exploration",
  },
  {
    title: "Let STDP settle",
    body: "After enabling plasticity, give the network time at a low learning rate. Structure emerges gradually; rushing it with a high rate causes instability.",
    category: "Exploration",
  },
  {
    title: "Export early, export often",
    body: "When you find something interesting, capture it immediately - a CSV of spikes or a PNG of the spectrum costs nothing and saves re-running later.",
    category: "Workflow",
  },
  {
    title: "Move one slider at a time",
    body: "To attribute an effect to a cause, change a single parameter between runs. Sweeping two at once makes the result impossible to interpret.",
    category: "Exploration",
  },
  {
    title: "Watch synchrony at the tipping point",
    body: "The jump from balanced firing to population bursts is often sharp. Reduce inhibition slowly and keep an eye on the synchrony index to catch the transition.",
    category: "Neuroscience",
  },
  {
    title: "Read peaks, not pictures",
    body: "A rhythm you think you see in the raster should show up as a peak in the power spectrum. If it doesn't, it may be an illusion of the eye.",
    category: "Analysis",
  },
  {
    title: "Pin the seed for papers",
    body: "Record the random seed with every run you intend to publish. Vary only the seed when you want to report run-to-run variability.",
    category: "Workflow",
  },
  {
    title: "Use the Compare view",
    body: "Instead of squinting between two runs, open Compare and diff up to four side by side - differing config rows are highlighted automatically.",
    category: "Workflow",
  },
  {
    title: "Aim for sparsity when prototyping hardware",
    body: "Low average firing rates translate directly into lower energy on neuromorphic chips. Keep the network quiet but informative.",
    category: "Neuromorphic",
  },
  {
    title: "Name runs like a scientist",
    body: "A label like 'drive-0.6-strong-inhib' beats 'run 14'. Future-you comparing a dozen runs will be grateful.",
    category: "Workflow",
  },
];
