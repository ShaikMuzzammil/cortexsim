"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client/api";

interface Insights {
  totals: { projects: number; runs: number; notes: number; comments: number; datasets: number; events: number; spikes: number; datasetBytes: number };
  topTags: Array<{ tag: string; count: number }>;
  topProjects: Array<{ id: string; name: string; runs: number }>;
  topSpikes: Array<{ id: string; name: string; spikes: number }>;
  topActions: Array<{ action: string; count: number }>;
  hourly: number[];
  weekdays: number[];
  formatCounts: Record<string, number>;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Bars({ values, labels, accent }: { values: number[]; labels: string[]; accent: string }) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex items-end gap-[3px] h-[120px]">
      {values.map((v, i) => {
        const h = Math.max(2, (v / max) * 110);
        const barStyle: React.CSSProperties = { height: h + "px", background: accent };
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${labels[i]}: ${v}`}>
            <div className="w-full rounded-t" style={barStyle}/>
            <div className="text-[9px] text-slate-500">{labels[i]}</div>
          </div>
        );
      })}
    </div>
  );
}

function Donut({ a, b, c, total }: { a: number; b: number; c: number; total: number }) {
  const r = 38;
  const C = 2 * Math.PI * r;
  const seg = (n: number) => (total ? (n / total) * C : 0);
  return (
    <svg viewBox="0 0 100 100" className="w-[120px] h-[120px]">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#10172c" strokeWidth="12"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#6ea8ff" strokeWidth="12" strokeDasharray={seg(a) + " " + C} transform="rotate(-90 50 50)"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#36d399" strokeWidth="12" strokeDasharray={seg(b) + " " + C} strokeDashoffset={-seg(a)} transform="rotate(-90 50 50)"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#fbbd23" strokeWidth="12" strokeDasharray={seg(c) + " " + C} strokeDashoffset={-(seg(a) + seg(b))} transform="rotate(-90 50 50)"/>
      <text x="50" y="54" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="600">{total}</text>
    </svg>
  );
}

function TagCloud({ tags }: { tags: Array<{ tag: string; count: number }> }) {
  const max = Math.max(1, ...tags.map((t) => t.count));
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => {
        const f = 0.7 + (t.count / max) * 0.8;
        const style: React.CSSProperties = { fontSize: f.toFixed(2) + "rem", opacity: 0.6 + (t.count / max) * 0.4 };
        return <span key={t.tag} style={style} className="text-slate-200">{t.tag}</span>;
      })}
    </div>
  );
}

export default function InsightsPage() {
  const [d, setD] = useState<Insights | null>(null);
  useEffect(() => {
    api<Insights>("/api/insights").then(setD).catch(() => setD(null));
  }, []);

  if (!d) return <div className="text-sm text-slate-500">{"Loading insights\u2026"}</div>;

  const totalDatasets = (d.formatCounts.csv || 0) + (d.formatCounts.json || 0) + (d.formatCounts.text || 0);
  const hourLabels = Array.from({ length: 24 }, (_, i) => (i % 3 === 0 ? String(i) : ""));

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Analytics</div>
        <h1 className="text-2xl font-semibold text-white mt-1">Workspace insights</h1>
        <p className="text-sm text-slate-400">Deeper view of how your workspace is being used.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Total spikes</div>
          <div className="text-2xl text-white font-semibold mt-1">{d.totals.spikes.toLocaleString()}</div>
        </div>
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Events</div>
          <div className="text-2xl text-white font-semibold mt-1">{d.totals.events.toLocaleString()}</div>
        </div>
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Dataset size</div>
          <div className="text-2xl text-white font-semibold mt-1">{(d.totals.datasetBytes / 1024).toFixed(1)} KB</div>
        </div>
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Notes</div>
          <div className="text-2xl text-white font-semibold mt-1">{d.totals.notes}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-3">Hourly activity (UTC)</div>
          <Bars values={d.hourly} labels={hourLabels} accent="#6ea8ff"/>
        </div>
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-3">Weekday activity</div>
          <Bars values={d.weekdays} labels={WEEKDAY_LABELS} accent="#36d399"/>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-3">
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-3">Top projects by runs</div>
          <ul className="space-y-1 text-sm">
            {d.topProjects.length === 0 ? <li className="text-slate-500 text-xs">No runs recorded.</li> : null}
            {d.topProjects.map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <Link href={`/app/projects/${p.id}`} className="text-slate-200 hover:text-white truncate">{p.name}</Link>
                <span className="text-[11px] text-slate-500">{p.runs}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-3">Top projects by spikes</div>
          <ul className="space-y-1 text-sm">
            {d.topSpikes.length === 0 ? <li className="text-slate-500 text-xs">No data.</li> : null}
            {d.topSpikes.map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <Link href={`/app/projects/${p.id}`} className="text-slate-200 hover:text-white truncate">{p.name}</Link>
                <span className="text-[11px] text-slate-500">{p.spikes.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-3">Datasets by format</div>
          <div className="flex items-center gap-4">
            <Donut a={d.formatCounts.csv || 0} b={d.formatCounts.json || 0} c={d.formatCounts.text || 0} total={totalDatasets}/>
            <ul className="text-xs space-y-1">
              <li className="flex items-center gap-2"><span className="inline-block w-2 h-2 bg-[#6ea8ff]"/> CSV {d.formatCounts.csv || 0}</li>
              <li className="flex items-center gap-2"><span className="inline-block w-2 h-2 bg-[#36d399]"/> JSON {d.formatCounts.json || 0}</li>
              <li className="flex items-center gap-2"><span className="inline-block w-2 h-2 bg-[#fbbd23]"/> Text {d.formatCounts.text || 0}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-3">Tag cloud</div>
          {d.topTags.length === 0 ? <div className="text-xs text-slate-500">No tags yet.</div> : <TagCloud tags={d.topTags}/>}
        </div>
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-3">Most frequent actions</div>
          <ul className="space-y-1 text-sm font-mono">
            {d.topActions.length === 0 ? <li className="text-slate-500 text-xs">No activity yet.</li> : null}
            {d.topActions.slice(0, 12).map((a) => (
              <li key={a.action} className="flex items-center justify-between">
                <span className="text-slate-200">{a.action}</span>
                <span className="text-[11px] text-slate-500">{a.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
