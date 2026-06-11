"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Activity, Control, Params, Readout } from "@/lib/studio/types";

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

  const [params, setParams] = useState<Params>(() => defaultParams(activity.controls));
  const [running, setRunning] = useState(true);
  const [readouts, setReadouts] = useState<Readout[]>([]);

  // Re-initialise whenever the activity changes.
  useEffect(() => {
    const fresh = defaultParams(activity.controls);
    paramsRef.current = fresh;
    setParams(fresh);
    stateRef.current = activity.init(fresh);
    tickRef.current = 0;
    setRunning(true);
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

  function drawOnce() {
    const sized = sizeCanvas();
    if (!sized || !stateRef.current) return;
    activity.draw({ ctx: sized.ctx, w: sized.w, h: sized.h }, stateRef.current, paramsRef.current, tickRef.current);
  }

  // Main animation / render loop.
  useEffect(() => {
    let mounted = true;
    if (!stateRef.current) stateRef.current = activity.init(paramsRef.current);

    const loop = () => {
      if (!mounted) return;
      if (activity.animated && activity.step) {
        activity.step(stateRef.current, paramsRef.current, tickRef.current);
        tickRef.current += 1;
      }
      drawOnce();
      rafRef.current = requestAnimationFrame(loop);
    };

    if (running) {
      rafRef.current = requestAnimationFrame(loop);
    } else {
      drawOnce();
    }
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activity, running]);

  // For non-animated activities, redraw whenever params change.
  useEffect(() => {
    if (!activity.animated) {
      stateRef.current = activity.init(paramsRef.current);
      drawOnce();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, activity]);

  // Poll readouts a few times a second.
  useEffect(() => {
    const id = setInterval(() => {
      if (activity.readouts && stateRef.current) {
        setReadouts(activity.readouts(stateRef.current, paramsRef.current));
      }
    }, 280);
    return () => clearInterval(id);
  }, [activity]);

  function setParam(key: string, value: number | string | boolean) {
    paramsRef.current = { ...paramsRef.current, [key]: value };
    setParams(paramsRef.current);
  }

  const statusClass =
    activity.status === "live" ? "text-good" : activity.status === "beta" ? "text-warn" : "text-slate-400";

  return (
    <motion.div
      key={activity.slug}
      initial={enterInitial}
      animate={enterAnimate}
      transition={enterTransition}
      className="flex h-full flex-col gap-4"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] tabular-nums text-slate-500">
              {String(activity.id).padStart(2, "0")}
            </span>
            <h2 className="text-lg font-semibold text-white">{activity.title}</h2>
            <span className={"text-[10px] font-semibold uppercase tracking-wider " + statusClass}>
              {STATUS_LABEL[activity.status]}
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">{activity.what}</p>
        </div>
        <button
          onClick={() => setRunning((r) => !r)}
          className="studio-hot rounded-lg border border-edge bg-panel2 px-3 py-1.5 text-sm text-slate-200 hover:border-brand"
        >
          {running ? "Pause" : "Run"}
        </button>
      </header>

      <div className="grid flex-1 gap-4 xl:grid-cols-[1fr_280px]">
        <div className="flex min-h-[320px] flex-col gap-3">
          <div className="relative flex-1 overflow-hidden rounded-xl border border-edge bg-[#05070e]">
            <canvas ref={canvasRef} className="h-full w-full" />
          </div>
          {readouts.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {readouts.map((r, i) => (
                <div key={i} className="rounded-lg border border-edge bg-panel2/70 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">{r.label}</div>
                  <div className="text-sm font-semibold" style={readoutStyle(r.accent)}>
                    {r.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-edge bg-panel2/60 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Controls
            </div>
            <div className="mt-3 space-y-4">
              {activity.controls.map((c) => (
                <ControlField key={c.key} control={c} value={params[c.key]} onChange={setParam} />
              ))}
              {activity.controls.length === 0 && (
                <p className="text-xs text-slate-500">This activity runs automatically.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-edge bg-panel2/60 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              What you should see
            </div>
            <p className="mt-2 text-sm text-brand">{activity.outcome}</p>
            <ul className="mt-3 space-y-2">
              {activity.tips.map((t, i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-400">
                  <span className="mt-0.5 text-brand">{"\u2022"}</span>
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

function readoutStyle(accent?: string) {
  return accent ? { color: accent } : { color: "#e6edff" };
}

function ControlField({
  control,
  value,
  onChange,
}: {
  control: Control;
  value: number | string | boolean;
  onChange: (key: string, value: number | string | boolean) => void;
}) {
  if (control.type === "range") {
    const num = typeof value === "number" ? value : Number(control.default);
    return (
      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300">{control.label}</span>
          <span className="tabular-nums text-slate-400">
            {num}
            {control.unit || ""}
          </span>
        </div>
        <input
          type="range"
          min={control.min}
          max={control.max}
          step={control.step}
          value={num}
          onChange={(e) => onChange(control.key, Number(e.target.value))}
          className="studio-hot mt-1 w-full accent-[#6ea8ff]"
        />
      </div>
    );
  }

  if (control.type === "select") {
    return (
      <div>
        <div className="text-xs text-slate-300">{control.label}</div>
        <select
          value={String(value)}
          onChange={(e) => onChange(control.key, e.target.value)}
          className="studio-hot mt-1 w-full rounded-lg border border-edge bg-panel px-2 py-1.5 text-sm text-slate-200 outline-none focus:border-brand"
        >
          {(control.options || []).map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (control.type === "toggle") {
    const on = !!value;
    return (
      <label className="studio-hot flex cursor-pointer items-center justify-between text-xs text-slate-300">
        <span>{control.label}</span>
        <button
          type="button"
          onClick={() => onChange(control.key, !on)}
          className={
            "relative h-5 w-9 rounded-full transition " + (on ? "bg-brand" : "bg-edge")
          }
        >
          <span
            className={
              "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all " +
              (on ? "left-4" : "left-0.5")
            }
          />
        </button>
      </label>
    );
  }

  // button: increments a nonce so activities can react to a click.
  return (
    <button
      type="button"
      onClick={() => onChange(control.key, (typeof value === "number" ? value : 0) + 1)}
      className="studio-hot w-full rounded-lg border border-brand/50 bg-brand/10 px-3 py-1.5 text-sm text-brand hover:bg-brand/20"
    >
      {control.label}
    </button>
  );
}

const enterInitial = { opacity: 0, y: 10 };
const enterAnimate = { opacity: 1, y: 0 };
const enterTransition = { duration: 0.28 };
