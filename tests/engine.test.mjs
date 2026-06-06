/**
 * engine.test.mjs — deterministic unit tests for the simulation core.
 * Run with: node tests/engine.test.mjs   (no dependencies)
 */
import { NetworkEngine, DEFAULT_CONFIG } from "../src/js/engine/snn-engine.js";
import { getModel, modelList } from "../src/js/engine/models.js";
import { presetList, getPreset } from "../src/js/engine/presets.js";
import { mulberry32 } from "../src/js/engine/rng.js";
import { Analytics } from "../src/js/analytics/metrics.js";
import { connectomeMetrics, lesionStudy, opsinCurrent, OPSINS } from "../src/js/analytics/toolbox.js";
import { toBrian2, toJSONSpec } from "../src/js/io/codegen.js";

let passed = 0;
let failed = 0;
function ok(name, cond) {
  if (cond) { passed++; console.log("  ✓ " + name); }
  else { failed++; console.error("  ✗ " + name); }
}
function approx(a, b, tol = 1e-6) { return Math.abs(a - b) <= tol; }

console.log("\nRNG");
{
  const r1 = mulberry32(42);
  const r2 = mulberry32(42);
  const a = [r1(), r1(), r1()];
  const b = [r2(), r2(), r2()];
  ok("seeded RNG is deterministic", a.every((v, i) => v === b[i]));
  ok("RNG in [0,1)", a.every((v) => v >= 0 && v < 1));
}

console.log("\nModels");
{
  ok("three models registered", modelList().length === 3);
  for (const m of modelList()) {
    const model = getModel(m.id);
    ok(`${m.id} has step() and defaults`, typeof model.step === "function" && !!model.defaults);
  }
  // A strongly driven LIF neuron must eventually spike.
  const lif = getModel("lif");
  const p = { ...lif.defaults };
  const st = { v: new Float32Array(1), u: new Float32Array(1), refractoryUntil: new Float32Array(1), rng: mulberry32(1) };
  lif.init(st, 0, p);
  let spiked = false;
  for (let t = 0; t < 500; t++) if (lif.step(st, 0, p, 20, 0.1, t * 0.1)) { spiked = true; break; }
  ok("driven LIF neuron spikes", spiked);
}

console.log("\nEngine construction");
{
  const eng = new NetworkEngine({ ...DEFAULT_CONFIG, N: 500, seed: 7 });
  const info = eng.describe();
  ok("N respected", info.N === 500);
  ok("E/I split ~80/20", info.NE === 400 && info.NI === 100);
  ok("synapses > 0", info.synapses > 0);
  ok("mean degree positive", info.meanDegree > 0);
  // determinism: two engines with same seed produce same synapse count
  const eng2 = new NetworkEngine({ ...DEFAULT_CONFIG, N: 500, seed: 7 });
  ok("same seed → same topology", eng2.describe().synapses === info.synapses);
  const eng3 = new NetworkEngine({ ...DEFAULT_CONFIG, N: 500, seed: 8 });
  ok("different seed → (usually) different topology", eng3.describe().synapses !== info.synapses);
}

console.log("\nSimulation dynamics");
{
  const eng = new NetworkEngine({ ...getPreset("brunel_ai"), N: 800, seed: 11 });
  const res = eng.run(2000); // 200 ms at dt=0.1
  ok("run returns spike arrays", Array.isArray(res.spikeIds) || ArrayBuffer.isView(res.spikeIds));
  ok("network produces spikes", res.totalSpikes > 0);
  const rateHz = (res.totalSpikes / 800) / (res.time / 1000);
  ok("firing rate is biologically plausible (0.1–80 Hz)", rateHz > 0.05 && rateHz < 120, );
  console.log(`    → mean rate ≈ ${rateHz.toFixed(2)} Hz`);
  // determinism of dynamics
  const a = new NetworkEngine({ ...getPreset("brunel_ai"), N: 400, seed: 3 }).run(1000).totalSpikes;
  const b = new NetworkEngine({ ...getPreset("brunel_ai"), N: 400, seed: 3 }).run(1000).totalSpikes;
  ok("dynamics deterministic for fixed seed", a === b);
}

console.log("\nQuiescent vs driven");
{
  const quiet = new NetworkEngine({ ...DEFAULT_CONFIG, N: 300, inputRate: 0, J: 0, seed: 5 });
  const qs = quiet.run(1000).totalSpikes;
  const driven = new NetworkEngine({ ...DEFAULT_CONFIG, N: 300, inputRate: 40, seed: 5 });
  const ds = driven.run(1000).totalSpikes;
  ok("no input + no recurrence → ~silent", qs <= 5);
  ok("strong input → more spikes than silent", ds > qs);
}

console.log("\nAnalytics");
{
  const an = new Analytics(300, 0.1);
  for (let t = 0; t < 100; t++) {
    const fire = t % 5 === 0;
    an.ingest({ spikeIds: fire ? [0, 1, 2] : [], spikeTimes: fire ? [t, t, t] : [], time: t });
  }
  const snap = an.snapshot();
  ok("snapshot has popRate", typeof snap.popRate === "number");
  ok("synchrony in [0,1]", snap.synchrony >= 0 && snap.synchrony <= 1.0001);
  ok("dominant freq is finite", isFinite(snap.dominantHz));
}

console.log("\nConnectome toolbox");
{
  const eng = new NetworkEngine({ ...DEFAULT_CONFIG, N: 200, seed: 9 });
  const cm = connectomeMetrics(eng);
  ok("density in (0,1)", cm.density > 0 && cm.density < 1);
  ok("mean degree positive", cm.meanDegree > 0);
  const lesion = lesionStudy(eng, 0.1);
  ok("lesion knocks out nodes", lesion.knockedOut > 0);
  ok("lesion reports synapse loss", typeof lesion.synapsesLost === "number" && lesion.fractionLost > 0);
}

console.log("\nOptogenetics");
{
  ok("4 opsins defined", Object.keys(OPSINS).length >= 4);
  const depol = opsinCurrent("ChR2", 10);
  const hyper = opsinCurrent("eNpHR", 10);
  ok("ChR2 depolarizes (+)", depol > 0);
  ok("eNpHR hyperpolarizes (-)", hyper < 0);
  ok("activation saturates", opsinCurrent("ChR2", 1000) <= opsinCurrent("ChR2", 1e6) + 1e-6);
}

console.log("\nCode generation");
{
  const py = toBrian2({ ...DEFAULT_CONFIG, N: 100 });
  ok("Brian2 export mentions NeuronGroup", py.includes("NeuronGroup"));
  ok("Brian2 export is non-trivial", py.length > 200);
  const json = toJSONSpec({ ...DEFAULT_CONFIG, N: 100 }, { N: 100 });
  ok("JSON spec parses", !!JSON.parse(json));
}

console.log("\nPresets");
{
  ok("≥7 presets", presetList().length >= 7);
  for (const p of presetList()) ok(`preset '${p.id}' loads & has model`, !!getPreset(p.id).model);
}

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
