// CortexSim export engine.
// A registry of export formats, each a pure (context) -> artifact builder so
// they can be unit-tested headlessly and listed in the Export Center UI.
// The browser-only triggerDownload turns an artifact into a file download.

import type { Metrics, SimConfig, Spike } from "@/types";

export interface ExportArtifact {
  filename: string;
  mime: string;
  content: string;
}

export interface ExportContext {
  cfg: SimConfig;
  metrics: Metrics;
  spikes: Spike[];
  notes: string;
  name?: string;
}

export type ExportGroup =
  | "Raw data"
  | "Reports"
  | "Figures"
  | "Scientific"
  | "Code"
  | "Graph";

export interface ExportFormat {
  id: string;
  label: string;
  ext: string;
  group: ExportGroup;
  description: string;
  build: (ctx: ExportContext) => ExportArtifact;
}

const APP = "CortexSim Studio";
const VERSION = "7.0.0";

function entries(obj: Record<string, unknown>): Array<[string, unknown]> {
  return Object.entries(obj || {});
}

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---------------------------------------------------------------- Raw data

export function buildSpikesCsv(ctx: ExportContext): ExportArtifact {
  let csv = "step,neuron\n";
  for (const s of ctx.spikes) csv += s.t + "," + s.i + "\n";
  return { filename: "cortexsim-spikes.csv", mime: "text/csv", content: csv };
}

export function buildSpikesTsv(ctx: ExportContext): ExportArtifact {
  let tsv = "step\tneuron\n";
  for (const s of ctx.spikes) tsv += s.t + "\t" + s.i + "\n";
  return {
    filename: "cortexsim-spikes.tsv",
    mime: "text/tab-separated-values",
    content: tsv,
  };
}

export function buildSpikesNdjson(ctx: ExportContext): ExportArtifact {
  const lines = ctx.spikes.map((s) => JSON.stringify({ t: s.t, i: s.i }));
  return {
    filename: "cortexsim-spikes.ndjson",
    mime: "application/x-ndjson",
    content: lines.join("\n") + (lines.length ? "\n" : ""),
  };
}

export function buildStateJson(ctx: ExportContext): ExportArtifact {
  const payload = {
    app: APP,
    version: VERSION,
    name: ctx.name || "untitled",
    exportedAt: new Date().toISOString(),
    config: ctx.cfg,
    metrics: ctx.metrics,
    spikeCount: ctx.spikes.length,
    notes: ctx.notes,
  };
  return {
    filename: "cortexsim-state.json",
    mime: "application/json",
    content: JSON.stringify(payload, null, 2),
  };
}

export function buildConfigYaml(ctx: ExportContext): ExportArtifact {
  const lines: string[] = [
    "# CortexSim configuration export",
    "app: " + APP,
    "version: " + VERSION,
    "exportedAt: " + new Date().toISOString(),
    "config:",
  ];
  for (const [k, v] of entries(ctx.cfg as Record<string, unknown>)) {
    lines.push("  " + k + ": " + JSON.stringify(v));
  }
  lines.push("metrics:");
  for (const [k, v] of entries(ctx.metrics as Record<string, unknown>)) {
    lines.push("  " + k + ": " + JSON.stringify(v));
  }
  return {
    filename: "cortexsim-config.yaml",
    mime: "text/yaml",
    content: lines.join("\n") + "\n",
  };
}

// ------------------------------------------------------------------ Reports

export function buildMarkdownReport(ctx: ExportContext): ExportArtifact {
  const cfgRows = entries(ctx.cfg as Record<string, unknown>)
    .map((e) => "| " + e[0] + " | " + String(e[1]) + " |")
    .join("\n");
  const mRows = entries(ctx.metrics as Record<string, unknown>)
    .map((e) => "| " + e[0] + " | " + String(e[1]) + " |")
    .join("\n");
  const md = [
    "# CortexSim Experiment Report",
    "",
    "> Generated " + new Date().toLocaleString() + " by " + APP + " v" + VERSION,
    "",
    "## Configuration",
    "",
    "| Parameter | Value |",
    "| --- | --- |",
    cfgRows,
    "",
    "## Metrics snapshot",
    "",
    "| Metric | Value |",
    "| --- | --- |",
    mRows,
    "",
    "## Notes",
    "",
    ctx.notes || "_(none)_",
    "",
    "## Provenance",
    "",
    "- Spikes captured: " + ctx.spikes.length,
    "- Reproduce by importing the matching `cortexsim-state.json`.",
    "",
  ].join("\n");
  return {
    filename: "cortexsim-report.md",
    mime: "text/markdown",
    content: md,
  };
}

export function buildStandaloneHtml(ctx: ExportContext): ExportArtifact {
  const cfgRows = entries(ctx.cfg as Record<string, unknown>)
    .map((e) => "<tr><td>" + esc(e[0]) + "</td><td>" + esc(String(e[1])) + "</td></tr>")
    .join("");
  const mRows = entries(ctx.metrics as Record<string, unknown>)
    .map((e) => "<tr><td>" + esc(e[0]) + "</td><td>" + esc(String(e[1])) + "</td></tr>")
    .join("");
  const html =
    "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"/>" +
    "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/>" +
    "<title>CortexSim Report</title><style>" +
    ":root{color-scheme:dark}body{font-family:Inter,system-ui,sans-serif;" +
    "background:#05070e;color:#e7ecf6;max-width:880px;margin:0 auto;padding:48px 24px}" +
    "h1{color:#6ea8ff}h2{color:#9cc2ff;margin-top:32px}" +
    "table{border-collapse:collapse;width:100%;margin:12px 0}" +
    "td{border:1px solid #1d2742;padding:8px 12px}" +
    "tr:nth-child(even){background:#0b1020}" +
    ".muted{color:#7c89a6}</style></head><body>" +
    "<h1>CortexSim Experiment Report</h1>" +
    "<p class=\"muted\">Generated " + esc(new Date().toLocaleString()) +
    " &middot; " + APP + " v" + VERSION + "</p>" +
    "<h2>Configuration</h2><table>" + cfgRows + "</table>" +
    "<h2>Metrics</h2><table>" + mRows + "</table>" +
    "<h2>Notes</h2><p>" + esc(ctx.notes || "(none)") + "</p>" +
    "<p class=\"muted\">Spikes captured: " + ctx.spikes.length + "</p>" +
    "</body></html>";
  return {
    filename: "cortexsim-report.html",
    mime: "text/html",
    content: html,
  };
}

// ------------------------------------------------------------------ Figures

// Render a self-contained SVG raster plot of the spike train.
export function buildRasterSvg(ctx: ExportContext): ExportArtifact {
  const W = 1000;
  const H = 420;
  const pad = 40;
  const spikes = ctx.spikes;
  let maxT = 1;
  let maxI = 1;
  for (const s of spikes) {
    if (s.t > maxT) maxT = s.t;
    if (s.i > maxI) maxI = s.i;
  }
  const sample = spikes.length > 6000 ? Math.ceil(spikes.length / 6000) : 1;
  const dots: string[] = [];
  for (let k = 0; k < spikes.length; k += sample) {
    const s = spikes[k];
    const x = pad + ((W - 2 * pad) * s.t) / maxT;
    const y = pad + ((H - 2 * pad) * s.i) / maxI;
    dots.push(
      "<circle cx=\"" + x.toFixed(1) + "\" cy=\"" + y.toFixed(1) +
        "\" r=\"1.1\" fill=\"#6ea8ff\"/>",
    );
  }
  const svg =
    "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + W + "\" height=\"" + H +
    "\" viewBox=\"0 0 " + W + " " + H + "\">" +
    "<rect width=\"" + W + "\" height=\"" + H + "\" fill=\"#05070e\"/>" +
    "<text x=\"" + pad + "\" y=\"24\" fill=\"#9cc2ff\" font-family=\"sans-serif\" " +
    "font-size=\"14\">CortexSim raster - " + spikes.length + " spikes</text>" +
    dots.join("") +
    "</svg>";
  return { filename: "cortexsim-raster.svg", mime: "image/svg+xml", content: svg };
}

// --------------------------------------------------------------- Scientific

export function buildLatexTable(ctx: ExportContext): ExportArtifact {
  const rows = entries(ctx.cfg as Record<string, unknown>)
    .map((e) => "  " + String(e[0]).replace(/_/g, "\\_") + " & " + String(e[1]) + " \\\\")
    .join("\n");
  const tex = [
    "% CortexSim configuration table",
    "\\begin{table}[h]",
    "\\centering",
    "\\caption{CortexSim simulation parameters}",
    "\\begin{tabular}{ll}",
    "\\hline",
    "Parameter & Value \\\\",
    "\\hline",
    rows,
    "\\hline",
    "\\end{tabular}",
    "\\end{table}",
    "",
  ].join("\n");
  return { filename: "cortexsim-table.tex", mime: "text/x-tex", content: tex };
}

export function buildMatlabScript(ctx: ExportContext): ExportArtifact {
  const cfgLines = entries(ctx.cfg as Record<string, unknown>)
    .filter((e) => typeof e[1] === "number")
    .map((e) => "cfg." + e[0] + " = " + e[1] + ";")
    .join("\n");
  const m = [
    "% CortexSim export - load spikes and plot a raster in MATLAB / Octave",
    "% Place cortexsim-spikes.csv next to this script.",
    cfgLines,
    "S = readmatrix('cortexsim-spikes.csv');",
    "figure; plot(S(:,1), S(:,2), '.', 'MarkerSize', 2);",
    "xlabel('step'); ylabel('neuron'); title('CortexSim raster');",
    "",
  ].join("\n");
  return { filename: "cortexsim_plot.m", mime: "text/plain", content: m };
}

export function buildPythonScript(ctx: ExportContext): ExportArtifact {
  const cfgJson = JSON.stringify(ctx.cfg, null, 4);
  const py = [
    '"""CortexSim export - reload spikes + config and plot in Python."""',
    "import csv",
    "import matplotlib.pyplot as plt",
    "",
    "config = " + cfgJson.replace(/true/g, "True").replace(/false/g, "False").replace(/null/g, "None") + "",
    "",
    "steps, neurons = [], []",
    "with open('cortexsim-spikes.csv') as f:",
    "    reader = csv.reader(f)",
    "    next(reader, None)  # header",
    "    for row in reader:",
    "        steps.append(int(row[0]))",
    "        neurons.append(int(row[1]))",
    "",
    "plt.figure(figsize=(10, 4))",
    "plt.scatter(steps, neurons, s=1, c='#6ea8ff')",
    "plt.xlabel('step'); plt.ylabel('neuron'); plt.title('CortexSim raster')",
    "plt.tight_layout(); plt.show()",
    "",
  ].join("\n");
  return { filename: "cortexsim_plot.py", mime: "text/x-python", content: py };
}

export function buildRScript(ctx: ExportContext): ExportArtifact {
  const r = [
    "# CortexSim export - reload spikes and plot a raster in R",
    "s <- read.csv('cortexsim-spikes.csv')",
    "plot(s$step, s$neuron, pch='.', col='#6ea8ff',",
    "     xlab='step', ylab='neuron', main='CortexSim raster')",
    "",
  ].join("\n");
  return { filename: "cortexsim_plot.R", mime: "text/plain", content: r };
}

export function buildNumpyText(ctx: ExportContext): ExportArtifact {
  const lines = ctx.spikes.map((s) => s.t + " " + s.i);
  const header = "# step neuron - load with numpy.loadtxt('cortexsim-spikes.txt')";
  return {
    filename: "cortexsim-spikes.txt",
    mime: "text/plain",
    content: header + "\n" + lines.join("\n") + "\n",
  };
}

// ---------------------------------------------------------------------- Graph

// Reconstruct an approximate functional graph from co-firing within a window.
function coFiringEdges(spikes: Spike[], window = 3, cap = 400): Array<[number, number, number]> {
  const counts = new Map<string, number>();
  const recent: Spike[] = [];
  for (const s of spikes) {
    while (recent.length && s.t - recent[0].t > window) recent.shift();
    for (const r of recent) {
      if (r.i === s.i) continue;
      const a = Math.min(r.i, s.i);
      const b = Math.max(r.i, s.i);
      const key = a + "-" + b;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    recent.push(s);
  }
  const edges = Array.from(counts.entries())
    .map(([k, w]) => {
      const parts = k.split("-");
      return [Number(parts[0]), Number(parts[1]), w] as [number, number, number];
    })
    .sort((x, y) => y[2] - x[2])
    .slice(0, cap);
  return edges;
}

export function buildGraphml(ctx: ExportContext): ExportArtifact {
  const edges = coFiringEdges(ctx.spikes);
  const nodes = new Set<number>();
  for (const e of edges) {
    nodes.add(e[0]);
    nodes.add(e[1]);
  }
  const nodeXml = Array.from(nodes)
    .map((n) => "    <node id=\"n" + n + "\"/>")
    .join("\n");
  const edgeXml = edges
    .map(
      (e, k) =>
        "    <edge id=\"e" + k + "\" source=\"n" + e[0] + "\" target=\"n" + e[1] +
        "\"><data key=\"w\">" + e[2] + "</data></edge>",
    )
    .join("\n");
  const xml =
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
    "<graphml xmlns=\"http://graphml.graphdrawing.org/xmlns\">\n" +
    "  <key id=\"w\" for=\"edge\" attr.name=\"weight\" attr.type=\"int\"/>\n" +
    "  <graph edgedefault=\"undirected\">\n" +
    nodeXml + "\n" + edgeXml + "\n" +
    "  </graph>\n</graphml>\n";
  return { filename: "cortexsim-graph.graphml", mime: "application/xml", content: xml };
}

export function buildGraphvizDot(ctx: ExportContext): ExportArtifact {
  const edges = coFiringEdges(ctx.spikes, 3, 200);
  const body = edges
    .map((e) => "  n" + e[0] + " -- n" + e[1] + " [penwidth=" + Math.min(6, 1 + e[2] / 4).toFixed(1) + "];")
    .join("\n");
  const dot = "graph cortexsim {\n  bgcolor=\"#05070e\";\n  node [color=\"#6ea8ff\"];\n  edge [color=\"#5db1ff\"];\n" + body + "\n}\n";
  return { filename: "cortexsim-graph.dot", mime: "text/vnd.graphviz", content: dot };
}

// ------------------------------------------------------------------ Registry

export const EXPORT_FORMATS: ExportFormat[] = [
  { id: "csv", label: "Spikes CSV", ext: "csv", group: "Raw data", description: "One row per spike: step, neuron index.", build: buildSpikesCsv },
  { id: "tsv", label: "Spikes TSV", ext: "tsv", group: "Raw data", description: "Tab-separated spike train for legacy tools.", build: buildSpikesTsv },
  { id: "ndjson", label: "Spikes NDJSON", ext: "ndjson", group: "Raw data", description: "Newline-delimited JSON, ideal for streaming pipelines.", build: buildSpikesNdjson },
  { id: "json", label: "State JSON", ext: "json", group: "Raw data", description: "Full config + metrics snapshot to reproduce a run.", build: buildStateJson },
  { id: "yaml", label: "Config YAML", ext: "yaml", group: "Raw data", description: "Human-friendly config for version control.", build: buildConfigYaml },
  { id: "md", label: "Markdown report", ext: "md", group: "Reports", description: "A clean report you can paste into a wiki or PR.", build: buildMarkdownReport },
  { id: "html", label: "Standalone HTML", ext: "html", group: "Reports", description: "A self-contained dark-themed report page.", build: buildStandaloneHtml },
  { id: "svg", label: "Raster SVG", ext: "svg", group: "Figures", description: "Vector raster plot for papers and slides.", build: buildRasterSvg },
  { id: "tex", label: "LaTeX table", ext: "tex", group: "Scientific", description: "Parameter table ready for a manuscript.", build: buildLatexTable },
  { id: "matlab", label: "MATLAB script", ext: "m", group: "Code", description: "Reload + plot the raster in MATLAB / Octave.", build: buildMatlabScript },
  { id: "python", label: "Python script", ext: "py", group: "Code", description: "matplotlib script that re-plots your spikes.", build: buildPythonScript },
  { id: "r", label: "R script", ext: "R", group: "Code", description: "Base-R script to reload and plot.", build: buildRScript },
  { id: "numpy", label: "NumPy text", ext: "txt", group: "Code", description: "Whitespace matrix for numpy.loadtxt.", build: buildNumpyText },
  { id: "graphml", label: "GraphML", ext: "graphml", group: "Graph", description: "Functional co-firing graph for Gephi / Cytoscape.", build: buildGraphml },
  { id: "dot", label: "Graphviz DOT", ext: "dot", group: "Graph", description: "Co-firing graph for Graphviz rendering.", build: buildGraphvizDot },
];

export const EXPORT_GROUPS: ExportGroup[] = [
  "Raw data",
  "Reports",
  "Figures",
  "Scientific",
  "Code",
  "Graph",
];

export function formatsByGroup(): Array<{ group: ExportGroup; items: ExportFormat[] }> {
  return EXPORT_GROUPS.map((group) => ({
    group,
    items: EXPORT_FORMATS.filter((f) => f.group === group),
  })).filter((g) => g.items.length > 0);
}

// Browser-only: turn an artifact into a download.
export function triggerDownload(a: ExportArtifact) {
  if (typeof window === "undefined") return;
  const blob = new Blob([a.content], { type: a.mime });
  const url = URL.createObjectURL(blob);
  const el = document.createElement("a");
  el.href = url;
  el.download = a.filename;
  document.body.appendChild(el);
  el.click();
  document.body.removeChild(el);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// Build a manifest describing everything that can be exported (for the API).
export function exportManifest(): Array<{ id: string; label: string; group: string; ext: string; description: string }> {
  return EXPORT_FORMATS.map((f) => ({ id: f.id, label: f.label, group: f.group, ext: f.ext, description: f.description }));
}
