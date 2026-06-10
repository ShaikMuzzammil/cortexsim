"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Home, Brain, Boxes, Square } from "lucide-react";
import { useSimStore } from "@/store/useSimStore";
import { SNN } from "@/lib/engine/snn";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";
import {
  drawRaster,
  drawLine,
  drawSpectrum,
  drawVoltage,
  drawPhasePlane,
  drawCorrelation,
  type RasterPoint,
} from "@/lib/draw/charts";
import { welch, dominantFrequency } from "@/lib/dsp/fft";
import {
  shannonEntropy,
  synchronyIndex,
  correlationMatrix,
} from "@/lib/dsp/metrics";
import { Recorder } from "@/lib/export/exporters";
import type { Metrics, Spike } from "@/types";

import Network3D from "./Network3D";
import ControlPanel from "./ControlPanel";
import Transport from "./Transport";
import MetricsBar from "./MetricsBar";
import PresetBar from "./PresetBar";
import EquationEditor from "./EquationEditor";
import CalculatorPanel from "./CalculatorPanel";
import SweepPanel from "./SweepPanel";
import ExportPanel from "./ExportPanel";

const SPIKE_CAP = 9000;
const RATE_CAP = 600;
const PROBE_CAP = 300;
const CORR_NEURONS = 50;
const RASTER_WINDOW = 600;

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-edge px-3 py-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
      </div>
      <div className="h-32">{children}</div>
    </div>
  );
}

export default function SimulatorShell() {
  const engineRef = useRef<SNN | null>(null);
  const recorderRef = useRef<Recorder>(new Recorder());

  // rolling buffers (kept in refs to avoid re-renders every frame)
  const spikeBuf = useRef<RasterPoint[]>([]);
  const allSpikes = useRef<Spike[]>([]);
  const rateBuf = useRef<number[]>([]);
  const excBuf = useRef<number[]>([]);
  const inhBuf = useRef<number[]>([]);
  const lfpBuf = useRef<number[]>([]);
  const probeV = useRef<number[]>([]);
  const probeU = useRef<number[]>([]);
  const corrBins = useRef<number[][]>([]);
  const stepRef = useRef(0);
  const frameRef = useRef(0);
  const fpsRef = useRef(60);

  const rasterCanvas = useRef<HTMLCanvasElement>(null);
  const rateCanvas = useRef<HTMLCanvasElement>(null);
  const spectrumCanvas = useRef<HTMLCanvasElement>(null);
  const voltCanvas = useRef<HTMLCanvasElement>(null);
  const phaseCanvas = useRef<HTMLCanvasElement>(null);
  const corrCanvas = useRef<HTMLCanvasElement>(null);

  const running = useSimStore((s) => s.running);
  const renderMode = useSimStore((s) => s.renderMode);
  const setRenderMode = useSimStore((s) => s.setRenderMode);
  const setMetrics = useSimStore((s) => s.setMetrics);
  const setProbe = useSimStore((s) => s.setProbe);
  const setConfig = useSimStore((s) => s.setConfig);
  const [autoRotate, setAutoRotate] = useState(true);
  const [rebuildTick, setRebuildTick] = useState(0);

  // (re)build the engine on mount and whenever structure changes.
  useEffect(() => {
    const cfg = useSimStore.getState().config;
    engineRef.current = new SNN(cfg);
    spikeBuf.current = [];
    allSpikes.current = [];
    rateBuf.current = [];
    excBuf.current = [];
    inhBuf.current = [];
    lfpBuf.current = [];
    corrBins.current = Array.from({ length: CORR_NEURONS }, () => []);
    stepRef.current = 0;
  }, [rebuildTick]);

  const requestRebuild = useCallback(() => {
    setRebuildTick((t) => t + 1);
  }, []);

  // Sync live (non-structural) parameters into the engine.
  const syncLiveConfig = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;
    const c = useSimStore.getState().config;
    eng.cfg.excGain = c.excGain;
    eng.cfg.inhGain = c.inhGain;
    eng.cfg.inputDrive = c.inputDrive;
    eng.cfg.tauSyn = c.tauSyn;
    eng.cfg.noise = c.noise;
    eng.cfg.integrator = c.integrator;
    eng.cfg.stdp = c.stdp;
    eng.cfg.stdpRate = c.stdpRate;
    eng.cfg.dt = c.dt;
  }, []);

  const stepOnce = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;
    syncLiveConfig();
    const fired = eng.advance();
    stepRef.current++;
    const N = eng.N;
    let exc = 0;
    for (const s of fired) {
      if (eng.isExc[s.i]) exc++;
      spikeBuf.current.push({ t: stepRef.current, i: s.i, exc: !!eng.isExc[s.i] });
      allSpikes.current.push({ t: stepRef.current, i: s.i });
    }
    const inh = fired.length - exc;
    const rate = (fired.length / N) * 1000;
    rateBuf.current.push(rate);
    excBuf.current.push((exc / Math.max(1, eng.nExc)) * 1000);
    inhBuf.current.push((inh / Math.max(1, N - eng.nExc)) * 1000);
    // LFP proxy: mean membrane potential
    let vsum = 0;
    for (let i = 0; i < N; i++) vsum += eng.v[i];
    lfpBuf.current.push(vsum / N);
    recorderRef.current.push(rate);

    // probe
    const probeIdx = useSimStore.getState().probe;
    const pr = eng.probeVoltage(probeIdx);
    probeV.current.push(pr.v);
    probeU.current.push(pr.u);

    // correlation bins (coarse 20-step bins for first CORR_NEURONS)
    const bin = Math.floor(stepRef.current / 20);
    for (let n = 0; n < CORR_NEURONS && n < N; n++) {
      if (corrBins.current[n].length <= bin) corrBins.current[n][bin] = 0;
    }
    for (const s of fired) {
      if (s.i < CORR_NEURONS) corrBins.current[s.i][bin] = (corrBins.current[s.i][bin] || 0) + 1;
    }

    // trim buffers
    if (spikeBuf.current.length > SPIKE_CAP) spikeBuf.current.splice(0, spikeBuf.current.length - SPIKE_CAP);
    if (allSpikes.current.length > SPIKE_CAP * 4) allSpikes.current.splice(0, allSpikes.current.length - SPIKE_CAP * 4);
    const trim = (a: number[], cap: number) => {
      if (a.length > cap) a.splice(0, a.length - cap);
    };
    trim(rateBuf.current, RATE_CAP);
    trim(excBuf.current, RATE_CAP);
    trim(inhBuf.current, RATE_CAP);
    trim(lfpBuf.current, RATE_CAP);
    trim(probeV.current, PROBE_CAP);
    trim(probeU.current, PROBE_CAP);
  }, [syncLiveConfig]);

  const drawAll = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;
    if (rasterCanvas.current)
      drawRaster(rasterCanvas.current, spikeBuf.current, eng.N, RASTER_WINDOW, stepRef.current);
    if (rateCanvas.current) drawLine(rateCanvas.current, rateBuf.current, "#6ea8ff", true);
    if (voltCanvas.current) drawVoltage(voltCanvas.current, probeV.current);
    if (phaseCanvas.current) drawPhasePlane(phaseCanvas.current, probeV.current, probeU.current);
    if (spectrumCanvas.current && lfpBuf.current.length > 64) {
      const fs = 1000 / Math.max(0.1, eng.cfg.dt);
      const { freqs, power } = welch(lfpBuf.current, fs, 128);
      drawSpectrum(spectrumCanvas.current, freqs, power, 120);
    }
    if (corrCanvas.current && frameRef.current % 30 === 0) {
      const m = correlationMatrix(corrBins.current.slice(0, CORR_NEURONS));
      drawCorrelation(corrCanvas.current, m);
    }
  }, []);

  const updateMetrics = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;
    const fs = 1000 / Math.max(0.1, eng.cfg.dt);
    const rate = avg(rateBuf.current);
    const dom = lfpBuf.current.length > 64 ? dominantFrequency(lfpBuf.current, fs, 120) : 0;
    const counts: number[] = [];
    for (let n = 0; n < CORR_NEURONS; n++) counts.push((corrBins.current[n] || []).reduce((a, b) => a + (b || 0), 0));
    const active = activeFraction(spikeBuf.current, eng.N, stepRef.current);
    const m: Metrics = {
      rate,
      excRate: avg(excBuf.current),
      inhRate: avg(inhBuf.current),
      activePct: active * 100,
      synchrony: synchronyIndex(rateBuf.current),
      dominantHz: dom,
      lfp: lfpBuf.current.length ? lfpBuf.current[lfpBuf.current.length - 1] : 0,
      entropy: shannonEntropy(counts),
      spikes: allSpikes.current.length,
      fps: fpsRef.current,
      timeMs: stepRef.current,
    };
    setMetrics(m);
  }, [setMetrics]);

  // main loop
  useAnimationFrame(
    (deltaMs) => {
      fpsRef.current = fpsRef.current * 0.9 + (1000 / Math.max(1, deltaMs)) * 0.1;
      const stepsPerFrame = 2;
      for (let k = 0; k < stepsPerFrame; k++) stepOnce();
      frameRef.current++;
      drawAll();
      if (frameRef.current % 8 === 0) updateMetrics();
    },
    running,
  );

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        useSimStore.getState().toggleRunning();
      } else if (e.key === "r") {
        requestRebuild();
      } else if (e.key === "i") {
        engineRef.current?.injectPulse(14);
      } else if (e.key === "ArrowRight") {
        stepOnce();
        drawAll();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestRebuild, stepOnce, drawAll]);

  const handleProbe = useCallback((i: number) => setProbe(i), [setProbe]);
  const getSpikes = useCallback(() => allSpikes.current.slice(), []);
  const recorder = recorderRef.current;

  const applyPreset = useCallback(
    (patch: Parameters<typeof setConfig>[0]) => {
      setConfig(patch);
      // some presets change the model -> rebuild
      if ("excModel" in patch || "connectivity" in patch) requestRebuild();
    },
    [setConfig, requestRebuild],
  );

  const headerActions = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setRenderMode(renderMode === "3d" ? "2d" : "3d")}
          className="btn-ghost"
          title="Toggle render mode"
        >
          {renderMode === "3d" ? <Boxes size={16} /> : <Square size={16} />}
          {renderMode === "3d" ? "3D" : "2D"}
        </button>
        <button
          type="button"
          onClick={() => setAutoRotate((v) => !v)}
          className="btn-ghost"
        >
          {autoRotate ? "Rotating" : "Static"}
        </button>
      </div>
    ),
    [renderMode, autoRotate, setRenderMode],
  );

  return (
    <div className="min-h-screen bg-ink">
      <header className="sticky top-0 z-40 border-b border-edge bg-ink/80 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="btn-ghost" title="Back to home">
              <Home size={16} /> Home
            </Link>
            <div className="flex items-center gap-2 font-extrabold">
              <Brain className="text-brand" size={20} />
              CortexSim <span className="text-brand">GODMODE</span>
            </div>
          </div>
          <Transport
            onReset={requestRebuild}
            onStep={() => {
              stepOnce();
              drawAll();
            }}
            onInject={() => engineRef.current?.injectPulse(14)}
          />
          {headerActions}
        </div>
        <div className="px-4 pb-3">
          <MetricsBar />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-[300px_1fr_320px]">
        {/* Left: controls */}
        <aside className="panel panel-pad h-fit space-y-4 xl:sticky xl:top-[150px]">
          <h2 className="text-sm font-bold">Controls</h2>
          <PresetBar onApply={applyPreset} />
          <ControlPanel onStructuralChange={requestRebuild} />
        </aside>

        {/* Center: 3D + charts */}
        <main className="space-y-4">
          <div className="panel relative h-[360px] overflow-hidden sm:h-[440px]">
            <div className="absolute left-3 top-3 z-10 flex gap-3 text-[11px]">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-exc" /> Excitatory</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-inh" /> Inhibitory</span>
            </div>
            <Network3D
              engineRef={engineRef}
              mode={renderMode}
              autoRotate={autoRotate}
              onProbe={handleProbe}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ChartCard title="Spike raster"><canvas ref={rasterCanvas} className="h-full w-full" /></ChartCard>
            <ChartCard title="Population rate"><canvas ref={rateCanvas} className="h-full w-full" /></ChartCard>
            <ChartCard title="Power spectrum (0-120 Hz)"><canvas ref={spectrumCanvas} className="h-full w-full" /></ChartCard>
            <ChartCard title="Probe voltage"><canvas ref={voltCanvas} className="h-full w-full" /></ChartCard>
            <ChartCard title="Phase plane (v-u)"><canvas ref={phaseCanvas} className="h-full w-full" /></ChartCard>
            <ChartCard title="Correlation matrix"><canvas ref={corrCanvas} className="h-full w-full" /></ChartCard>
          </div>
        </main>

        {/* Right: advanced tools */}
        <aside className="space-y-4">
          <div className="panel panel-pad">
            <h2 className="mb-3 text-sm font-bold">Live equation editor</h2>
            <EquationEditor engineRef={engineRef} />
          </div>
          <div className="panel panel-pad">
            <h2 className="mb-3 text-sm font-bold">Custom calculator</h2>
            <CalculatorPanel />
          </div>
          <div className="panel panel-pad">
            <h2 className="mb-3 text-sm font-bold">Parameter sweep</h2>
            <SweepPanel />
          </div>
          <div className="panel panel-pad">
            <h2 className="mb-3 text-sm font-bold">Export &amp; save</h2>
            <ExportPanel getSpikes={getSpikes} recorder={recorder} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function avg(a: number[]): number {
  if (!a.length) return 0;
  let s = 0;
  for (const v of a) s += v;
  return s / a.length;
}

function activeFraction(points: RasterPoint[], N: number, nowStep: number): number {
  const seen = new Set<number>();
  const t0 = nowStep - 200;
  for (const p of points) if (p.t >= t0) seen.add(p.i);
  return seen.size / Math.max(1, N);
}
