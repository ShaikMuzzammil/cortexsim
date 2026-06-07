import { useEffect, useRef } from "react";
import { useSim } from "../../store/useSim";
import { SNN } from "../../lib/snn/engine";
import type { Metrics } from "../../lib/snn/types";
import {
  exportCsv,
  exportJson,
  exportPng,
  exportPdf,
} from "../../lib/exporters";
import Network3D, { type View } from "./Network3D";
import RasterPlot from "./RasterPlot";
import RateChart from "./RateChart";
import Controls from "./Controls";
import Metrics from "./Metrics";
import ExportBar from "./ExportBar";

interface SpikeRow {
  t: number;
  i: number;
  exc: boolean;
}

const RASTER_WINDOW = 1000; // ms shown in raster
const RATE_LEN = 240; // samples in rate trace
const MAX_SPIKE_LOG = 6000; // CSV ring-buffer cap

function fitCanvas(canvas: HTMLCanvasElement, dpr: number): [number, number] {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
  }
  return [w, h];
}

export default function Platform() {
  const netRef = useRef<HTMLCanvasElement>(null);
  const rasterRef = useRef<HTMLCanvasElement>(null);
  const rateRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef<View>({
    rotX: -0.35,
    rotY: 0,
    zoom: 1,
    dragging: false,
    lastX: 0,
    lastY: 0,
  });

  const engineRef = useRef<SNN | null>(null);
  const spikeLogRef = useRef<SpikeRow[]>([]);
  const rateBufRef = useRef<number[]>([]);
  const metricsRef = useRef<Metrics>({
    timeMs: 0,
    rateHz: 0,
    active: 0,
    synchrony: 0,
    totalSpikes: 0,
    synapses: 0,
  });

  // Pull primitives so the loop reads fresh values via refs.
  const config = useSim((s) => s.config);
  const running = useSim((s) => s.running);
  const rebuildToken = useSim((s) => s.rebuildToken);
  const setMetrics = useSim((s) => s.setMetrics);

  const configRef = useRef(config);
  const runningRef = useRef(running);
  configRef.current = config;
  runningRef.current = running;

  // (Re)build the network when structural params change.
  useEffect(() => {
    const engine = new SNN(configRef.current);
    engineRef.current = engine;
    spikeLogRef.current = [];
    rateBufRef.current = [];
  }, [rebuildToken]);

  // Keep drive in sync without rebuilding the whole network.
  useEffect(() => {
    engineRef.current?.setDrive(config.drive);
  }, [config.drive]);

  // Single render loop drives all three canvases.
  useEffect(() => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let rateEma = 0;
    let frame = 0;

    const render = () => {
      const engine = engineRef.current;
      if (engine) {
        const speed = Math.round(configRef.current.speed);
        let firedFrame = 0;
        if (runningRef.current) {
          for (let s = 0; s < speed; s++) {
            const { fired, spikes } = engine.step();
            firedFrame += fired;
            const log = spikeLogRef.current;
            for (const sp of spikes) {
              log.push({ t: engine.timeMs, i: sp.i, exc: sp.exc });
            }
            const instRate = (fired / engine.N) * 1000;
            const buf = rateBufRef.current;
            buf.push(instRate);
            if (buf.length > RATE_LEN) buf.shift();
          }
          const log = spikeLogRef.current;
          if (log.length > MAX_SPIKE_LOG) {
            log.splice(0, log.length - MAX_SPIKE_LOG);
          }
        }

        drawNetwork(engine);
        drawRaster(engine);
        drawRate();

        // metrics (throttled)
        const instRateFrame =
          speed > 0 ? (firedFrame / engine.N / speed) * 1000 : 0;
        rateEma = rateEma * 0.9 + instRateFrame * 0.1;
        frame++;
        if (frame % 6 === 0) {
          const buf = rateBufRef.current;
          const mean = buf.reduce((a, b) => a + b, 0) / Math.max(1, buf.length);
          const variance =
            buf.reduce((a, b) => a + (b - mean) * (b - mean), 0) /
            Math.max(1, buf.length);
          const synchrony =
            mean > 0.01 ? Math.min(1, Math.sqrt(variance) / mean) : 0;
          const m: Metrics = {
            timeMs: engine.timeMs,
            rateHz: rateEma,
            active: Math.round(firedFrame / Math.max(1, speed)),
            synchrony,
            totalSpikes: engine.totalSpikes,
            synapses: engine.synapses,
          };
          metricsRef.current = m;
          setMetrics(m);
        }
      }
      raf = requestAnimationFrame(render);
    };

    const drawNetwork = (engine: SNN) => {
      const canvas = netRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      const [w, h] = fitCanvas(canvas, dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "rgba(5,6,10,0.32)";
      ctx.fillRect(0, 0, w, h);

      const view = viewRef.current;
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.4 * view.zoom;
      const cosX = Math.cos(view.rotX);
      const sinX = Math.sin(view.rotX);
      const cosY = Math.cos(view.rotY);
      const sinY = Math.sin(view.rotY);
      const pos = engine.pos;
      const last = engine.last;
      const now = engine.timeMs;

      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < engine.N; i++) {
        const x0 = pos[i * 3];
        const y0 = pos[i * 3 + 1];
        const z0 = pos[i * 3 + 2];
        // rotate around Y then X
        const x1 = x0 * cosY - z0 * sinY;
        const z1 = x0 * sinY + z0 * cosY;
        const y1 = y0 * cosX - z1 * sinX;
        const z2 = y0 * sinX + z1 * cosX;
        const depth = (z2 + 1.6) / 2.6;
        const sx = cx + x1 * R;
        const sy = cy + y1 * R;
        const recency = now - last[i];
        const exc = engine.exc[i] === 1;
        let radius = 0.7 + depth * 1.3;
        let alpha = 0.12 + depth * 0.12;
        if (recency < 140) {
          const f = 1 - recency / 140;
          radius += f * 3.4;
          alpha = 0.35 + f * 0.6;
          ctx.fillStyle = exc
            ? `rgba(120,230,255,${alpha})`
            : `rgba(244,140,255,${alpha})`;
        } else {
          ctx.fillStyle = exc
            ? `rgba(40,110,150,${alpha})`
            : `rgba(110,60,140,${alpha})`;
        }
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const drawRaster = (engine: SNN) => {
      const canvas = rasterRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      const [w, h] = fitCanvas(canvas, dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#070912";
      ctx.fillRect(0, 0, w, h);
      const now = engine.timeMs;
      const t0 = now - RASTER_WINDOW;
      const log = spikeLogRef.current;
      for (let k = log.length - 1; k >= 0; k--) {
        const sp = log[k];
        if (sp.t < t0) break;
        const x = ((sp.t - t0) / RASTER_WINDOW) * w;
        const y = h - (sp.i / engine.N) * h;
        ctx.fillStyle = sp.exc
          ? "rgba(120,220,255,0.85)"
          : "rgba(244,140,255,0.85)";
        ctx.fillRect(x, y, 1.4, 1.4);
      }
    };

    const drawRate = () => {
      const canvas = rateRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      const [w, h] = fitCanvas(canvas, dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#070912";
      ctx.fillRect(0, 0, w, h);
      const buf = rateBufRef.current;
      if (buf.length < 2) return;
      const max = Math.max(5, ...buf) * 1.1;
      ctx.beginPath();
      for (let i = 0; i < buf.length; i++) {
        const x = (i / (RATE_LEN - 1)) * w;
        const y = h - (buf[i] / max) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "#22d3ee");
      grad.addColorStop(1, "#ec4899");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [setMetrics]);

  // keyboard shortcuts
  const toggleRunning = useSim((s) => s.toggleRunning);
  const reset = useSim((s) => s.reset);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        toggleRunning();
      } else if (e.key === "r" || e.key === "R") {
        reset();
      } else if (e.key === "s" || e.key === "S") {
        exportPng(netRef.current);
      } else if (e.key === "p" || e.key === "P") {
        onPdf();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleRunning, reset]);

  const onPng = () => exportPng(netRef.current);
  const onCsv = () => exportCsv(spikeLogRef.current.slice(-MAX_SPIKE_LOG));
  const onJson = () => exportJson(configRef.current, metricsRef.current);
  const onPdf = () =>
    exportPdf(configRef.current, metricsRef.current, [
      { title: "3D network state", canvas: netRef.current },
      { title: "Spike raster", canvas: rasterRef.current },
      { title: "Population firing rate", canvas: rateRef.current },
    ]);

  return (
    <section id="platform" className="relative mx-auto max-w-6xl px-4 py-24">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
          The <span className="gradient-text">live platform</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/60">
          Drag the network to rotate, scroll to zoom, and tune every parameter
          in real time. Press Space to play/pause, R to reset.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-4">
          <Controls />
        </div>

        <div className="flex flex-col gap-4">
          <div className="glass relative overflow-hidden rounded-2xl">
            <div className="aspect-[16/10] w-full">
              <Network3D canvasRef={netRef} viewRef={viewRef} />
            </div>
            <div className="pointer-events-none absolute left-3 top-3 text-[11px] text-white/40">
              drag to rotate · scroll to zoom
            </div>
          </div>

          <Metrics />
          <ExportBar
            onPng={onPng}
            onCsv={onCsv}
            onJson={onJson}
            onPdf={onPdf}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <RasterPlot canvasRef={rasterRef} />
            <RateChart canvasRef={rateRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
