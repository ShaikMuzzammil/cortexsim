"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api, timeAgo } from "@/lib/client/api";
import { useAuth } from "@/components/app/AuthProvider";

interface Stats {
  counts: { projects: number; runs: number; notes: number; datasets: number; comments: number };
  totals: { spikes: number; datasetBytes: number };
  series: Array<{ day: string; runs: number; notes: number; events: number }>;
  live: { listeners: number; events: number; uptimeMs: number };
  recentProjects: Array<{ id: string; name: string; updatedAt: string }>;
  recentRuns: Array<{ id: string; projectId: string; label: string; createdAt: string; totalSpikes: number }>;
}

const cardInit = { opacity: 0, y: 10 };
const cardShow = { opacity: 1, y: 0 };

function Sparkline({ values, accent }: { values: number[]; accent: string }) {
  if (values.length === 0) return <svg viewBox="0 0 100 30" className="w-full h-8"/>;
  const max = Math.max(1, ...values);
  const step = 100 / Math.max(1, values.length - 1);
  const points = values.map((v, i) => `${(i * step).toFixed(2)},${(28 - (v / max) * 24).toFixed(2)}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-8">
      <polyline fill="none" stroke={accent} strokeWidth="1.4" points={points}/>
      <polyline fill={accent} fillOpacity="0.15" stroke="none" points={`0,30 ${points} 100,30`}/>
    </svg>
  );
}

function StatCard({ label, value, hint, accent = "#6ea8ff" }: { label: string; value: string; hint?: string; accent?: string }) {
  const valStyle: React.CSSProperties = { color: accent };
  return (
    <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="text-2xl font-semibold text-white mt-1" style={valStyle}>{value}</div>
      {hint ? <div className="text-[11px] text-slate-500 mt-1">{hint}</div> : null}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => {
    api<Stats>("/api/stats").then(setS).catch(() => setS(null));
  }, []);

  const runsSeries = s?.series.map((d) => d.runs) || [];
  const eventsSeries = s?.series.map((d) => d.events) || [];

  return (
    <motion.div initial={cardInit} animate={cardShow} className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Dashboard</div>
          <h1 className="text-2xl font-semibold text-white mt-1">{"Welcome back, " + (user?.name || "")}</h1>
          <p className="text-sm text-slate-400">Your workspace at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/projects" className="text-xs px-3 py-1.5 rounded-md bg-[#6ea8ff] text-[#05070e] font-semibold">New project</Link>
          <Link href="/simulator" className="text-xs px-3 py-1.5 rounded-md border border-[#1d2742] text-slate-200 hover:border-[#2a3760]">Open Studio</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Projects" value={String(s?.counts.projects ?? "\u2014")} hint="Workspaces in flight"/>
        <StatCard label="Runs" value={String(s?.counts.runs ?? "\u2014")} hint={s ? `${s.totals.spikes.toLocaleString()} spikes total` : ""} accent="#ff5d73"/>
        <StatCard label="Notes" value={String(s?.counts.notes ?? "\u2014")} accent="#fbbd23"/>
        <StatCard label="Datasets" value={String(s?.counts.datasets ?? "\u2014")} hint={s ? `${(s.totals.datasetBytes / 1024).toFixed(1)} KB stored` : ""} accent="#36d399"/>
        <StatCard label="Live listeners" value={String(s?.live.listeners ?? 0)} hint={s ? `${s.live.events} events broadcast` : ""} accent="#5db1ff"/>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
          <div className="flex items-baseline justify-between">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Runs (14d)</div>
            <div className="text-xs text-slate-400">{runsSeries.reduce((a, b) => a + b, 0)} total</div>
          </div>
          <Sparkline values={runsSeries} accent="#ff5d73"/>
        </div>
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
          <div className="flex items-baseline justify-between">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Activity (14d)</div>
            <div className="text-xs text-slate-400">{eventsSeries.reduce((a, b) => a + b, 0)} events</div>
          </div>
          <Sparkline values={eventsSeries} accent="#6ea8ff"/>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-2">Recent projects</div>
          {(!s || s.recentProjects.length === 0) ? (
            <div className="text-xs text-slate-500">No projects yet. <Link href="/app/projects" className="text-[#6ea8ff]">Create one</Link>.</div>
          ) : (
            <ul className="space-y-1">
              {s.recentProjects.map((p) => (
                <li key={p.id}>
                  <Link href={`/app/projects/${p.id}`} className="flex items-center justify-between text-sm text-slate-200 hover:text-white py-1">
                    <span className="truncate">{p.name}</span>
                    <span className="text-[11px] text-slate-500 shrink-0 ml-2">{timeAgo(p.updatedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-2">Recent runs</div>
          {(!s || s.recentRuns.length === 0) ? (
            <div className="text-xs text-slate-500">No saved runs yet.</div>
          ) : (
            <ul className="space-y-1">
              {s.recentRuns.map((r) => (
                <li key={r.id}>
                  <Link href={`/app/projects/${r.projectId}?tab=runs`} className="flex items-center justify-between text-sm text-slate-200 hover:text-white py-1">
                    <span className="truncate">{r.label}</span>
                    <span className="text-[11px] text-slate-500 shrink-0 ml-2">{r.totalSpikes.toLocaleString()} sp \u00b7 {timeAgo(r.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}
