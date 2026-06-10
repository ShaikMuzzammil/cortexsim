import type { Metrics, SimConfig, Spike } from "@/types";
import { downloadBlob } from "@/lib/utils";

export function exportSpikesCsv(spikes: Spike[]) {
  let csv = "step,neuron\n";
  for (const s of spikes) csv += s.t + "," + s.i + "\n";
  downloadBlob(csv, "cortexsim-spikes.csv", "text/csv");
}

export function exportStateJson(cfg: SimConfig, metrics: Metrics) {
  const payload = {
    app: "CortexSim GODMODE",
    version: "6.0.0",
    exportedAt: new Date().toISOString(),
    config: cfg,
    metrics,
  };
  downloadBlob(JSON.stringify(payload, null, 2), "cortexsim-state.json", "application/json");
}

export function exportCanvasPng(canvas: HTMLCanvasElement | null, name = "cortexsim.png") {
  if (!canvas) return;
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Build a printable HTML report and open the print dialog (saves as PDF).
export function exportReport(cfg: SimConfig, metrics: Metrics, notes: string) {
  const rows = Object.entries(cfg)
    .map((e) => "<tr><td>" + e[0] + "</td><td>" + String(e[1]) + "</td></tr>")
    .join("");
  const mrows = Object.entries(metrics)
    .map((e) => "<tr><td>" + e[0] + "</td><td>" + String(e[1]) + "</td></tr>")
    .join("");
  const html =
    "<html><head><title>CortexSim Report</title>" +
    "<style>body{font-family:Inter,sans-serif;padding:40px;color:#0b1020}" +
    "h1{color:#3b6ad8}table{border-collapse:collapse;width:100%;margin:16px 0}" +
    "td{border:1px solid #ccc;padding:6px 10px}</style></head><body>" +
    "<h1>CortexSim GODMODE - Experiment Report</h1>" +
    "<p>Generated " + new Date().toLocaleString() + "</p>" +
    "<h2>Configuration</h2><table>" + rows + "</table>" +
    "<h2>Metrics snapshot</h2><table>" + mrows + "</table>" +
    "<h2>Notes</h2><p>" + (notes || "(none)") + "</p>" +
    "</body></html>";
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}

// Simple recorder: capture per-step population rate for playback / .cxs export.
export class Recorder {
  frames: number[] = [];
  recording = false;
  start() {
    this.recording = true;
    this.frames = [];
  }
  stop() {
    this.recording = false;
  }
  push(value: number) {
    if (this.recording) this.frames.push(value);
  }
  export() {
    const payload = { app: "CortexSim", kind: "recording", frames: this.frames };
    downloadBlob(JSON.stringify(payload), "cortexsim-recording.cxs", "application/json");
  }
}

// Safe-ish user formula compiler for the custom metric calculator.
export function compileFormula(
  expr: string,
): (scope: Record<string, number>) => number {
  // Allow only math-ish characters and known identifiers.
  const cleaned = expr.replace(/[^-+*/(). 0-9a-zA-Z_]/g, "");
  // eslint-disable-next-line no-new-func
  const fn = new Function(
    "scope",
    "with (Math) { with (scope) { return (" + cleaned + "); } }",
  );
  return (scope: Record<string, number>) => {
    try {
      const out = fn(scope);
      return typeof out === "number" && isFinite(out) ? out : NaN;
    } catch {
      return NaN;
    }
  };
}
