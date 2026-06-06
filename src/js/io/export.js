/**
 * export.js — Client-side data export helpers. Produces CSV / JSON blobs and
 * triggers a download. Used for spike trains, configs, and analytics.
 */
export function download(filename, text, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function spikesToCSV(spikeLog) {
  let out = "neuron_id,time_ms\n";
  for (let i = 0; i < spikeLog.ids.length; i++) {
    out += spikeLog.ids[i] + "," + spikeLog.times[i].toFixed(2) + "\n";
  }
  return out;
}

export function metricsToCSV(history) {
  let out = "time_ms,pop_rate_hz,synchrony,cv_isi,dominant_hz\n";
  for (const h of history) {
    out += `${h.t.toFixed(1)},${h.popRate},${h.synchrony},${h.cvIsi},${h.dominantHz}\n`;
  }
  return out;
}
