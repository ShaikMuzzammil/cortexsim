import { SNN } from "../src/lib/snn/engine";
import { DEFAULT_CONFIG, type SimConfig } from "../src/lib/snn/types";
import { PRESETS } from "../src/lib/snn/presets";

function run(label: string, cfg: SimConfig, ms = 1000) {
  const net = new SNN(cfg);
  let spikes = 0;
  let exc = 0;
  let inh = 0;
  let anyNaN = false;
  for (let t = 0; t < ms; t++) {
    const r = net.step();
    spikes += r.fired;
    exc += r.firedExc;
    inh += r.firedInh;
    if (!Number.isFinite(net.getV(0)) || !Number.isFinite(net.getU(0)))
      anyNaN = true;
  }
  // exercise the stimulus path too
  net.stimulate(14, 0.3);
  net.step();
  const rate = spikes / net.N / (ms / 1000);
  const ok =
    Number.isFinite(rate) &&
    rate >= 0 &&
    rate < 500 &&
    !anyNaN &&
    exc + inh === spikes;
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
for (const model of ["rs", "ib", "ch", "fs"] as const) {
  allOk = run("model:" + model, { ...DEFAULT_CONFIG, model }) && allOk;
}

console.log("\nRESULT:", allOk ? "ALL PASS" : "FAILURES PRESENT");
if (!allOk) process.exit(1);
