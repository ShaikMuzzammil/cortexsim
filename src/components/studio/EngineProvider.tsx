"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { SNN } from "@/lib/engine/snn";
import { DEFAULTS } from "@/lib/engine/models";
import type { SimConfig } from "@/types";
import { engineBus, pushRate, pushVoltage, pushSpike } from "@/lib/studio/engineBus";

interface EngineCtx {
  // Live snapshot for UI (refreshed ~10 fps).
  snapshot: {
    tMs: number;
    fps: number;
    rtFactor: number;
    eRate: number;
    iRate: number;
    totalRate: number;
    totalSpikes: number;
    N: number;
    running: boolean;
  };
  config: SimConfig;
  updateConfig: (patch: Partial<SimConfig>) => void;
  setRunning: (r: boolean) => void;
  toggleRunning: () => void;
  resetEngine: () => void;
  stepOnce: () => void;
  injectPulse: () => void;
  setProbe: (i: number) => void;
  probe: number;
}

const EngineContext = createContext<EngineCtx | null>(null);

export function useEngine(): EngineCtx {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error("useEngine must be used inside <EngineProvider>");
  return ctx;
}

export default function EngineProvider({ children }: { children: React.ReactNode }) {
  const snnRef = useRef<SNN | null>(null);
  const runningRef = useRef<boolean>(true);
  const probeRef = useRef<number>(0);
  const stepsThisFrameRef = useRef<number>(0);
  const lastFpsTimeRef = useRef<number>(0);
  const stepsSinceFpsRef = useRef<number>(0);
  const fpsRef = useRef<number>(0);
  // Smoothed exponential firing-rate counters.
  const eFiringRef = useRef<number>(0);
  const iFiringRef = useRef<number>(0);

  const [config, setConfig] = useState<SimConfig>({ ...DEFAULTS });
  const [snapshot, setSnapshot] = useState({
    tMs: 0,
    fps: 0,
    rtFactor: 0,
    eRate: 0,
    iRate: 0,
    totalRate: 0,
    totalSpikes: 0,
    N: DEFAULTS.N,
    running: true,
  });
  const [running, setRunningState] = useState(true);
  const [probe, setProbeState] = useState(0);

  // Build the engine once.
  useEffect(() => {
    snnRef.current = new SNN({ ...DEFAULTS });
    engineBus.latest.N = snnRef.current.N;
    engineBus.latest.nExc = snnRef.current.nExc;
    engineBus.latest.config = { ...snnRef.current.cfg };
  }, []);

  // Push config updates into the live SNN.
  useEffect(() => {
    const snn = snnRef.current;
    if (!snn) return;
    snn.setConfig(config);
    engineBus.latest.N = snn.N;
    engineBus.latest.nExc = snn.nExc;
    engineBus.latest.config = { ...snn.cfg };
  }, [config]);

  // Mirror running into the bus + ref.
  useEffect(() => {
    runningRef.current = running;
    engineBus.latest.running = running;
  }, [running]);

  useEffect(() => {
    probeRef.current = probe;
    engineBus.latest.probeIndex = probe;
  }, [probe]);

  // The main simulation loop.
  useEffect(() => {
    let raf = 0;
    let mounted = true;
    lastFpsTimeRef.current = performance.now();

    const tick = () => {
      if (!mounted) return;
      const snn = snnRef.current;
      const now = performance.now();

      if (snn && runningRef.current) {
        // Run a small batch of steps per frame for a real-feeling simulation.
        const stepsPerFrame = Math.max(1, Math.min(8, Math.round(2 / Math.max(0.25, snn.cfg.dt))));
        let excFires = 0;
        let inhFires = 0;
        for (let s = 0; s < stepsPerFrame; s++) {
          const fired = snn.advance();
          for (const sp of fired) {
            const exc = !!snn.isExc[sp.i];
            if (exc) excFires++;
            else inhFires++;
            pushSpike(engineBus.latest, snn.step * snn.cfg.dt, sp.i, exc);
          }
          // Sample voltage of the probed neuron each step.
          const p = probeRef.current;
          pushVoltage(engineBus.latest, snn.v[p] || 0, snn.u[p] || 0);
        }
        stepsSinceFpsRef.current += stepsPerFrame;

        // Compute instantaneous firing rates in Hz, smoothed.
        const winMs = stepsPerFrame * snn.cfg.dt;
        const eHz = (excFires / Math.max(1, snn.nExc)) * (1000 / Math.max(1, winMs));
        const iHz = (inhFires / Math.max(1, snn.N - snn.nExc)) * (1000 / Math.max(1, winMs));
        eFiringRef.current = 0.85 * eFiringRef.current + 0.15 * eHz;
        iFiringRef.current = 0.85 * iFiringRef.current + 0.15 * iHz;
        pushRate(engineBus.latest, eFiringRef.current, iFiringRef.current);
        engineBus.latest.tMs = snn.step * snn.cfg.dt;
      }

      // FPS + UI snapshot 10x per second.
      if (now - lastFpsTimeRef.current > 100) {
        const dt = (now - lastFpsTimeRef.current) / 1000;
        const rawFps = stepsSinceFpsRef.current / Math.max(1e-6, dt);
        fpsRef.current = 0.7 * fpsRef.current + 0.3 * rawFps;
        const cfg = snnRef.current ? snnRef.current.cfg : config;
        const rtFactor = (fpsRef.current * cfg.dt) / 1000;
        engineBus.latest.fps = fpsRef.current;
        engineBus.latest.rtFactor = rtFactor;
        setSnapshot({
          tMs: engineBus.latest.tMs,
          fps: fpsRef.current,
          rtFactor,
          eRate: eFiringRef.current,
          iRate: iFiringRef.current,
          totalRate: eFiringRef.current + iFiringRef.current,
          totalSpikes: engineBus.latest.totalSpikes,
          N: snnRef.current ? snnRef.current.N : config.N,
          running: runningRef.current,
        });
        stepsSinceFpsRef.current = 0;
        lastFpsTimeRef.current = now;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  const updateConfig = useCallback((patch: Partial<SimConfig>) => {
    setConfig((c) => ({ ...c, ...patch }));
  }, []);

  const setRunning = useCallback((r: boolean) => {
    setRunningState(r);
  }, []);

  const toggleRunning = useCallback(() => {
    setRunningState((r) => !r);
  }, []);

  const resetEngine = useCallback(() => {
    const snn = snnRef.current;
    if (snn) {
      snn.reset();
      engineBus.reset();
      engineBus.latest.N = snn.N;
      engineBus.latest.nExc = snn.nExc;
      engineBus.latest.config = { ...snn.cfg };
      eFiringRef.current = 0;
      iFiringRef.current = 0;
    }
  }, []);

  const stepOnce = useCallback(() => {
    const snn = snnRef.current;
    if (!snn) return;
    const fired = snn.advance();
    for (const sp of fired) {
      const exc = !!snn.isExc[sp.i];
      pushSpike(engineBus.latest, snn.step * snn.cfg.dt, sp.i, exc);
    }
    pushVoltage(engineBus.latest, snn.v[probeRef.current] || 0, snn.u[probeRef.current] || 0);
  }, []);

  const injectPulse = useCallback(() => {
    snnRef.current?.injectPulse(15);
  }, []);

  const setProbe = useCallback((i: number) => {
    setProbeState(i);
  }, []);

  const value: EngineCtx = {
    snapshot,
    config,
    updateConfig,
    setRunning,
    toggleRunning,
    resetEngine,
    stepOnce,
    injectPulse,
    setProbe,
    probe,
  };

  return <EngineContext.Provider value={value}>{children}</EngineContext.Provider>;
}
