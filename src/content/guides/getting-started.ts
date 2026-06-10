import type { Guide } from "../types";

export const gettingStarted: Guide = {
  slug: "getting-started",
  title: "Getting started with CortexSim",
  category: "Basics",
  summary:
    "A five-minute tour of the simulator: what it models, how to run your first network, and how to read what you see on screen.",
  readingTimeMin: 5,
  updated: "2026-06-10",
  blocks: [
    {
      type: "p",
      text: "CortexSim is an interactive, browser-based spiking neural network laboratory. It simulates thousands of biologically inspired neurons in real time and renders their activity as a living 3D brain, spike rasters, firing-rate traces, power spectra and more. Everything runs locally in your browser using a hand-written integration engine, so there is no server round-trip in the hot loop and you get smooth 60 frames-per-second feedback.",
    },
    {
      type: "p",
      text: "This guide walks you from a blank screen to a running, analyzable network. You do not need any neuroscience background to follow along, although the later guides go much deeper.",
    },
    { type: "h", text: "1. Launch the simulator" },
    {
      type: "ol",
      items: [
        "From the landing page, click 'Launch simulator' (or open the Simulator link in the top navigation).",
        "The network builds automatically and starts running. You should immediately see neurons lighting up in the central 3D view.",
        "If your device cannot create a WebGL context, the view falls back to a fast 2D projection. You can switch modes at any time from the render toggle.",
      ],
    },
    {
      type: "tip",
      text: "Press the spacebar at any time to pause or resume the simulation. This is the single most useful shortcut while you learn.",
    },
    { type: "h", text: "2. Understand the three-column layout" },
    {
      type: "list",
      items: [
        "Left column - Controls: sliders and selectors that define the network (size, connectivity, excitatory / inhibitory balance, neuron models, topology) plus a preset bar for one-click scenarios.",
        "Center column - Visualization: the 3D / 2D network, followed by a grid of live charts (raster, firing rate, power spectrum, membrane voltage, phase plane, correlation matrix).",
        "Right column - Tools: an equation editor for the neuron dynamics, a custom metric calculator, a parameter sweep runner, and the export panel.",
      ],
    },
    { type: "h", text: "3. Run your first experiment" },
    {
      type: "ol",
      items: [
        "In the preset bar, click 'Gamma'. The network reconfigures into a regime that produces 30-80 Hz oscillations.",
        "Watch the Power Spectrum chart: a clear peak should appear in the gamma band, and the 'Dominant Hz' metric in the top bar should settle around that frequency.",
        "Drag the 'Input drive' slider up and down. Notice how the firing rate and the spectral peak shift in response.",
        "Click any neuron in the 3D view to probe it - its membrane voltage now streams into the Voltage scope and the Phase plane.",
      ],
    },
    {
      type: "tip",
      text: "If the network goes silent, raise 'Input drive' or 'Excitatory gain'. If it saturates into a seizure-like storm, raise 'Inhibitory gain' or lower connectivity.",
    },
    { type: "h", text: "4. Read the metrics bar" },
    {
      type: "table",
      headers: ["Metric", "Meaning"],
      rows: [
        ["Rate", "Mean population firing rate in Hz (spikes per neuron per second)."],
        ["Active %", "Fraction of neurons that fired within the recent window."],
        ["Synchrony", "How phase-aligned the population is (0 = asynchronous, 1 = locked)."],
        ["Dominant Hz", "Peak frequency of the population rate via Welch's method."],
        ["FPS", "Render + compute frame rate; a health indicator for your device."],
      ],
    },
    { type: "h", text: "5. Save and export" },
    {
      type: "p",
      text: "Use the Export panel to download spikes as CSV, the full configuration and metrics as JSON, a snapshot of any chart as PNG, or a formatted PDF report. You can also save a named experiment - if a MongoDB connection is configured it persists server-side, otherwise it is stored in your browser.",
    },
    {
      type: "p",
      text: "That is the whole loop: configure, run, observe, probe, export. The remaining guides explain the science and math behind each control so you can design your own experiments with intent.",
    },
  ],
};
