/**
 * app.js — Simulator page controller. Orchestrates the Web Worker engine, the
 * 3D renderer, the raster + charts, the analytics readouts, the controls, the
 * AI copilot, voice control, export and persistence.
 */
import { Network3D } from "../viz/network3d.js";
import { RasterPlot } from "../viz/raster.js";
import { TraceChart, BarChart } from "../viz/charts.js";
import { presetList, getPreset } from "../engine/presets.js";
import { modelList } from "../engine/models.js";
import { DEFAULT_CONFIG } from "../engine/snn-engine.js";
import { interpret } from "./copilot.js";
import { toBrian2, toJSONSpec } from "../io/codegen.js";
import { download, metricsToCSV } from "../io/export.js";
import { OPSINS, opsinCurrent } from "../analytics/toolbox.js";
import { listSaved, saveConfig, loadConfig, deleteConfig } from "../io/storage.js";

const $ = (sel) => document.querySelector(sel);
const el = (id) => document.getElementById(id);

class App {
  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.running = false;
    this.metricsHistory = [];
    this.info = null;
    this.spikeLog = { ids: [], times: [] };
    this.recordSpikes = false;
    this.initWorker();
    this.initViz();
    this.buildControls();
    this.bindGlobalUI();
    this.loop();
    // Apply preset from URL (?preset=gamma) or default.
    const params = new URLSearchParams(location.search);
    const preset = params.get("preset") || "brunel_ai";
    this.applyPreset(preset);
  }

  initWorker() {
    this.worker = new Worker(new URL("../engine/worker.js", import.meta.url), { type: "module" });
    this.worker.onmessage = (e) => this.onWorker(e.data);
  }

  initViz() {
    this.net = new Network3D(el("viz3d"));
    this.raster = new RasterPlot(el("raster"), {});
    this.voltage = new TraceChart(el("voltage"), { color: "#41e0c8", min: -80, max: 40 });
    this.popbar = new BarChart(el("popbar"));
  }

  onWorker(m) {
    switch (m.type) {
      case "ready":
        this.info = m.info;
        this.isExc = m.isExc;
        this.net.build(m.info.N, m.layout, m.isExc);
        this.raster.configure(m.info.N, m.isExc);
        this.updateInfoPanel();
        break;
      case "layout":
        this.net.updateLayout(m.layout);
        break;
      case "frame":
        this.lastFrame = m;
        this.net.onSpikes(m.spikeIds);
        this.raster.push(m.spikeIds);
        if (m.probeTrace) this.voltage.pushMany(m.probeTrace);
        if (m.metrics?.popHistogram) this.popbar.draw(m.metrics.popHistogram);
        this.updateMetrics(m);
        if (this.recordSpikes) {
          for (let i = 0; i < m.spikeIds.length; i++) {
            this.spikeLog.ids.push(m.spikeIds[i]);
            this.spikeLog.times.push(m.simTime);
          }
        }
        break;
      default:
        break;
    }
  }

  send(msg, transfer) {
    this.worker.postMessage(msg, transfer || []);
  }

  rebuild() {
    this.send({ type: "init", config: this.config, layout: this.layoutKind || "sphere" });
    if (this.running) this.send({ type: "start" });
  }

  applyPreset(id) {
    const p = getPreset(id);
    if (!p) return;
    this.config = { ...DEFAULT_CONFIG, ...p };
    this.syncControlsFromConfig();
    this.rebuild();
    this.toast(`Loaded preset: ${id}`);
  }

  // ---------- Controls ----------
  buildControls() {
    // Model + preset dropdowns
    const modelSel = el("model");
    modelList().forEach((m) => {
      const o = document.createElement("option");
      o.value = m.id;
      o.textContent = m.label;
      modelSel.appendChild(o);
    });
    const presetSel = el("preset");
    presetList().forEach((p) => {
      const o = document.createElement("option");
      o.value = p.id;
      o.textContent = p.label;
      o.title = p.description;
      presetSel.appendChild(o);
    });
    presetSel.addEventListener("change", () => this.applyPreset(presetSel.value));
    modelSel.addEventListener("change", () => {
      this.config.model = modelSel.value;
      this.rebuild();
    });

    // Opsin dropdown for optogenetics
    const opsinSel = el("opsin");
    Object.keys(OPSINS).forEach((k) => {
      const o = document.createElement("option");
      o.value = k;
      o.textContent = OPSINS[k].label;
      opsinSel.appendChild(o);
    });

    // Sliders: [id, configKey, transform?, isTopology?]
    this.sliders = [
      ["N", "N", (v) => Math.round(v), true],
      ["excRatio", "excitatoryRatio", (v) => v, true],
      ["connProb", "connectionProb", (v) => v, true],
      ["J", "J", (v) => v, false],
      ["g", "g", (v) => v, false],
      ["delay", "delay", (v) => v, false],
      ["inputRate", "inputRate", (v) => v, false],
      ["noise", "noise", (v) => v, false],
      ["speed", "__speed", (v) => v, false],
    ];
    this.sliders.forEach(([id, key, tf, topo]) => {
      const s = el(id);
      if (!s) return;
      s.addEventListener("input", () => {
        const val = tf(parseFloat(s.value));
        const out = el(id + "Val");
        if (out) out.textContent = typeof val === "number" ? (val % 1 === 0 ? val : val.toFixed(2)) : val;
        if (key === "__speed") {
          this.send({ type: "setSpeed", value: val });
          return;
        }
        this.config[key] = val;
        if (topo) {
          clearTimeout(this._topoTimer);
          this._topoTimer = setTimeout(() => this.send({ type: "setParam", key, value: val }), 120);
        } else {
          this.send({ type: "setParam", key, value: val });
        }
      });
    });

    el("stdp").addEventListener("change", (e) => {
      this.config.stdp = e.target.checked;
      this.send({ type: "setParam", key: "stdp", value: e.target.checked });
    });

    // Playback
    el("playBtn").addEventListener("click", () => this.togglePlay());
    el("stepBtn").addEventListener("click", () => this.send({ type: "step" }));
    el("resetBtn").addEventListener("click", () => {
      this.metricsHistory = [];
      this.spikeLog = { ids: [], times: [] };
      this.send({ type: "reset" });
    });

    // Layout buttons
    document.querySelectorAll("[data-layout]").forEach((b) => {
      b.addEventListener("click", () => {
        this.layoutKind = b.dataset.layout;
        document.querySelectorAll("[data-layout]").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        this.send({ type: "setLayout", value: this.layoutKind });
      });
    });

    // Palette
    el("palette").addEventListener("change", (e) => this.net.setPalette(e.target.value));
    el("autorotate").addEventListener("change", (e) => this.net.setAutoRotate(e.target.checked));

    // Optogenetics stimulate
    el("stimBtn").addEventListener("click", () => {
      const opsin = el("opsin").value;
      const power = parseFloat(el("power").value);
      const frac = parseFloat(el("stimFrac").value);
      const cur = opsinCurrent(opsin, power);
      const n = Math.max(1, Math.floor((this.info?.N || 0) * frac));
      const ids = [];
      for (let i = 0; i < n; i++) ids.push((Math.random() * (this.info?.N || 1)) | 0);
      this.send({ type: "stimulate", ids, current: cur });
      this.toast(`Optogenetic pulse: ${opsin} @ ${power} mW → ${cur.toFixed(1)} units on ${n} cells`);
    });

    // Probe selection
    el("probe").addEventListener("input", (e) => {
      this.send({ type: "setProbe", id: parseInt(e.target.value, 10) });
      el("probeVal").textContent = e.target.value;
    });

    // Exports
    el("exportPython").addEventListener("click", () => download("cortexsim_experiment.py", toBrian2(this.config), "text/x-python"));
    el("exportJSON").addEventListener("click", () => download("cortexsim_network.json", toJSONSpec(this.config, this.info || {}), "application/json"));
    el("exportSpikes").addEventListener("click", () => {
      if (!this.spikeLog.ids.length) return this.toast("Enable 'record spikes' first, then run.");
      let csv = "neuron_id,time_ms\n";
      for (let i = 0; i < this.spikeLog.ids.length; i++) csv += this.spikeLog.ids[i] + "," + this.spikeLog.times[i].toFixed(2) + "\n";
      download("cortexsim_spikes.csv", csv, "text/csv");
    });
    el("exportMetrics").addEventListener("click", () => download("cortexsim_metrics.csv", metricsToCSV(this.metricsHistory), "text/csv"));
    el("recordSpikes").addEventListener("change", (e) => {
      this.recordSpikes = e.target.checked;
      if (e.target.checked) this.spikeLog = { ids: [], times: [] };
    });

    // Save / load configs
    el("saveCfg").addEventListener("click", () => {
      const name = prompt("Save configuration as:");
      if (name) {
        saveConfig(name, this.config);
        this.refreshSaved();
        this.toast("Saved " + name);
      }
    });
    el("savedList").addEventListener("change", (e) => {
      const cfg = loadConfig(e.target.value);
      if (cfg) {
        this.config = { ...DEFAULT_CONFIG, ...cfg };
        this.syncControlsFromConfig();
        this.rebuild();
      }
    });
    el("deleteCfg").addEventListener("click", () => {
      const name = el("savedList").value;
      if (name) {
        deleteConfig(name);
        this.refreshSaved();
      }
    });
    this.refreshSaved();

    // Copilot
    el("copilotSend").addEventListener("click", () => this.runCopilot());
    el("copilotInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.runCopilot();
    });
    el("voiceBtn").addEventListener("click", () => this.startVoice());
  }

  refreshSaved() {
    const sel = el("savedList");
    sel.innerHTML = '<option value="">Saved configs…</option>';
    const all = listSaved();
    Object.keys(all).forEach((name) => {
      const o = document.createElement("option");
      o.value = name;
      o.textContent = name;
      sel.appendChild(o);
    });
  }

  syncControlsFromConfig() {
    const map = {
      N: "N",
      excRatio: "excitatoryRatio",
      connProb: "connectionProb",
      J: "J",
      g: "g",
      delay: "delay",
      inputRate: "inputRate",
      noise: "noise",
    };
    Object.entries(map).forEach(([id, key]) => {
      const s = el(id);
      if (s) {
        s.value = this.config[key];
        const out = el(id + "Val");
        if (out) out.textContent = this.config[key];
      }
    });
    el("model").value = this.config.model;
    el("stdp").checked = !!this.config.stdp;
    const probe = el("probe");
    probe.max = Math.max(0, this.config.N - 1);
  }

  runCopilot() {
    const input = el("copilotInput");
    const text = input.value.trim();
    if (!text) return;
    const res = interpret(text);
    this.logCopilot("you", text);
    this.logCopilot("ai", res.say);
    this.dispatchCopilot(res);
    input.value = "";
  }

  dispatchCopilot(res) {
    switch (res.action) {
      case "start": if (!this.running) this.togglePlay(); break;
      case "pause": if (this.running) this.togglePlay(); break;
      case "reset": this.send({ type: "reset" }); break;
      case "step": this.send({ type: "step" }); break;
      case "preset": this.applyPreset(res.value); el("preset").value = res.value; break;
      case "layout":
        this.layoutKind = res.value;
        this.send({ type: "setLayout", value: res.value });
        break;
      case "param":
        this.config[res.key] = res.value;
        this.send({ type: "setParam", key: res.key, value: res.value });
        this.syncControlsFromConfig();
        break;
      case "scale": {
        const cur = this.config[res.key] ?? 1;
        const val = +(cur * res.factor).toFixed(3);
        this.config[res.key] = val;
        this.send({ type: "setParam", key: res.key, value: val });
        this.syncControlsFromConfig();
        break;
      }
      default:
        break;
    }
  }

  logCopilot(who, text) {
    const log = el("copilotLog");
    const div = document.createElement("div");
    div.className = "chat " + who;
    div.textContent = (who === "you" ? "› " : "◆ ") + text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return this.toast("Voice control not supported in this browser.");
    const rec = new SR();
    rec.lang = navigator.language || "en-US";
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      el("copilotInput").value = text;
      this.runCopilot();
    };
    rec.start();
    this.toast("Listening…");
  }

  togglePlay() {
    this.running = !this.running;
    el("playBtn").textContent = this.running ? "❚❚ Pause" : "▶ Run";
    el("playBtn").classList.toggle("running", this.running);
    this.send({ type: this.running ? "start" : "pause" });
  }

  updateInfoPanel() {
    if (!this.info) return;
    el("infoN").textContent = this.info.N.toLocaleString();
    el("infoSyn").textContent = this.info.synapses.toLocaleString();
    el("infoDeg").textContent = this.info.meanDegree.toFixed(1);
    el("infoEI").textContent = `${this.info.NE}/${this.info.NI}`;
    el("probe").max = Math.max(0, this.info.N - 1);
  }

  updateMetrics(m) {
    const met = m.metrics;
    el("mRate").textContent = met.popRate.toFixed(2);
    el("mSync").textContent = met.synchrony.toFixed(3);
    el("mCV").textContent = met.cvIsi.toFixed(2);
    el("mHz").textContent = met.dominantHz.toFixed(1);
    el("mSpikes").textContent = met.totalSpikes.toLocaleString();
    el("mTime").textContent = (m.simTime / 1000).toFixed(2) + " s";
    // Regime classifier badge.
    let regime = "—";
    if (met.popRate < 0.5) regime = "Quiescent";
    else if (met.dominantHz > 25 && met.synchrony > 0.25) regime = `Oscillatory (~${met.dominantHz.toFixed(0)} Hz)`;
    else if (met.synchrony > 0.4) regime = "Synchronous";
    else if (met.cvIsi > 0.8) regime = "Async-Irregular";
    else regime = "Async-Regular";
    el("regime").textContent = regime;
    if (this.metricsHistory.length < 5000)
      this.metricsHistory.push({ t: m.simTime, ...met, popHistogram: undefined });
  }

  bindGlobalUI() {
    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === " ") { e.preventDefault(); this.togglePlay(); }
      else if (e.key === "r") this.send({ type: "reset" });
      else if (e.key === "s") this.send({ type: "step" });
    });
    // Collapsible panels
    document.querySelectorAll(".panel-header").forEach((h) => {
      h.addEventListener("click", () => h.parentElement.classList.toggle("collapsed"));
    });
    // VR
    this.net.enableVR(el("vrBtn")).then((ok) => {
      if (!ok) el("vrBtn").classList.add("disabled");
    });
  }

  toast(msg) {
    const t = el("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  loop() {
    const tick = () => {
      this.net.render();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.__cortexApp = new App();
});
