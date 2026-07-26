"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, RotateCcw, Download, Copy, Check,
  Brain, Activity, BarChart3, Zap, Settings,
  ChevronDown, ChevronRight
} from "lucide-react";

// ============ SIMULATION ENGINE ============
interface NeuronState {
  v: number;
  u: number;
  spiked: boolean;
}

interface SimParams {
  a: number;
  b: number;
  c: number;
  d: number;
  I: number;
  neurons: number;
  dt: number;
  duration: number;
}

const DEFAULT_PARAMS: SimParams = {
  a: 0.02,
  b: 0.2,
  c: -65,
  d: 8,
  I: 10,
  neurons: 50,
  dt: 0.5,
  duration: 1000,
};

function runIzhikevich(params: SimParams): { voltages: number[][]; spikes: number[][]; times: number[] } {
  const { a, b, c, d, I, neurons, dt, duration } = params;
  const steps = Math.floor(duration / dt);
  const states: NeuronState[] = Array.from({ length: neurons }, () => ({
    v: -65 + Math.random() * 5,
    u: b * (-65),
    spiked: false,
  }));
  
  const voltages: number[][] = Array.from({ length: neurons }, () => []);
  const spikes: number[][] = Array.from({ length: neurons }, () => []);
  const times: number[] = [];

  for (let step = 0; step < steps; step++) {
    const t = step * dt;
    times.push(t);

    for (let i = 0; i < neurons; i++) {
      const s = states[i];
      if (s.v >= 30) {
        s.v = c;
        s.u += d;
        s.spiked = true;
        spikes[i].push(t);
      } else {
        s.spiked = false;
        s.v += (0.04 * s.v * s.v + 5 * s.v + 140 - s.u + I) * dt / 10;
        s.u += a * (b * s.v - s.u) * dt / 10;
      }
      voltages[i].push(s.v);
    }
  }

  return { voltages, spikes, times };
}

// ============ CHART COMPONENTS ============
function LineChart({ 
  data, 
  labels, 
  color = "#3b82f6", 
  title,
  height = 200,
  showGrid = true 
}: { 
  data: number[]; 
  labels?: string[];
  color?: string;
  title?: string;
  height?: number;
  showGrid?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Clear
    ctx.fillStyle = "#0d0d12";
    ctx.fillRect(0, 0, w, h);

    // Grid
    if (showGrid) {
      ctx.strokeStyle = "#1a1a24";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartH / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();
      }
    }

    // Find bounds
    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const range = maxVal - minVal || 1;

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";

    data.forEach((val, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW;
      const y = padding.top + chartH - ((val - minVal) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Axis labels
    ctx.fillStyle = "#6b7280";
    ctx.font = "11px monospace";
    ctx.textAlign = "right";
    ctx.fillText(maxVal.toFixed(0), padding.left - 5, padding.top + 4);
    ctx.fillText(minVal.toFixed(0), padding.left - 5, h - padding.bottom);
    
    if (title) {
      ctx.fillStyle = "#9ca3af";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(title, padding.left, 14);
    }
  }, [data, color, title, showGrid]);

  return <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height }} />;
}

function RasterPlot({ spikes, times, height = 150 }: { spikes: number[][]; times: number[]; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 15, right: 15, bottom: 25, left: 40 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    ctx.fillStyle = "#0d0d12";
    ctx.fillRect(0, 0, w, h);

    const maxTime = times[times.length - 1] || 1000;
    const neuronCount = spikes.length;

    // Draw spikes
    ctx.fillStyle = "#22c55e";
    spikes.forEach((neuronSpikes, ni) => {
      neuronSpikes.forEach((spikeTime) => {
        const x = padding.left + (spikeTime / maxTime) * chartW;
        const y = padding.top + (ni / neuronCount) * chartH;
        ctx.fillRect(x - 1, y - 1.5, 2, 3);
      });
    });

    // Labels
    ctx.fillStyle = "#6b7280";
    ctx.font = "11px monospace";
    ctx.textAlign = "right";
    ctx.fillText("0", padding.left - 5, h - padding.bottom + 4);
    ctx.textAlign = "left";
    ctx.fillText(`${neuronCount}`, padding.left, padding.top - 3);
    ctx.fillText(`${maxTime.toFixed(0)}ms`, w - padding.right, h - 5);
    
    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Spike Raster", padding.left, 12);
  }, [spikes, times]);

  return <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height }} />;
}

function Histogram({ data, bins = 20, color = "#a855f7", title, height = 150 }: { data: number[]; bins?: number; color?: string; title?: string; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 30, left: 45 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    ctx.fillStyle = "#0d0d12";
    ctx.fillRect(0, 0, w, h);

    // Create histogram
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / bins || 1;
    const histogram = new Array(bins).fill(0);
    
    data.forEach(val => {
      const binIndex = Math.min(bins - 1, Math.floor((val - min) / binWidth));
      histogram[binIndex]++;
    });

    const maxCount = Math.max(...histogram);

    // Draw bars
    const barWidth = chartW / bins - 2;
    histogram.forEach((count, i) => {
      const barH = (count / maxCount) * chartH;
      const x = padding.left + (i / bins) * chartW + 1;
      const y = padding.top + chartH - barH;
      
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(x, y, barWidth, barH);
    });
    ctx.globalAlpha = 1;

    // Labels
    ctx.fillStyle = "#6b7280";
    ctx.font = "11px monospace";
    ctx.textAlign = "right";
    ctx.fillText(maxCount.toString(), padding.left - 5, padding.top + 4);
    
    if (title) {
      ctx.fillStyle = "#9ca3af";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(title, padding.left, 14);
    }
  }, [data, bins, color, title]);

  return <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height }} />;
}

// ============ MODULE DEFINITIONS ============
const MODULES = [
  { id: "single", name: "Single Neuron", icon: <Brain size={16} />, desc: "Simulate one Izhikevich neuron" },
  { id: "raster", name: "Spike Raster", icon: <Activity size={16} />, desc: "Network spike train visualization" },
  { id: "voltage", name: "Voltage Trace", icon: <Zap size={16} />, desc: "Membrane potential over time" },
  { id: "isi", name: "ISI Histogram", icon: <BarChart3 size={16} />, desc: "Inter-spike interval distribution" },
  { id: "frequency", name: "Firing Rate", icon: <Activity size={16} />, desc: "Population firing rate over time" },
  { id: "phase", name: "Phase Plane", icon: <Settings size={16} />, desc: "Recovery variable vs membrane potential" },
];

// ============ MAIN SIMULATOR COMPONENT ============
export default function SimulatorPage() {
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<{ voltages: number[][]; spikes: number[][]; times: number[] } | null>(null);
  const [activeModule, setActiveModule] = useState("single");
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const runSimulation = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const res = runIzhikevich(params);
      setResults(res);
      setRunning(false);
    }, 100);
  }, [params]);

  const resetSimulation = () => {
    setResults(null);
    setRunning(false);
  };

  const exportData = () => {
    if (!results) return;
    const csv = ["time," + results.voltages.map((_, i) => `neuron_${i}`).join(",")];
    results.times.forEach((t, ti) => {
      csv.push(t + "," + results.voltages.map(v => v[ti]).join(","));
    });
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cortexsim_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCode = () => {
    const code = `# CortexSim Export
import numpy as np

# Parameters
params = {
    'a': ${params.a}, 'b': ${params.b},
    'c': ${params.c}, 'd': ${params.d},
    'I': ${params.I}, 'neurons': ${params.neurons},
    'dt': ${params.dt}, 'duration': ${params.duration}
}
print("Run simulation with these parameters")
`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate chart data based on active module
  const getChartData = () => {
    if (!results) return null;
    
    switch (activeModule) {
      case "single":
        return { type: "line", data: results.voltages[0], label: "Membrane Potential (mV)", color: "#3b82f6" };
      case "raster":
        return { type: "raster", spikes: results.spikes, times: results.times };
      case "voltage":
        return { type: "multi-line", voltages: results.voltages.slice(0, 5), times: results.times };
      case "isi": {
        const allISIs: number[] = [];
        results.spikes.forEach(neuronSpikes => {
          for (let i = 1; i < neuronSpikes.length; i++) {
            allISIs.push(neuronSpikes[i] - neuronSpikes[i-1]);
          }
        });
        return { type: "histogram", data: allISIs, label: "ISI (ms)", color: "#a855f7" };
      }
      case "frequency": {
        const windowSize = 20;
        const rates: number[] = [];
        for (let t = 0; t < results.times.length; t += windowSize) {
          let count = 0;
          results.spikes.forEach(ns => {
            count += ns.filter(s => s >= results.times[t] && s < results.times[Math.min(t + windowSize - 1, results.times.length - 1)]).length;
          });
          rates.push(count / (windowSize * params.dt / 1000) / params.neurons);
        }
        return { type: "line", data: rates, label: "Firing Rate (Hz)", color: "#22c55e" };
      }
      case "phase":
        return { type: "phase", voltages: results.voltages[0], u: results.voltages[1]?.map((v, i) => params.b * v) || [] };
      default:
        return null;
    }
  };

  const chartData = getChartData();

  return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-white text-sm">← Home</Link>
          <span className="text-gray-600">|</span>
          <span className="text-white font-medium text-sm">Neural Simulator</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg"
          >
            {sidebarOpen ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <button
            onClick={resetSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
          >
            <RotateCcw size={14} /> Reset
          </button>
          
          <button
            onClick={running ? () => {} : runSimulation}
            disabled={running}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              running 
                ? "bg-yellow-500/20 text-yellow-400" 
                : "bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25"
            }`}
          >
            {running ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full" />
                Running...
              </>
            ) : (
              <>
                <Play size={14} /> Run
              </>
            )}
          </button>
          
          <button
            onClick={exportData}
            disabled={!results}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors disabled:opacity-50"
          >
            <Download size={14} /> CSV
          </button>
          
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Python"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Parameters */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-white/[0.06] bg-[#0d0d12] overflow-y-auto shrink-0"
            >
              <div className="p-4 space-y-5">
                {/* Module Selector */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2 block">Visualization</label>
                  <div className="space-y-1">
                    {MODULES.map(mod => (
                      <button
                        key={mod.id}
                        onClick={() => setActiveModule(mod.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                          activeModule === mod.id
                            ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                            : "text-gray-400 hover:bg-white/[0.03] hover:text-white border border-transparent"
                        }`}
                      >
                        {mod.icon}
                        <span>{mod.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Parameters */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2 block">Izhikevich Parameters</label>
                  <div className="space-y-3">
                    {[
                      { key: "a", label: "a (recovery)", min: 0.01, max: 0.1, step: 0.01 },
                      { key: "b", label: "b (sensitivity)", min: 0.01, max: 0.3, step: 0.01 },
                      { key: "c", label: "c (reset v)", min: -70, max: -40, step: 1 },
                      { key: "d", label: "d (reset u)", min: 0.1, max: 20, step: 0.5 },
                      { key: "I", label: "I (input current)", min: 0, max: 30, step: 1 },
                    ].map(param => (
                      <div key={param.key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">{param.label}</span>
                          <span className="text-blue-400 font-mono">{(params as any)[param.key]}</span>
                        </div>
                        <input
                          type="range"
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          value={(params as any)[param.key]}
                          onChange={(e) => setParams(p => ({ ...p, [param.key]: parseFloat(e.target.value) }))}
                          className="w-full h-1.5 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Network */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2 block">Network</label>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Neurons</span>
                        <span className="text-purple-400 font-mono">{params.neurons}</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={200}
                        value={params.neurons}
                        onChange={(e) => setParams(p => ({ ...p, neurons: parseInt(e.target.value) }))}
                        className="w-full h-1.5 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Duration (ms)</span>
                        <span className="text-emerald-400 font-mono">{params.duration}</span>
                      </div>
                      <input
                        type="range"
                        min={100}
                        max={5000}
                        step={100}
                        value={params.duration}
                        onChange={(e) => setParams(p => ({ ...p, duration: parseInt(e.target.value) }))}
                        className="w-full h-1.5 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                {results && (
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Results</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-gray-500">Total Spikes</div>
                        <div className="text-white font-mono">{results.spikes.flat().length.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Mean Rate</div>
                        <div className="text-white font-mono">
                          {(results.spikes.flat().length / params.neurons / (params.duration / 1000)).toFixed(1)} Hz
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Chart Area */}
        <main className="flex-1 p-6 overflow-auto bg-[#0a0a0f]">
          {!results ? (
            /* Empty State */
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <Brain size={36} className="text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Ready to Simulate</h2>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                  Adjust parameters on the left, then click <strong className="text-blue-400">Run</strong> to start the neural network simulation.
                </p>
                <button
                  onClick={runSimulation}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                >
                  <Play size={18} /> Start Simulation
                </button>
              </div>
            </div>
          ) : (
            /* Charts */
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Module Title */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {MODULES.find(m => m.id === activeModule)?.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {MODULES.find(m => m.id === activeModule)?.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{params.neurons} neurons</span>
                    <span>•</span>
                    <span>{params.duration}ms</span>
                  </div>
                </div>

                {/* Render appropriate chart */}
                {chartData?.type === "line" && (
                  <LineChart
                    data={chartData.data}
                    title={chartData.label}
                    color={chartData.color}
                    height={350}
                  />
                )}

                {chartData?.type === "raster" && (
                  <RasterPlot
                    spikes={chartData.spikes}
                    times={chartData.times}
                    height={350}
                  />
                )}

                {chartData?.type === "histogram" && (
                  <Histogram
                    data={chartData.data}
                    title={chartData.label}
                    color={chartData.color}
                    height={350}
                  />
                )}

                {chartData?.type === "multi-line" && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-400">First 5 neurons:</div>
                    {chartData.voltages.map((v, i) => (
                      <LineChart
                        key={i}
                        data={v}
                        title={`Neuron ${i + 1}`}
                        color={["#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#ef4444"][i]}
                        height={80}
                      />
                    ))}
                  </div>
                )}

                {chartData?.type === "phase" && (
                  <PhasePlaneChart voltages={chartData.voltages} u={chartData.u} />
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Spikes</div>
                    <div className="text-xl font-bold text-white">{results.spikes.flat().length.toLocaleString()}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Rate</div>
                    <div className="text-xl font-bold text-blue-400">
                      {(results.spikes.flat().length / params.neurons / (params.duration / 1000)).toFixed(1)}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Duration</div>
                    <div className="text-xl font-bold text-purple-400">{params.duration}ms</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Neurons</div>
                    <div className="text-xl font-bold text-emerald-400">{params.neurons}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}

// Phase Plane Component
function PhasePlaneChart({ voltages, u }: { voltages: number[]; u: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || voltages.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = 40;

    ctx.fillStyle = "#0d0d12";
    ctx.fillRect(0, 0, w, h);

    // Calculate recovery variable u
    const uValues = voltages.map((v, i) => {
      if (i === 0) return DEFAULT_PARAMS.b * v;
      const du = DEFAULT_PARAMS.a * (DEFAULT_PARAMS.b * v - (i > 0 ? uValues[i-1] : 0));
      return (i > 0 ? uValues[i-1] : 0) + du * (DEFAULT_PARAMS.dt / 10);
    });

    const minV = Math.min(...voltages);
    const maxV = Math.max(...voltages);
    const minU = Math.min(...uValues);
    const maxU = Math.max(...uValues);

    // Draw trajectory
    ctx.beginPath();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1.5;
    
    voltages.forEach((v, i) => {
      const x = padding + ((v - minV) / (maxV - minV || 1)) * (w - 2 * padding);
      const y = padding + ((uValues[i] - minU) / (maxU - minU || 1)) * (h - 2 * padding);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Current point
    const lastX = padding + ((voltages[voltages.length-1] - minV) / (maxV - minV || 1)) * (w - 2 * padding);
    const lastY = padding + ((uValues[uValues.length-1] - minU) / (maxU - minU || 1)) * (h - 2 * padding);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444";
    ctx.fill();

    // Axes labels
    ctx.fillStyle = "#6b7280";
    ctx.font = "11px monospace";
    ctx.fillText("v (mV)", w / 2, h - 8);
    ctx.save();
    ctx.translate(12, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("u (recovery)", 0, 0);
    ctx.restore();

    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px sans-serif";
    ctx.fillText("Phase Plane", padding, 14);
  }, [voltages, u]);

  return <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height: 350 }} />;
}
