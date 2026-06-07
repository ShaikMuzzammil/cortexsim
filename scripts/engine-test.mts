import { SNN } from "../src/lib/snn/engine";
import { DEFAULT_CONFIG, type SimConfig } from "../src/lib/snn/types";
import { PRESETS } from "../src/lib/snn/presets";

function run(label: string, cfg: SimConfig, ms = 1000) {
  const net = new SNN(cfg);
  let spikes = 0;
  let anyNaN = false;
  for (let t = 0; t < ms; t++) {
    const r = net.step();
    spikes += r.fired;
    if (!Number.isFinite(net.voltage(0))) anyNaN = true;
  }
  const rate = spikes / net.N / (ms / 1000);
  const ok = rate >= 0 && rate < 500 && Number.isFinite(rate) && !anyNaN;
  console.log(
    label.padEnd(16),
    "N=" + String(net.N).padStart(4),
    "syn=" + String(net.synapses).padStart(7),
    "rate=" + rate.toFixed(2).padStart(6) + " Hz",
    ok ? "OK" : "BAD",
  );
  return ok;
}

let allOk = true;
allOk = run("default", { ...DEFAULT_CONFIG }) && allOk;
for (const p of PRESETS) {
  allOk = run(p.id, { ...DEFAULT_CONFIG, ...p.config }) && allOk;
}
allOk = run("small", { ...DEFAULT_CONFIG, N: 200 }) && allOk;
allOk = run("large", { ...DEFAULT_CONFIG, N: 2000 }) && allOk;

console.log("\nRESULT:", allOk ? "ALL PASS" : "FAILURES PRESENT");
if (!allOk) process.exit(1);
