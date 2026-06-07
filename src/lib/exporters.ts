import type { Metrics, SimConfig } from "./snn/types";

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function stamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

/** Save a canvas as a high-resolution PNG. */
export function exportPng(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  triggerDownload(
    canvas.toDataURL("image/png"),
    `cortexsim-network-${stamp()}.png`,
  );
}

/** Save the recent spike train as CSV. */
export function exportCsv(rows: Array<{ t: number; i: number; exc: boolean }>) {
  const header = "time_ms,neuron,type\n";
  const body = rows
    .map((r) => `${r.t},${r.i},${r.exc ? "excitatory" : "inhibitory"}`)
    .join("\n");
  const blob = new Blob([header + body], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `cortexsim-spikes-${stamp()}.csv`);
  URL.revokeObjectURL(url);
}

/** Save the full reproducible configuration as JSON. */
export function exportJson(config: SimConfig, metrics: Metrics) {
  const payload = {
    generator: "CortexSim Pro v4",
    exportedAt: new Date().toISOString(),
    model: "Izhikevich (2003)",
    config,
    metrics,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `cortexsim-config-${stamp()}.json`);
  URL.revokeObjectURL(url);
}

const metricRows = (m: Metrics) => `
	<tr><td>Simulated time</td><td>${(m.timeMs / 1000).toFixed(2)} s</td></tr>
	<tr><td>Mean firing rate</td><td>${m.rateHz.toFixed(2)} Hz</td></tr>
	<tr><td>Active neurons / frame</td><td>${m.active}</td></tr>
	<tr><td>Synchrony index</td><td>${m.synchrony.toFixed(3)}</td></tr>
	<tr><td>Total spikes</td><td>${m.totalSpikes.toLocaleString()}</td></tr>
	<tr><td>Synapses</td><td>${m.synapses.toLocaleString()}</td></tr>`;

const configRows = (c: SimConfig) => `
	<tr><td>Neurons</td><td>${c.N}</td></tr>
	<tr><td>Excitatory fraction</td><td>${c.pe}</td></tr>
	<tr><td>Connectivity</td><td>${c.conn}</td></tr>
	<tr><td>Exc. gain</td><td>${c.ge}</td></tr>
	<tr><td>Inh. gain</td><td>${c.gi}</td></tr>
	<tr><td>Input drive</td><td>${c.drive}</td></tr>
	<tr><td>Model</td><td>${c.model.toUpperCase()}</td></tr>`;

/**
 * Open a clean, publication-style report in a new window and invoke print,
 * letting the user save as PDF. Embeds the supplied canvas figures as PNGs.
 */
export function exportPdf(
  config: SimConfig,
  metrics: Metrics,
  figures: Array<{ title: string; canvas: HTMLCanvasElement | null }>,
) {
  const win = window.open("", "_blank", "width=900,height=1200");
  if (!win) return;
  const figHtml = figures
    .filter((f) => f.canvas)
    .map(
      (f) =>
        `<figure><img src="${f.canvas!.toDataURL(
          "image/png",
        )}" /><figcaption>${f.title}</figcaption></figure>`,
    )
    .join("");
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"/>
<title>CortexSim Pro — Report</title>
<style>
	*{box-sizing:border-box}
	body{font-family:Inter,system-ui,sans-serif;color:#0b1020;margin:40px;line-height:1.5}
	h1{font-size:26px;margin:0 0 4px}
	.sub{color:#5b6478;margin:0 0 24px;font-size:13px}
	h2{font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:#6d28d9;margin:28px 0 8px}
	table{border-collapse:collapse;width:100%;font-size:13px}
	td{border-bottom:1px solid #e6e8ef;padding:6px 8px}
	td:first-child{color:#5b6478;width:55%}
	figure{margin:14px 0;page-break-inside:avoid}
	img{width:100%;border:1px solid #e6e8ef;border-radius:8px;background:#05060a}
	figcaption{font-size:12px;color:#5b6478;margin-top:6px;text-align:center}
	@media print{body{margin:18mm}}
</style></head><body>
<h1>CortexSim Pro — Simulation Report</h1>
<p class="sub">Izhikevich spiking neural network · generated ${new Date().toLocaleString()}</p>
<h2>Configuration</h2><table>${configRows(config)}</table>
<h2>Metrics</h2><table>${metricRows(metrics)}</table>
<h2>Figures</h2>${figHtml || "<p>No figures available.</p>"}
<script>window.onload=function(){setTimeout(function(){window.print()},350)}<\/script>
</body></html>`);
  win.document.close();
}
