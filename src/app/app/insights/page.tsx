"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api, downloadBlob } from "@/lib/client/api";
import { 
  BarChart3, TrendingUp, Activity, Database, Zap, Clock,
  Calendar, Tag, FileText, Download
} from "lucide-react";

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

// Demo insights data
const DEMO_INSIGHTS: Insights = {
  totals: {
    projects: 12,
    runs: 48,
    notes: 23,
    comments: 15,
    datasets: 7,
    events: 892,
    spikes: 2847293,
    datasetBytes: 524288,
  },
  topTags: [
    { tag: "izhikevich", count: 8 },
    { tag: "spiking", count: 6 },
    { tag: "cortex", count: 5 },
    { tag: "stdp", count: 4 },
    { tag: "plasticity", count: 4 },
    { tag: "neuron", count: 7 },
    { tag: "network", count: 5 },
    { tag: "oscillation", count: 3 },
    { tag: "bursting", count: 3 },
    { tag: "synchrony", count: 2 },
  ],
  topProjects: [
    { id: "1", name: "Izhikevich Neuron Model", runs: 12 },
    { id: "2", name: "Oscillation & Synchrony", runs: 20 },
    { id: "3", name: "Parameter Sweep Explorer", runs: 33 },
    { id: "4", name: "STDP Plasticity Study", runs: 8 },
    { id: "5", name: "Feedforward Network Analysis", runs: 15 },
  ],
  topSpikes: [
    { id: "2", name: "Parameter Sweep Explorer", spikes: 112345 },
    { id: "5", name: "Oscillation & Synchrony", spikes: 67890 },
    { id: "4", name: "Feedforward Network Analysis", spikes: 45678 },
    { id: "1", name: "Izhikevich Neuron Model", spikes: 15234 },
    { id: "3", name: "STDP Plasticity Study", spikes: 28901 },
  ],
  topActions: [
    { action: "simulation.run", count: 48 },
    { action: "project.create", count: 12 },
    { action: "dataset.upload", count: 7 },
    { action: "note.create", count: 23 },
    { action: "export.png", count: 15 },
    { action: "export.json", count: 22 },
    { action: "comment.add", count: 15 },
    { action: "config.update", count: 31 },
  ],
  hourly: [2, 1, 0, 0, 1, 3, 5, 8, 12, 15, 18, 14, 16, 19, 21, 17, 14, 11, 9, 7, 5, 4, 3, 2],
  weekdays: [8, 15, 22, 19, 24, 12, 6],
  formatCounts: { csv: 4, json: 2, text: 1 },
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Bars({ values, labels, accent }: { values: number[]; labels: string[]; accent: string }) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex items-end gap-[3px] h-[120px]">
      {values.map((v, i) => {
        const h = Math.max(2, (v / max) * 110);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group" title={`${labels[i] || `Hour ${i}`}: ${v}`}>
            <div className="w-full rounded-t transition-all group-hover:opacity-80" style={{ height: `${h}px`, background: accent }}/>
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
      <circle cx="50" cy="50" r={r} fill="none" stroke="#6ea8ff" strokeWidth="12" 
        strokeDasharray={`${seg(a)} ${C}`} transform="rotate(-90 50 50)" className="transition-all"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#36d399" strokeWidth="12" 
        strokeDasharray={`${seg(b)} ${C}`} strokeDashoffset={-seg(a)} transform="rotate(-90 50 50)" className="transition-all"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#fbbd23" strokeWidth="12" 
        strokeDasharray={`${seg(c)} ${C}`} strokeDashoffset={-(seg(a) + seg(b))} transform="rotate(-90 50 50)" className="transition-all"/>
      <text x="50" y="54" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="600">{total}</text>
    </svg>
  );
}

function TagCloud({ tags }: { tags: Array<{ tag: string; count: number }> }) {
  const max = Math.max(1, ...tags.map((t) => t.count));
  return (
    <div className="flex flex-wrap gap-2 p-4">
      {tags.map((t) => {
        const f = 0.75 + (t.count / max) * 0.8;
        const opacity = 0.5 + (t.count / max) * 0.5;
        return (
          <span 
            key={t.tag} 
            style={{ fontSize: `${f}rem`, opacity }}
            className="text-slate-200 hover:text-[#6ea8ff] transition-colors cursor-default px-2 py-1 rounded-lg hover:bg-white/5"
          >
            #{t.tag}
          </span>
        );
      })}
    </div>
  );
}

export default function InsightsPage() {
  const [d, setD] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Insights>("/api/insights")
      .then((data) => {
        setD(data);
        setLoading(false);
      })
      .catch(() => {
        setD(DEMO_INSIGHTS);
        setLoading(false);
      });
  }, []);

  if (!d) {
    return (
      <div className="flex items-center justify-center py-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-2 border-[#6ea8ff] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const totalDatasets = (d.formatCounts.csv || 0) + (d.formatCounts.json || 0) + (d.formatCounts.text || 0);
  const hourLabels = Array.from({ length: 24 }, (_, i) => (i % 3 === 0 ? String(i).padStart(2, "0") : ""));

  // Export insights as JSON
  const exportInsights = () => {
    downloadBlob(
      `cortexsim-insights-${Date.now()}.json`,
      JSON.stringify(d, null, 2),
      "application/json"
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-[#6ea8ff]/10">
              <BarChart3 size={22} className="text-[#6ea8ff]" />
            </div>
            <h1 className="text-3xl font-bold text-white">Workspace Insights</h1>
          </div>
          <p className="text-sm text-slate-400 max-w-xl">
            Deep analytics view of your neural simulation workspace usage and patterns.
          </p>
        </div>
        <button
          onClick={exportInsights}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1d2742] text-slate-300 hover:border-[#2a3760] hover:bg-white/[0.02] text-sm font-medium transition-all"
        >
          <Download size={16} /> Export Data
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-5 hover:border-[#ff5d73]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <Zap size={18} className="text-[#ff5d73]" />
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Total</span>
          </div>
          <div className="text-2xl font-bold text-white">{d.totals.spikes.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">Spikes Simulated</div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-5 hover:border-[#6ea8ff]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <Activity size={18} className="text-[#6ea8ff]" />
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Events</span>
          </div>
          <div className="text-2xl font-bold text-white">{d.totals.events.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">Total Events</div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-5 hover:border-[#36d399]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <Database size={18} className="text-[#36d399]" />
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Storage</span>
          </div>
          <div className="text-2xl font-bold text-white">{(d.totals.datasetBytes / 1024).toFixed(1)} KB</div>
          <div className="text-xs text-slate-500 mt-1">Dataset Size</div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-5 hover:border-[#fbbd23]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <FileText size={18} className="text-[#fbbd23]" />
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Content</span>
          </div>
          <div className="text-2xl font-bold text-white">{d.totals.notes}</div>
          <div className="text-xs text-slate-500 mt-1">Notes Created</div>
        </motion.div>
      </div>

      {/* Activity Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-[#6ea8ff]" />
            <h3 className="text-sm font-semibold text-white">Hourly Activity (UTC)</h3>
          </div>
          <Bars values={d.hourly} labels={hourLabels} accent="#6ea8ff"/>
          <p className="text-[11px] text-slate-500 mt-3 text-center">Peak activity around 14:00-17:00 UTC</p>
        </div>

        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-[#36d399]" />
            <h3 className="text-sm font-semibold text-white">Weekly Distribution</h3>
          </div>
          <Bars values={d.weekdays} labels={WEEKDAY_LABELS} accent="#36d399"/>
          <p className="text-[11px] text-slate-500 mt-3 text-center">Most active on Thursdays</p>
        </div>
      </div>

      {/* Top Lists */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Projects by Runs */}
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-orange-400" />
            <h3 className="text-sm font-semibold text-white">Top Projects by Runs</h3>
          </div>
          <ul className="space-y-2">
            {d.topProjects.length === 0 ? (
              <li className="text-slate-500 text-xs py-4 text-center">No runs recorded yet.</li>
            ) : (
              d.topProjects.map((p, i) => (
                <li key={p.id}>
                  <Link href={`/app/projects/${p.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                        i === 1 ? "bg-slate-400/20 text-slate-300" :
                        i === 2 ? "bg-orange-500/20 text-orange-400" :
                        "bg-[#1d2742] text-slate-500"
                      }`}>
                        {i + 1}
                      </span>
                      <span className="text-sm text-slate-300 group-hover:text-white truncate">{p.name}</span>
                    </div>
                    <span className="text-xs text-[#6ea8ff] font-mono ml-2">{p.runs}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Top Projects by Spikes */}
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-[#ff5d73]" />
            <h3 className="text-sm font-semibold text-white">Top Projects by Spikes</h3>
          </div>
          <ul className="space-y-2">
            {d.topSpikes.length === 0 ? (
              <li className="text-slate-500 text-xs py-4 text-center">No spike data yet.</li>
            ) : (
              d.topSpikes.map((p, i) => (
                <li key={p.id}>
                  <Link href={`/app/projects/${p.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                        i === 1 ? "bg-slate-400/20 text-slate-300" :
                        i === 2 ? "bg-orange-500/20 text-orange-400" :
                        "bg-[#1d2742] text-slate-500"
                      }`}>
                        {i + 1}
                      </span>
                      <span className="text-sm text-slate-300 group-hover:text-white truncate">{p.name}</span>
                    </div>
                    <span className="text-xs text-[#ff5d73] font-mono ml-2">{p.spikes.toLocaleString()}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Dataset Formats */}
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database size={16} className="text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Datasets by Format</h3>
          </div>
          <div className="flex items-center gap-6">
            <Donut a={d.formatCounts.csv || 0} b={d.formatCounts.json || 0} c={d.formatCounts.text || 0} total={totalDatasets}/>
            <ul className="text-sm space-y-2 flex-1">
              <li className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03]">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#6ea8ff]"/> CSV
                </span>
                <span className="font-mono text-sm text-slate-300">{d.formatCounts.csv || 0}</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03]">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#36d399]"/> JSON
                </span>
                <span className="font-mono text-sm text-slate-300">{d.formatCounts.json || 0}</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03]">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#fbbd23]"/> Text
                </span>
                <span className="font-mono text-sm text-slate-300">{d.formatCounts.text || 0}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tag Cloud & Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag size={16} className="text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Tag Cloud</h3>
          </div>
          {d.topTags.length === 0 ? (
            <div className="text-slate-500 text-xs py-8 text-center">No tags yet.</div>
          ) : (
            <TagCloud tags={d.topTags}/>
          )}
        </div>

        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Most Frequent Actions</h3>
          </div>
          {d.topActions.length === 0 ? (
            <div className="text-slate-500 text-xs py-8 text-center">No activity recorded yet.</div>
          ) : (
            <ul className="space-y-1 font-mono text-sm">
              {d.topActions.slice(0, 10).map((a) => (
                <li key={a.action} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <span className="text-slate-300 text-xs">{a.action}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-[#1d2742] overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#6ea8ff] to-[#a855f7] rounded-full"
                        style={{ width: `${(a.count / d.topActions[0].count) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 w-6 text-right">{a.count}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}
