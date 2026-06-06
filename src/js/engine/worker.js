/**
 * worker.js — Module Web Worker that owns the NetworkEngine and runs the
 * simulation loop off the main thread, streaming frames back to the UI.
 *
 * Protocol (main -> worker):
 *   { type: 'init',   config }
 *   { type: 'start' } | { type: 'pause' } | { type: 'reset' } | { type: 'step' }
 *   { type: 'setParam', key, value }
 *   { type: 'setProbe', id }
 *   { type: 'setSpeed', value }   // simulated ms per real second
 *   { type: 'stimulate', ids, current }  // optogenetic-style pulse
 *   { type: 'snapshot' }
 *
 * Protocol (worker -> main):
 *   { type: 'ready', info }
 *   { type: 'frame', simTime, spikeIds, spikeTimes, probeTrace, rate, metrics }
 *   { type: 'snapshot', ... }
 */
import { NetworkEngine, DEFAULT_CONFIG } from "./snn-engine.js";
import { Analytics } from "../analytics/metrics.js";

let engine = null;
let analytics = null;
let running = false;
let probe = 0;
let speed = 200; // simulated ms per real-time second (slows fast dynamics down)
let lastTick = 0;
let stimQueue = [];
let layoutKind = "sphere";

function init(config) {
  engine = new NetworkEngine(config);
  analytics = new Analytics(engine.N, engine.config.dt);
  probe = 0;
  const info = engine.describe();
  const layout = engine.computeLayout(layoutKind);
  self.postMessage({ type: "ready", info, isExc: engine.isExc, layout }, [layout.buffer]);
}

function applyStim() {
  if (!stimQueue.length || !engine) return;
  for (const s of stimQueue) {
    for (const id of s.ids) {
      if (id >= 0 && id < engine.N) engine.gExc[id] += s.current;
    }
  }
  stimQueue = [];
}

function tick(now) {
  if (!running || !engine) return;
  if (!lastTick) lastTick = now;
  let dtReal = (now - lastTick) / 1000; // seconds
  lastTick = now;
  if (dtReal > 0.1) dtReal = 0.1; // clamp after tab inactivity

  const simMs = dtReal * speed;
  let steps = Math.max(1, Math.round(simMs / engine.config.dt));
  if (steps > 2000) steps = 2000; // safety cap per frame

  applyStim();
  const frame = engine.run(steps, { probe });
  analytics.ingest(frame, engine);
  const metrics = analytics.snapshot(engine);

  const spikeIds = Int32Array.from(frame.spikeIds);
  const probeTrace = frame.probeTrace ? Float32Array.from(frame.probeTrace) : null;
  const transfer = [spikeIds.buffer];
  const payload = {
    type: "frame",
    simTime: frame.time,
    spikeIds,
    rate: metrics.popRate,
    metrics,
    totalSpikes: frame.totalSpikes,
    voltages: Float32Array.from(engine.v),
  };
  transfer.push(payload.voltages.buffer);
  if (probeTrace) {
    payload.probeTrace = probeTrace;
    transfer.push(probeTrace.buffer);
  }
  self.postMessage(payload, transfer);
}

// Drive the loop. Workers support setInterval; we aim ~60fps.
let loopTimer = null;
function startLoop() {
  if (loopTimer) return;
  lastTick = 0;
  loopTimer = setInterval(() => tick(performance.now()), 16);
}
function stopLoop() {
  if (loopTimer) clearInterval(loopTimer);
  loopTimer = null;
}

self.onmessage = (e) => {
  const m = e.data;
  switch (m.type) {
    case "init":
      stopLoop();
      running = false;
      layoutKind = m.layout || layoutKind;
      init({ ...DEFAULT_CONFIG, ...(m.config || {}) });
      break;
    case "start":
      if (!engine) return;
      running = true;
      startLoop();
      break;
    case "pause":
      running = false;
      stopLoop();
      break;
    case "reset":
      if (!engine) return;
      running = false;
      stopLoop();
      init({ ...engine.config });
      break;
    case "step": {
      if (!engine) return;
      const frame = engine.run(Math.round(1 / engine.config.dt), { probe }); // ~1 ms
      analytics.ingest(frame, engine);
      const spikeIds = Int32Array.from(frame.spikeIds);
      const voltages = Float32Array.from(engine.v);
      self.postMessage(
        {
          type: "frame",
          simTime: frame.time,
          spikeIds,
          rate: analytics.snapshot(engine).popRate,
          metrics: analytics.snapshot(engine),
          voltages,
        },
        [spikeIds.buffer, voltages.buffer]
      );
      break;
    }
    case "setParam":
      if (!engine) return;
      engine.setParam(m.key, m.value);
      if (["N", "excitatoryRatio", "connectionProb", "seed", "model"].includes(m.key)) {
        analytics = new Analytics(engine.N, engine.config.dt);
        const layout = engine.computeLayout(layoutKind);
        self.postMessage({ type: "ready", info: engine.describe(), isExc: engine.isExc, layout }, [layout.buffer]);
      }
      break;
    case "setLayout": {
      if (!engine) return;
      layoutKind = m.value;
      const layout = engine.computeLayout(layoutKind);
      self.postMessage({ type: "layout", layout }, [layout.buffer]);
      break;
    }
    case "setProbe":
      probe = Math.max(0, Math.min((engine?.N || 1) - 1, m.id | 0));
      break;
    case "setSpeed":
      speed = Math.max(1, m.value);
      break;
    case "stimulate":
      stimQueue.push({ ids: m.ids, current: m.current });
      break;
    case "snapshot":
      if (!engine) return;
      self.postMessage({ type: "snapshot", describe: engine.describe(), config: engine.config });
      break;
    default:
      break;
  }
};
