import type { Metrics, SimConfig } from "./snn/types";

export interface SpikeRecord {
  t: number;
  i: number;
  exc: boolean;
}

export interface ReportImages {
  network?: string;
  raster?: string;
  rate?: string;
  spectrum?: string;
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function downloadText(
  text: string,
  filename: string,
  mime = "text/plain",
) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportPng(
  canvas: HTMLCanvasElement | null,
  filename = "cortexsim-network.png",
) {
  if (!canvas) return;
  triggerDownload(canvas.toDataURL("image/png"), filename);
}

export function exportCsv(
  spikes: SpikeRecord[],
  filename = "cortexsim-spikes.csv",
) {
  const header = "time_ms,neuron,type\n";
  const body = spikes
    .map((s) => `${s.t},${s.i},${s.exc ? "exc" : "inh"}`)
    .join("\n");
  downloadText(header + body, filename, "text/csv");
}

export function exportJson(
  config: SimConfig,
  metrics: Metrics,
  filename = "cortexsim-config.json",
) {
  const payload = {
    app: "CortexSim Pro",
    exportedAt: new Date().toISOString(),
    config,
    metrics,
  };
  downloadText(JSON.stringify(payload, null, 2), filename, "application/json");
}

export function exportPdfReport(
  config: SimConfig,
  metrics: Metrics,
  images: ReportImages,
) {
  const win = window.open("", "_blank", "width=900,height=1200");
  if (!win) {
    alert("Please allow pop-ups to generate the PDF report.");
    return;
  }
  const now = new Date().toLocaleString();
  const metric = (k: string, v: string) =>
    `<tr><td>${k}</td><td>${v}</td></tr>`;
  const img = (title: string, src?: string) =>
    src
      ? `<figure><figcaption>${title}</figcaption><img src="${src}" /></figure>`
      : "";
  const html = [
    "<!doctype html><html><head><meta charset='utf-8'/>",
    "<title>CortexSim Pro — Report</title>",
    "<style>",
    "*{box-sizing:border-box;font-family:Inter,Arial,sans-serif}",
    "body{margin:0;padding:40px;color:#0b0e16;background:#fff}",
    "h1{margin:0;font-size:26px}",
    ".sub{color:#667;margin:4px 0 24px}",
    "h2{font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:#445;margin:28px 0 8px;border-bottom:1px solid #e5e7eb;padding-bottom:6px}",
    "table{border-collapse:collapse;width:100%;font-size:13px}",
    "td{border:1px solid #e5e7eb;padding:7px 10px}",
    "td:first-child{color:#667;width:48%}",
    "figure{margin:0 0 18px}",
    "figcaption{font-size:12px;color:#667;margin-bottom:6px}",
    "img{width:100%;border:1px solid #e5e7eb;border-radius:8px;background:#05060a}",
    "</style></head><body>",
    "<h1>CortexSim Pro — Simulation Report</h1>",
    `<div class='sub'>Generated ${now}</div>`,
    "<h2>Network configuration</h2><table>",
    metric("Neurons", String(config.N)),
    metric("Excitatory fraction", `${Math.round(config.pe * 100)}%`),
    metric("Connectivity", `${Math.round(config.conn * 100)}%`),
    metric("Excitatory gain", config.ge.toFixed(2)),
    metric("Inhibitory gain", config.gi.toFixed(2)),
    metric("Input drive", config.drive.toFixed(2)),
    metric("Cell model", config.model.toUpperCase()),
    "</table>",
    "<h2>Live metrics</h2><table>",
    metric("Simulated time", `${(metrics.timeMs / 1000).toFixed(2)} s`),
    metric("Mean firing rate", `${metrics.rateHz.toFixed(2)} Hz`),
    metric("Excitatory rate", `${metrics.rateExc.toFixed(2)} Hz`),
    metric("Inhibitory rate", `${metrics.rateInh.toFixed(2)} Hz`),
    metric("Dominant frequency", `${metrics.domHz.toFixed(1)} Hz`),
    metric("Synchrony index", metrics.synchrony.toFixed(3)),
    metric("Active neurons / frame", String(metrics.active)),
    metric("Total spikes", String(metrics.totalSpikes)),
    metric("Synapses", String(metrics.synapses)),
    "</table>",
    "<h2>Figures</h2>",
    img("3D neuron network", images.network),
    img("Spike raster", images.raster),
    img("Population firing rate", images.rate),
    img("Power spectrum", images.spectrum),
    "</body></html>",
  ].join("");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}
