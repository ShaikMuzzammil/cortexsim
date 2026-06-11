"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Activity, Control, Params, Readout } from "@/lib/studio/types";
import { educationFor } from "@/lib/studio/education";
import { activeView } from "@/lib/studio/activeViewBus";
import { downloadCanvasPng, downloadJson } from "@/lib/studio/sessions";

const STATUS_LABEL: Record<string, string> = {
  live: "Live",
  beta: "Beta",
  roadmap: "Prototype",
};

function defaultParams(controls: Control[]): Params {
  const p: Params = {};
  for (const c of controls) p[c.key] = c.default;
  return p;
}

export default function ActivityRunner({ activity }: { activity: Activity }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paramsRef = useRef<Params>(defaultParams(activity.controls));
  const stateRef = useRef<any>(null);
  const tickRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const readoutsRef = useRef<Readout[]>([]);

  const [params, setParams] = useState<Params>(() => defaultParams(activity.controls));
  const [running, setRunning] = useState(true);
  const [readouts, setReadouts] = useState<Readout[]>([]);
  const [showInfo, setShowInfo] = useState(false);

  const edu = educationFor(activity.id);

  // Re-initialise whenever the activity changes.
  useEffect(() => {
    const fresh = defaultParams(activity.controls);
    paramsRef.current = fresh;
    setParams(fresh);
    stateRef.current = activity.init(fresh);
    tickRef.current = 0;
    setRunning(true);
    setShowInfo(false);
    // Register with the active-view bus so the workspace Export button can
    // download this view's canvas + readouts.
    activeView.slug = activity.slug;
    activeView.title = activity.title;
  }, [activity]);

  function sizeCanvas(): { ctx: CanvasRenderingContext2D; w: number; h: number } | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  // Animation loop.
  useEffect(() => {
    function loop() {
      const sized = sizeCanvas();
      if (sized) {
        const { ctx, w, h } = sized;
        const t = tickRef.current;
        if (running && activity.step) {
          activity.step(stateRef.current, paramsRef.current, t);
          tickRef.current += 1;
        }
        ctx.clearRect(0, 0, w, h);
        activity.draw({ ctx, w, h }, stateRef.current, paramsRef.current, t);
        if (activity.readouts && tickRef.current % 6 === 0) {
          const ro = activity.readouts(stateRef.current, paramsRef.current) || [];
          readoutsRef.current = ro;
          setReadouts(ro);
          activeView.readouts = ro;
          activeView.params = { ...paramsRef.current };
          activeView.canvas = canvasRef.current;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [activity, running]);

  function updateParam(key: string, value: number | string | boolean) {
    const next = { ...paramsRef.current, [key]: value };
    paramsRef.current = next;
    setParams(next);
    if (activity.onParamChange) activity.onParamChange(stateRef.current, next, key);
  }

  function reset() {
    stateRef.current = activity.init(paramsRef.current);
    tickRef.current = 0;
  }

  function exportPng() {
    if (canvasRef.current) {
      const name = `cortexsim-${activity.slug}-${Date.now()}.png`;
      downloadCanvasPng(canvasRef.current, name);
    }
  }

  function exportJson() {
    const payload = {
      activity: { slug: activity.slug, id: activity.id, title: activity.title, group: activity.group },
      params: paramsRef.current,
      readouts: readoutsRef.current,
      capturedAt: new Date().toISOString(),
    };
    downloadJson(`cortexsim-${activity.slug}-${Date.now()}.json`, payload);
  }

  const outputLine =
    readouts.length === 0
      ? "Waiting for output\u2026"
      : readouts.map((r) => `${r.label}: ${r.value}`).join("   \u2022   ");

  return (
    <motion.div
      initial={containerInit}
      animate={containerShow}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">{String(activity.id).padStart(2, "0")}</span>
            <span className="chip">{activity.group}</span>
            <span
              className={
                "chip " +
                (activity.status === "live"
                  ? "text-good"
                  : activity.status === "beta"
                    ? "text-warn"
                    : "text-slate-400")
              }
            >
              {STATUS_LABEL[activity.status]}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white">{activity.title}</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-400">{activity.what}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo((v) => !v)}
            className="rounded-md border border-edge bg-panel2 px-3 py-1.5 text-xs text-slate-200 hover:border-brand"
          >
            {showInfo ? "Hide details" : "Why it matters"}
          </button>
          <button
            onClick={reset}
            className="rounded-md border border-edge bg-panel2 px-3 py-1.5 text-xs text-slate-200 hover:border-brand"
          >
            Reset
          </button>
          <button
            onClick={() => setRunning((r) => !r)}
            className={
              "rounded-md border px-3 py-1.5 text-xs " +
              (running
                ? "border-good/40 bg-good/10 text-good"
                : "border-edge bg-panel2 text-slate-200")
            }
          >
            {running ? "\u25A0 Pause" : "\u25B6 Run"}
          </button>
          <button
            onClick={exportPng}
            className="rounded-md border border-edge bg-panel2 px-3 py-1.5 text-xs text-slate-200 hover:border-brand"
            title="Export current view as PNG"
          >
            PNG
          </button>
          <button
            onClick={exportJson}
            className="rounded-md border border-edge bg-panel2 px-3 py-1.5 text-xs text-slate-200 hover:border-brand"
            title="Export current readouts as JSON"
          >
            JSON
          </button>
        </div>
      </div>

      {/* Education card */}
      <AnimatePresence initial={false}>
        {showInfo && (
          <motion.div
            key="info"
            initial={infoInit}
            animate={infoShow}
            exit={infoInit}
            className="overflow-hidden rounded-xl border border-edge bg-panel2/60"
          >
            <div className="grid gap-4 p-4 md:grid-cols-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Why it matters</div>
                <p className="mt-1 text-sm text-slate-200">{edu.why}</p>
                <div className="mt-4 text-[10px] uppercase tracking-wider text-slate-500">Knowledge gain</div>
                <p className="mt-1 text-sm text-slate-200">{edu.knowledge}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Real-world applications</div>
                <ul className="mt-1 space-y-1 text-sm text-slate-300">
                  {edu.applications.map((a) => (
                    <li key={a} className="flex gap-2">
                      <span className="text-brand">{"\u2192"}</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-[10px] uppercase tracking-wider text-slate-500">Tech stack</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {edu.stack.map((s) => (
                    <span key={s} className="chip text-[10px]">{s}</span>
                  ))}
                </div>
                <div className="mt-4 text-[10px] uppercase tracking-wider text-slate-500">Try this</div>
                <p className="mt-1 text-sm text-slate-300">{edu.tryThis}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas + controls */}
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="rounded-xl border border-edge bg-ink/60 p-2">
          <canvas ref={canvasRef} className="h-[420px] w-full rounded-lg" />
          <div className="mt-2 overflow-x-auto whitespace-nowrap rounded-md border border-edge bg-panel2/40 px-3 py-1.5 font-mono text-[11px] text-slate-300">
            <span className="text-slate-500">output {"\u2192"} </span>
            {outputLine}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-edge bg-panel2/40 p-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                Controls
              </div>
              <div className="text-[10px] text-slate-500">{activity.controls.length} options</div>
            </div>
            <div className="mt-2 space-y-3">
              {activity.controls.map((c) => (
                <ControlRow
                  key={c.key}
                  control={c}
                  value={params[c.key]}
                  onChange={(v) => updateParam(c.key, v)}
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-edge bg-panel2/40 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Readouts</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {readouts.length === 0 ? (
                <div className="col-span-2 text-xs text-slate-500">No live values yet.</div>
              ) : (
                readouts.map((r) => (
                  <div key={r.label} className="rounded-md border border-edge bg-ink/40 px-2 py-1.5">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">{r.label}</div>
                    <div
                      className="text-sm font-semibold tabular-nums"
                      style={accentStyle(r.accent)}
                    >
                      {r.value}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-edge bg-panel2/40 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Outcome</div>
            <p className="mt-1 text-xs text-slate-300">{activity.outcome}</p>
            <div className="mt-3 text-[10px] uppercase tracking-wider text-slate-500">Tips</div>
            <ul className="mt-1 space-y-1 text-xs text-slate-400">
              {activity.tips.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-brand">{"\u2022"}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ControlRow({
  control,
  value,
  onChange,
}: {
  control: Control;
  value: number | string | boolean | undefined;
  onChange: (v: number | string | boolean) => void;
}) {
  if (control.type === "range") {
    const num = typeof value === "number" ? value : (control.default as number);
    return (
      <label className="block">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{control.label}</span>
          <span className="tabular-nums text-slate-300">
            {num.toFixed((control.step || 1) < 1 ? 2 : 0)}
            {control.unit || ""}
          </span>
        </div>
        <input
          type="range"
          min={control.min}
          max={control.max}
          step={control.step}
          value={num}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-1 h-1 w-full accent-[#6ea8ff]"
        />
      </label>
    );
  }
  if (control.type === "toggle") {
    const on = !!value;
    return (
      <label className="flex items-center justify-between text-xs text-slate-300">
        <span>{control.label}</span>
        <button
          onClick={() => onChange(!on)}
          className={
            "h-5 w-9 rounded-full border transition " +
            (on ? "border-good bg-good/40" : "border-edge bg-panel2")
          }
        >
          <span
            className={
              "block h-3.5 w-3.5 rounded-full bg-white transition " +
              (on ? "translate-x-4" : "translate-x-0.5")
            }
          />
        </button>
      </label>
    );
  }
  if (control.type === "select") {
    return (
      <label className="block">
        <div className="text-[11px] text-slate-400">{control.label}</div>
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-md border border-edge bg-ink/60 px-2 py-1 text-xs text-slate-200"
        >
          {(control.options || []).map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    );
  }
  return null;
}

const containerInit = { opacity: 0, y: 8 };
const containerShow = { opacity: 1, y: 0 };
const infoInit = { opacity: 0, height: 0 };
const infoShow = { opacity: 1, height: "auto" as const };

function accentStyle(accent?: string): React.CSSProperties {
  if (!accent) return {};
  return { color: accent };
}
