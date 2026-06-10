import type { Guide } from "../types";

export const exportingData: Guide = {
  slug: "exporting-data",
  title: "Exporting data and reports",
  category: "Workflow",
  summary:
    "Every way to get your results out of CortexSim - CSV, JSON, PNG, PDF, recordings, and saved experiments.",
  readingTimeMin: 5,
  updated: "2026-06-10",
  blocks: [
    {
      type: "p",
      text: "A simulator is only useful if you can capture what you find. CortexSim's Export panel offers several formats depending on whether you want raw data, a figure, a shareable report, or a reproducible experiment.",
    },
    { type: "h", text: "Raw data" },
    {
      type: "list",
      items: [
        "Spikes CSV: a row per spike with time and neuron index. Open in any spreadsheet or load into Python / R for offline analysis.",
        "State JSON: the full configuration plus the current metrics snapshot - everything needed to reproduce the run exactly.",
      ],
    },
    { type: "h", text: "Figures and reports" },
    {
      type: "list",
      items: [
        "Chart PNG: export any chart (raster, spectrum, voltage, etc.) as a high-resolution image for slides or papers.",
        "PDF report: a formatted document combining the configuration table, key metrics, and notes - generated via the browser print pipeline.",
      ],
    },
    { type: "h", text: "Recordings" },
    {
      type: "p",
      text: "The built-in Recorder captures metrics over time. Start it before an experiment, stop it after, and export the time series to analyze how the network evolved - for example, how synchrony climbed as you increased excitatory gain.",
    },
    { type: "h", text: "Saved experiments" },
    {
      type: "p",
      text: "Saving an experiment stores its name, configuration, notes and a metrics snapshot. If a MongoDB connection is configured via environment variables, saves persist to the database and are available across devices through the API. Without a database, saves fall back to your browser's local storage so the feature still works out of the box.",
    },
    {
      type: "tip",
      text: "Give every saved experiment a descriptive name and a note about what you were testing. Future-you will thank present-you when comparing a dozen runs.",
    },
    {
      type: "code",
      lang: "bash",
      code: "# The save endpoint, if a database is configured:\nPOST /api/simulations    { name, config, notes }\nGET  /api/simulations    -> list saved runs\nGET  /api/simulations/:id -> load one\nDELETE /api/simulations/:id",
    },
  ],
};
