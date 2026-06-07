import { useEffect, useRef } from "react";
import { useSim } from "../../store/useSim";
import { SNN } from "../../lib/snn/engine";
import { powerSpectrum, dominantHz } from "../../lib/dsp";
import {
  exportCsv,
  exportJson,
  exportPng,
  exportPdfReport,
  type SpikeRecord,
} from "../../lib/exporters";
import Network3D, { type View } from "./Network3D";
import Panel from "./Panel";
import Metrics from "./Metrics";
import ExportBar from "./ExportBar";
import Controls from "./Controls";

const SPIKE_CAP = 5000;
const RATE_CAP = 1200;
const PROBE_CAP = 240;

function fitCanvas(canvas: HTMLCanvasElement): [number, number, number] {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (
    canvas.width !== Math.round(w * dpr) ||
    canvas.height !== Math.round(h * dpr)
  ) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  return [w, h, dpr];
}

export default function Platform() {
  const config = useSim((s) => s.config);
  const running = useSim((s) => s.running);
  const rebuildToken = useSim((s) => s.rebuildToken);
  const stepToken = useSim((s) => s.stepToken);
  const stimToken = useSim((s) => s.stimToken);
  const probe = useSim((s) => s.probe);
  const setMetrics = useSim((s) => s.setMetrics);

  // live refs read inside the animation loop
  const configRef = useRef(config);
  const runningRef = useRef(running);
  const probeRef = useRef(probe);
  configRef.current = config;
  runningRef.current = running;
  probeRef.current = probe;

  const engineRef = useRef<SNN | null>(null);
  const viewRef = useRef<View>({
    rotX: -0.35,
    rotY: 0,
    zoom: 1,
    dragging: false,
    lastX: 0,
    lastY: 0,
  });

  const netRef = useRef<HTMLCanvasElement>(null);
  const rasterRef = useRef<HTMLCanvasElement>(null);
  const rateRef = useRef<HTMLCanvasElement>(null);
  const voltRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<HTMLCanvasElement>(null);
  const specRef = useRef<HTMLCanvasElement>(null);

  const spikeBuf = useRef<SpikeRecord[]>([]);
  const rateBuf = useRef<number[]>([]);
  const probeV = useRef<number[]>([]);
  const probeU = useRef<number[]>([]);
  const specData = useRef<{ mags: number[]; freqs: number[] }>({
    mags: [],
    freqs: [],
  });
  const stepReq = useRef(false);

  // (re)build the engine whenever structural parameters change
  useEffect(() => {
    engineRef.current = new SNN(configRef.current);
    spikeBuf.current = [];
    rateBuf.current = [];
    probeV.current = [];
    probeU.current = [];
  }, [rebuildToken]);

  useEffect(() => {
    engineRef.current?.setDrive(config.drive);
  }, [config.drive]);

  useEffect(() => {
    if (stimToken > 0) engineRef.current?.stimulate(14, 0.3);
  }, [stimToken]);

  useEffect(() => {
    if (stepToken > 0) stepReq.current = true;
  }, [stepToken]);

  useEffect(() => {
    probeV.current = [];
    probeU.current = [];
  }, [probe]);

  // the single animation loop driving every canvas
  useEffect(() => {
    let raf = 0;
    let frame = 0;
    let last = performance.now();
    let fps = 60;
    let rateEma = 0;
    let excEma = 0;
    let inhEma = 0;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const engine = engineRef.current;
      if (!engine) return;

      const now = performance.now();
      const dt = now - last;
      last = now;
      if (dt > 0) fps += (1000 / dt - fps) * 0.1;

      const cfg = configRef.current;
      const probeIdx = Math.min(probeRef.current, engine.N - 1);
      const doStep = runningRef.current || stepReq.current;

      if (doStep) {
        const steps = cfg.speed;
        let firedFrame = 0;
        let excFrame = 0;
        let inhFrame = 0;
        for (let s = 0; s < steps; s++) {
          const r = engine.step();
          firedFrame += r.fired;
          excFrame += r.firedExc;
          inhFrame += r.firedInh;
          const t = engine.timeMs;
          for (const sp of r.spikes)
            spikeBuf.current.push({ t, i: sp.i, exc: sp.exc });
          rateBuf.current.push((r.fired / engine.N) * 1000);
          probeV.current.push(engine.getV(probeIdx));
          probeU.current.push(engine.getU(probeIdx));
        }
        if (spikeBuf.current.length > SPIKE_CAP)
          spikeBuf.current.splice(0, spikeBuf.current.length - SPIKE_CAP);
        if (rateBuf.current.length > RATE_CAP)
          rateBuf.current.splice(0, rateBuf.current.length - RATE_CAP);
        if (probeV.current.length > PROBE_CAP) {
          probeV.current.splice(0, probeV.current.length - PROBE_CAP);
          probeU.current.splice(0, probeU.current.length - PROBE_CAP);
        }
        const secs = steps / 1000;
        const instRate = firedFrame / engine.N / secs;
        const instExc = engine.Ne ? excFrame / engine.Ne / secs : 0;
        const instInh = engine.Ni ? inhFrame / engine.Ni / secs : 0;
        rateEma += (instRate - rateEma) * 0.2;
        excEma += (instExc - excEma) * 0.2;
        inhEma += (instInh - inhEma) * 0.2;
        stepReq.current = false;
      }

      drawNetwork(engine, probeIdx);
      drawRaster(engine);
      drawRate();
      drawVoltage();
      drawPhase();

      frame++;
      if (frame % 6 === 0) {
        specData.current = powerSpectrum(rateBuf.current, 128);
        drawSpectrum();
      }

      if (frame % 10 === 0) {
        const recent = rateBuf.current.slice(-120);
        const mean = recent.reduce((a, b) => a + b, 0) / (recent.length || 1);
        const varc =
          recent.reduce((a, b) => a + (b - mean) * (b - mean), 0) /
          (recent.length || 1);
        const sync = mean > 0 ? Math.sqrt(varc) / mean : 0;
        const tnow = engine.timeMs;
        let active = 0;
        for (let i = 0; i < engine.N; i++)
          if (tnow - engine.last[i] <= 20) active++;
        setMetrics({
          timeMs: engine.timeMs,
          rateHz: rateEma,
          rateExc: excEma,
          rateInh: inhEma,
          active,
          synchrony: Math.min(sync, 9.99),
          domHz: dominantHz(specData.current),
          totalSpikes: engine.totalSpikes,
          synapses: engine.synapses,
          fps,
        });
      }
    };

    function drawNetwork(engine: SNN, probeIdx: number) {
      const canvas = netRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const [w, h, dpr] = fitCanvas(canvas);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(5,6,10,0.34)";
      ctx.fillRect(0, 0, w, h);

      const view = viewRef.current;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.38;
      const cosY = Math.cos(view.rotY);
      const sinY = Math.sin(view.rotY);
      const cosX = Math.cos(view.rotX);
      const sinX = Math.sin(view.rotX);
      const pos = engine.pos;
      const tnow = engine.timeMs;
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < engine.N; i++) {
        const x0 = pos[i * 3];
        const y0 = pos[i * 3 + 1];
        const z0 = pos[i * 3 + 2];
        const x1 = x0 * cosY + z0 * sinY;
        const z1 = -x0 * sinY + z0 * cosY;
        const y1 = y0 * cosX - z1 * sinX;
        const z2 = y0 * sinX + z1 * cosX;
        const persp = 2.4 / (2.4 - z2);
        const sx = cx + x1 * radius * persp * view.zoom;
        const sy = cy + y1 * radius * persp * view.zoom;
        const age = tnow - engine.last[i];
        const recent = age < 60 ? 1 - age / 60 : 0;
        const a = 0.12 + recent * 0.85;
        const size = (0.5 + recent * 2.1) * persp * view.zoom;
        if (engine.exc[i]) {
          ctx.fillStyle = `rgba(${Math.round(70 + 150 * recent)},${Math.round(200 + 55 * recent)},255,${a})`;
        } else {
          ctx.fillStyle = `rgba(255,${Math.round(90 + 70 * recent)},${Math.round(180 + 50 * recent)},${a})`;
        }
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.4, size), 0, Math.PI * 2);
        ctx.fill();
        if (i === probeIdx) {
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = "rgba(16,255,170,0.95)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(sx, sy, 7 * view.zoom, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalCompositeOperation = "lighter";
        }
      }
      ctx.globalCompositeOperation = "source-over";
    }

    function clearPanel(
      canvas: HTMLCanvasElement,
    ): [CanvasRenderingContext2D, number, number] | null {
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      const [w, h, dpr] = fitCanvas(canvas);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      return [ctx, w, h];
    }

    function drawRaster(engine: SNN) {
      const canvas = rasterRef.current;
      if (!canvas) return;
      const res = clearPanel(canvas);
      if (!res) return;
      const [ctx, w, h] = res;
      const windowMs = 1000;
      const tEnd = engine.timeMs;
      const tStart = tEnd - windowMs;
      for (const s of spikeBuf.current) {
        if (s.t < tStart) continue;
        const x = ((s.t - tStart) / windowMs) * w;
        const y = (s.i / engine.N) * h;
        ctx.fillStyle = s.exc
          ? "rgba(90,210,255,0.8)"
          : "rgba(255,120,200,0.8)";
        ctx.fillRect(x, y, 1.4, 1.4);
      }
    }

    function drawSeries(
      canvas: HTMLCanvasElement | null,
      data: number[],
      lo: number,
      hi: number,
      stroke: string,
    ) {
      if (!canvas) return;
      const res = clearPanel(canvas);
      if (!res) return;
      const [ctx, w, h] = res;
      const n = data.length;
      if (n < 2) return;
      const start = Math.max(0, n - w);
      const span = n - start;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let k = 0; k < span; k++) {
        const v = data[start + k];
        const x = (k / (span - 1)) * w;
        const y = h - ((v - lo) / (hi - lo)) * h;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    function drawRate() {
      const data = rateBuf.current;
      let hi = 10;
      for (const v of data) if (v > hi) hi = v;
      drawSeries(rateRef.current, data, 0, hi * 1.1, "rgba(34,211,238,0.95)");
    }

    function drawVoltage() {
      drawSeries(
        voltRef.current,
        probeV.current,
        -90,
        40,
        "rgba(16,235,170,0.95)",
      );
    }

    function drawPhase() {
      const canvas = phaseRef.current;
      if (!canvas) return;
      const res = clearPanel(canvas);
      if (!res) return;
      const [ctx, w, h] = res;
      const vs = probeV.current;
      const us = probeU.current;
      const n = Math.min(vs.length, us.length);
      if (n < 2) return;
      let uLo = Infinity;
      let uHi = -Infinity;
      for (let k = 0; k < n; k++) {
        if (us[k] < uLo) uLo = us[k];
        if (us[k] > uHi) uHi = us[k];
      }
      if (uHi - uLo < 1) uHi = uLo + 1;
      const vLo = -90;
      const vHi = 40;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let k = 0; k < n; k++) {
        const x = ((vs[k] - vLo) / (vHi - vLo)) * w;
        const y = h - ((us[k] - uLo) / (uHi - uLo)) * h;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(168,85,247,0.85)";
      ctx.stroke();
    }

    function drawSpectrum() {
      const canvas = specRef.current;
      if (!canvas) return;
      const res = clearPanel(canvas);
      if (!res) return;
      const [ctx, w, h] = res;
      const { mags, freqs } = specData.current;
      if (mags.length < 2) return;
      const maxHz = 120;
      let hi = 1e-6;
      for (let i = 0; i < mags.length; i++)
        if (freqs[i] <= maxHz && mags[i] > hi) hi = mags[i];
      const usable = freqs.filter((f) => f <= maxHz).length;
      const bw = w / Math.max(1, usable);
      for (let i = 0; i < usable; i++) {
        const bh = (mags[i] / hi) * h;
        const x = i * bw;
        ctx.fillStyle = "rgba(236,72,153,0.8)";
        ctx.fillRect(x, h - bh, Math.max(1, bw - 1), bh);
      }
    }

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [setMetrics]);

  // export handlers
  const onPng = () => exportPng(netRef.current, "cortexsim-network.png");
  const onCsv = () => exportCsv(spikeBuf.current);
  const onJson = () =>
    exportJson(useSim.getState().config, useSim.getState().metrics);
  const onPdf = () =>
    exportPdfReport(useSim.getState().config, useSim.getState().metrics, {
      network: netRef.current?.toDataURL("image/png"),
      raster: rasterRef.current?.toDataURL("image/png"),
      rate: rateRef.current?.toDataURL("image/png"),
      spectrum: specRef.current?.toDataURL("image/png"),
    });

  return (
    <section id="platform" className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Controls />
        </aside>
        <div className="flex flex-col gap-4">
          <div className="glass relative overflow-hidden rounded-2xl p-3">
            <div className="pointer-events-none absolute left-5 top-5 z-10 text-[11px] text-white/45">
              drag to rotate · scroll to zoom
            </div>
            <div className="h-[420px] w-full">
              <Network3D canvasRef={netRef} viewRef={viewRef} />
            </div>
          </div>
          <Metrics />
          <ExportBar
            onPng={onPng}
            onCsv={onCsv}
            onJson={onJson}
            onPdf={onPdf}
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Panel ref={rasterRef} title="Spike raster" hint="1 s window" />
            <Panel ref={rateRef} title="Population rate" hint="Hz" />
            <Panel ref={specRef} title="Power spectrum" hint="0–120 Hz" />
            <Panel ref={voltRef} title="Probe voltage" hint="mV" />
            <Panel ref={phaseRef} title="Phase plane" hint="v vs u" />
          </div>
        </div>
      </div>
    </section>
  );
}
