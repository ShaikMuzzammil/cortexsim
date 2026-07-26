"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Brain, Zap, Activity, Database, TrendingUp, ArrowRight, 
  Play, BookOpen, BarChart3, Settings, Download, Users,
  Cpu, Globe, Shield, Sparkles
} from "lucide-react";

const cardInit = { opacity: 0, y: 20 };
const cardShow = { opacity: 1, y: 0 };

// Mock stats for demo mode (no backend required)
const DEMO_STATS = {
  counts: { projects: 12, runs: 48, notes: 23, datasets: 7, comments: 15 },
  totals: { spikes: 2847293, datasetBytes: 524288 },
  series: Array.from({ length: 14 }, (_, i) => ({
    day: `Day ${i + 1}`,
    runs: Math.floor(Math.random() * 20) + 5,
    notes: Math.floor(Math.random() * 10) + 2,
    events: Math.floor(Math.random() * 30) + 10,
  })),
  live: { listeners: 147, events: 8934, uptimeMs: 86400000 },
  recentProjects: [
    { id: "1", name: "Izhikevich Neuron Model", updatedAt: new Date(Date.now() - 3600000).toISOString() },
    { id: "2", name: "STDP Plasticity Study", updatedAt: new Date(Date.now() - 7200000).toISOString() },
    { id: "3", name: "Cortical Microcircuit", updatedAt: new Date(Date.now() - 14400000).toISOString() },
    { id: "4", name: "Feedforward Network", updatedAt: new Date(Date.now() - 28800000).toISOString() },
  ],
  recentRuns: [
    { id: "1", projectId: "1", label: "Burst Analysis Run", createdAt: new Date(Date.now() - 1800000).toISOString(), totalSpikes: 15234 },
    { id: "2", projectId: "2", label: "Learning Rate Sweep", createdAt: new Date(Date.now() - 3600000).toISOString(), totalSpikes: 28901 },
    { id: "3", projectId: "3", label: "Synchronization Test", createdAt: new Date(Date.now() - 7200000).toISOString(), totalSpikes: 9876 },
  ],
};

function StatCard({ label, value, hint, accent = "#6ea8ff", icon }: { 
  label: string; value: string; hint?: string; accent?: string; icon?: React.ReactNode 
}) {
  return (
    <motion.div
      initial={cardInit}
      animate={cardShow}
      whileHover={{ scale: 1.02, y: -2 }}
      className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-5 hover:border-[#2a3760] transition-all group cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-medium">{label}</div>
          <div className="text-3xl font-bold text-white mt-2" style={{ color: accent }}>{value}</div>
          {hint && <div className="text-[11px] text-slate-500 mt-1">{hint}</div>}
        </div>
        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors" style={{ color: accent }}>
          {icon || <Activity size={20} />}
        </div>
      </div>
    </motion.div>
  );
}

function QuickActionCard({ href, title, description, icon, color, delay = 0 }: {
  href: string; title: string; description: string; icon: React.ReactNode; color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.03, y: -4 }}
    >
      <Link href={href} className="block h-full">
        <div className="h-full rounded-xl bg-[#0b1226] border border-[#1d2742] p-5 hover:border-[#2a3760] transition-all group">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
            {icon}
          </div>
          <h3 className="text-base font-semibold text-white group-hover:text-[#6ea8ff] transition-colors">{title}</h3>
          <p className="text-sm text-slate-500 mt-2">{description}</p>
          <div className="flex items-center gap-1 text-xs text-[#6ea8ff] mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            Open <ArrowRight size={14} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const diff = Math.max(0, Date.now() - t);
  const s = Math.floor(diff / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

export default function DashboardPage() {
  const [s] = useState(DEMO_STATS);

  return (
    <motion.div initial={cardInit} animate={cardShow} className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#6ea8ff] font-semibold">Dashboard</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-medium">GUEST MODE</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome to CortexSim Studio</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Your neural dynamics workspace. Explore simulations, analyze data, and export results — no login required.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/simulator" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6ea8ff] to-[#a855f7] text-white font-semibold text-sm shadow-lg hover:shadow-[#6ea8ff]/25 transition-all">
            <Play size={16} />
            Launch Studio
          </Link>
          <Link href="/learn" className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#1d2742] text-slate-200 hover:border-[#2a3760] text-sm font-medium transition-all">
            <BookOpen size={16} />
            Learn
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard 
          label="Projects" 
          value={String(s.counts.projects)} 
          hint="Active workspaces"
          accent="#6ea8ff"
          icon={<Database size={20} />}
        />
        <StatCard 
          label="Simulations" 
          value={String(s.counts.runs)} 
          hint={`${s.totals.spikes.toLocaleString()} spikes total`}
          accent="#ff5d73"
          icon={<Zap size={20} />}
        />
        <StatCard 
          label="Notes" 
          value={String(s.counts.notes)} 
          accent="#fbbd23"
          icon={<BookOpen size={20} />}
        />
        <StatCard 
          label="Datasets" 
          value={String(s.counts.datasets)} 
          hint={`${(s.totals.datasetBytes / 1024).toFixed(0)} KB stored`}
          accent="#36d399"
          icon={<Database size={20} />}
        />
        <StatCard 
          label="Live Users" 
          value={String(s.live.listeners)} 
          hint={`${s.live.events.toLocaleString()} events broadcast`}
          accent="#5db1ff"
          icon={<Users size={20} />}
        />
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-[#6ea8ff]" />
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            href="/simulator"
            title="Neural Studio"
            description="Launch the full simulator with 35+ interactive modules for neural network simulation and analysis."
            icon={<Brain size={24} className="text-white" />}
            color="bg-gradient-to-br from-[#6ea8ff] to-[#a855f7]"
            delay={0}
          />
          <QuickActionCard
            href="/app/projects"
            title="Projects"
            description="Manage your simulation projects, organize runs, and collaborate on experiments."
            icon={<Database size={24} className="text-white" />}
            color="bg-gradient-to-br from-emerald-500 to-teal-600"
            delay={0.05}
          />
          <QuickActionCard
            href="/app/datasets"
            title="Datasets"
            description="Browse, import, and analyze neural data with powerful visualization tools."
            icon={<BarChart3 size={24} className="text-white" />}
            color="bg-gradient-to-br from-orange-500 to-red-500"
            delay={0.1}
          />
          <QuickActionCard
            href="/app/exports"
            title="Export Center"
            description="Export simulations, data, and reports in multiple formats including PDF, CSV, JSON."
            icon={<Download size={24} className="text-white" />}
            color="bg-gradient-to-br from-purple-500 to-pink-500"
            delay={0.15}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Database size={16} className="text-[#6ea8ff]" />
              Recent Projects
            </h3>
            <Link href="/app/projects" className="text-xs text-[#6ea8ff] hover:text-white flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <ul className="space-y-2">
            {s.recentProjects.map((p) => (
              <li key={p.id}>
                <Link href={`/app/projects/${p.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.03] transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#6ea8ff]/10 flex items-center justify-center text-[#6ea8ff]">
                      <Brain size={16} />
                    </div>
                    <span className="text-sm text-slate-200 group-hover:text-white">{p.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">{timeAgo(p.updatedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Runs */}
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity size={16} className="text-[#ff5d73]" />
              Recent Simulations
            </h3>
            <Link href="/app/projects" className="text-xs text-[#6ea8ff] hover:text-white flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <ul className="space-y-2">
            {s.recentRuns.map((r) => (
              <li key={r.id}>
                <Link href={`/app/projects/${r.projectId}?tab=runs`} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.03] transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#ff5d73]/10 flex items-center justify-center text-[#ff5d73]">
                      <Zap size={16} />
                    </div>
                    <div>
                      <span className="block text-sm text-slate-200 group-hover:text-white">{r.label}</span>
                      <span className="text-[11px] text-slate-500">{r.totalSpikes.toLocaleString()} spikes</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500">{timeAgo(r.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Platform Features Overview */}
      <div className="rounded-xl bg-gradient-to-r from-[#6ea8ff]/10 via-[#a855f7]/10 to-[#6ea8ff]/10 border border-[#6ea8ff]/20 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[#6ea8ff]/20">
            <Cpu size={24} className="text-[#6ea8ff]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">Platform Capabilities</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Shield size={16} className="text-emerald-400" /> No Login Required
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Globe size={16} className="text-blue-400" /> Browser-Based
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Zap size={16} className="text-yellow-400" /> Real-Time Simulation
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Download size={16} className="text-purple-400" /> Multi-Format Export
              </div>
            </div>
          </div>
          <Link href="/platform" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/15 transition-colors">
            Learn More <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-[#fbbd23]" />
          Getting Started
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-5">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="font-semibold text-white mb-2">1. Understand Neural Models</h3>
            <p className="text-sm text-slate-500">Learn about Izhikevich neurons, spiking dynamics, and synaptic plasticity through interactive tutorials.</p>
            <Link href="/learn" className="inline-flex items-center gap-1 text-sm text-[#6ea8ff] mt-3 hover:text-white">
              Start Learning →
            </Link>
          </div>
          <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-5">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-white mb-2">2. Run Simulations</h3>
            <p className="text-sm text-slate-500">Launch the Neural Studio and explore 35+ modules covering visualization, analysis, and dynamics.</p>
            <Link href="/simulator" className="inline-flex items-center gap-1 text-sm text-[#6ea8ff] mt-3 hover:text-white">
              Open Studio →
            </Link>
          </div>
          <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-5">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-white mb-2">3. Export & Analyze</h3>
            <p className="text-sm text-slate-500">Export your results in multiple formats, compare runs, and generate insights from your data.</p>
            <Link href="/app/exports" className="inline-flex items-center gap-1 text-sm text-[#6ea8ff] mt-3 hover:text-white">
              Export Center →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
