"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api, ApiError, timeAgo, downloadBlob } from "@/lib/client/api";
import { Plus, Search, Star, ExternalLink, Brain, Zap, Database, BookOpen } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  tags: string[];
  starred?: boolean;
  updatedAt: string;
  createdAt: string;
  runs?: number;
  spikes?: number;
}

// Demo projects for guest mode
const DEMO_PROJECTS: Project[] = [
  {
    id: "demo-1",
    name: "Izhikevich Neuron Model",
    description: "Exploring the rich dynamics of Izhikevich spiking neuron models including regular spiking, chattering, and bursting patterns.",
    tags: ["izhikevich", "neuron", "spiking", "dynamics"],
    starred: true,
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    runs: 12,
    spikes: 15234,
  },
  {
    id: "demo-2",
    name: "STDP Plasticity Study",
    description: "Spike-timing-dependent plasticity experiments with various timing windows and weight update rules.",
    tags: ["stdp", "plasticity", "learning", "synapse"],
    starred: true,
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    runs: 8,
    spikes: 28901,
  },
  {
    id: "demo-3",
    name: "Cortical Microcircuit",
    description: "Modeling layer 2/3 cortical microcircuits with excitatory and inhibitory populations.",
    tags: ["cortex", "microcircuit", "e-i", "network"],
    starred: false,
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    runs: 5,
    spikes: 9876,
  },
  {
    id: "demo-4",
    name: "Feedforward Network Analysis",
    description: "Analyzing signal propagation through multi-layer feedforward spiking networks.",
    tags: ["feedforward", "propagation", "layers", "analysis"],
    starred: false,
    updatedAt: new Date(Date.now() - 28800000).toISOString(),
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    runs: 15,
    spikes: 45678,
  },
  {
    id: "demo-5",
    name: "Oscillation & Synchrony",
    description: "Investigating gamma oscillations and neural synchrony in recurrent networks.",
    tags: ["oscillation", "gamma", "synchrony", "rhythms"],
    starred: true,
    updatedAt: new Date(Date.now() - 57600000).toISOString(),
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    runs: 20,
    spikes: 67890,
  },
  {
    id: "demo-6",
    name: "Parameter Sweep Explorer",
    description: "Systematic exploration of parameter space for optimal network configurations.",
    tags: ["sweep", "parameters", "optimization", "exploration"],
    starred: false,
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 864000000).toISOString(),
    runs: 33,
    spikes: 112345,
  },
];

const rowInit = { opacity: 0, y: 20 };
const rowShow = { opacity: 1, y: 0 };
const modalInit = { opacity: 0 };
const modalShow = { opacity: 1 };
const panelInit = { opacity: 0, scale: 0.96 };
const panelShow = { opacity: 1, scale: 1 };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDemoMode, setIsDemoMode] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const r = await api<{ projects: Project[] }>("/api/projects");
      setProjects(r.projects);
      setIsDemoMode(false);
    } catch {
      // Use demo data if API fails
      setProjects(DEMO_PROJECTS);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // In demo mode, create locally
    if (isDemoMode) {
      const newProject: Project = {
        id: `demo-${Date.now()}`,
        name,
        description: desc,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        starred: false,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        runs: 0,
        spikes: 0,
      };
      setProjects((prev) => [newProject, ...prev]);
      setName("");
      setDesc("");
      setTags("");
      setCreating(false);
      return;
    }
    
    try {
      await api("/api/projects", {
        method: "POST",
        body: JSON.stringify({
          name,
          description: desc,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      setName("");
      setDesc("");
      setTags("");
      setCreating(false);
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Create failed");
    }
  };

  const onToggleStar = async (p: Project) => {
    if (isDemoMode) {
      setProjects((prev) =>
        prev.map((proj) =>
          proj.id === p.id ? { ...proj, starred: !proj.starred } : proj
        )
      );
      return;
    }
    await api(`/api/projects/${p.id}`, {
      method: "PUT",
      body: JSON.stringify({ starred: !p.starred }),
    });
    refresh();
  };

  const filtered = projects.filter((p) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q));
  });

  // Export project list
  const exportProjects = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      totalProjects: filtered.length,
      projects: filtered.map(p => ({
        name: p.name,
        description: p.description,
        tags: p.tags,
        updatedAt: p.updatedAt,
        runs: p.runs || 0,
        spikes: p.spikes || 0,
      })),
    };
    downloadBlob(`cortexsim-projects-${Date.now()}.json`, JSON.stringify(data, null, 2), "application/json");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-[#6ea8ff]/10">
              <Database size={22} className="text-[#6ea8ff]" />
            </div>
            <h1 className="text-3xl font-bold text-white">Projects</h1>
            {isDemoMode && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-medium">DEMO MODE</span>
            )}
          </div>
          <p className="text-sm text-slate-400 max-w-xl">
            Each project owns its config, simulation runs, notes, and analysis. 
            Organize your neural network experiments here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="hidden sm:flex items-center bg-[#0b1226] border border-[#1d2742] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${viewMode === "grid" ? "bg-[#6ea8ff] text-white" : "text-slate-400 hover:text-white"}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${viewMode === "list" ? "bg-[#6ea8ff] text-white" : "text-slate-400 hover:text-white"}`}
            >
              List
            </button>
          </div>
          
          <button onClick={exportProjects} className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1d2742] text-slate-300 hover:border-[#2a3760] text-xs transition-all">
            Export
          </button>
          
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)} 
              placeholder="Search projects..." 
              className="pl-9 pr-4 py-2 rounded-lg bg-[#0b1226] border border-[#1d2742] text-xs text-white outline-none focus:border-[#6ea8ff] w-48"
            />
          </div>
          
          <button 
            onClick={() => setCreating(true)} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6ea8ff] to-[#a855f7] text-white font-semibold text-sm shadow-lg hover:shadow-[#6ea8ff]/25 transition-all"
          >
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      {!loading && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 px-1">
          <span>{filtered.length} projects</span>
          <span>•</span>
          <span>{filtered.filter(p => p.starred).length} starred</span>
          <span>•</span>
          <span>{filtered.reduce((acc, p) => acc + (p.runs || 0), 0)} total runs</span>
          {isDemoMode && (
            <>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                Using demo data
              </span>
            </>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-2 border-[#6ea8ff] border-t-transparent rounded-full"
          />
        </div>
      ) : filtered.length === 0 ? (
        /* Empty State */
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#6ea8ff]/10 flex items-center justify-center">
            <Database size={28} className="text-[#6ea8ff]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No projects found</h3>
          <p className="text-sm text-slate-400 mb-4">
            {filter ? "Try adjusting your search terms" : "Create your first neural network project"}
          </p>
          <button 
            onClick={() => setCreating(true)} 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6ea8ff] to-[#a855f7] text-white font-semibold text-sm"
          >
            <Plus size={16} /> Create Project
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={rowInit}
              animate={rowShow}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group relative rounded-xl bg-[#0b1226] border border-[#1d2742] p-5 hover:border-[#6ea8ff]/50 hover:shadow-xl hover:shadow-[#6ea8ff]/10 transition-all cursor-pointer"
            >
              {/* Star Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleStar(p); }} 
                className={`absolute top-4 right-4 text-lg ${p.starred ? "text-[#fbbd23]" : "text-slate-600"} hover:text-[#fbbd23] transition-colors`}
                title="Toggle star"
              >
                {p.starred ? "★" : "☆"}
              </button>

              {/* Content */}
              <Link href={`/app/projects/${p.id}`} className="block">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2.5 rounded-lg ${
                    p.tags.includes("izhikevich") ? "bg-blue-500/10" :
                    p.tags.includes("stdp") ? "bg-green-500/10" :
                    p.tags.includes("cortex") ? "bg-purple-500/10" :
                    "bg-[#6ea8ff]/10"
                  }`}>
                    <Brain size={18} className={
                      p.tags.includes("izhikevich") ? "text-blue-400" :
                      p.tags.includes("stdp") ? "text-green-400" :
                      p.tags.includes("cortex") ? "text-purple-400" :
                      "text-[#6ea8ff]"
                    } />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <h3 className="font-semibold text-white group-hover:text-[#6ea8ff] transition-colors truncate">{p.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{timeAgo(p.updatedAt)}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 min-h-[2.5em]">{p.description || "No description."}</p>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#10172c] text-slate-300 border border-[#1d2742]">
                      {t}
                    </span>
                  ))}
                  {p.tags.length > 3 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10172c] text-slate-500">
                      +{p.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Stats Footer */}
                {(p.runs !== undefined || p.spikes !== undefined) && (
                  <div className="mt-3 pt-3 border-t border-[#1d2742] flex items-center gap-4 text-[11px] text-slate-500">
                    {p.runs !== undefined && (
                      <span className="flex items-center gap-1">
                        <Zap size={12} className="text-orange-400"/>
                        {p.runs} runs
                      </span>
                    )}
                    {p.spikes !== undefined && (
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-400"/>
                        {p.spikes.toLocaleString()} spikes
                      </span>
                    )}
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1d2742]">
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 px-4 py-3 font-medium">Project</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 px-4 py-3 font-medium hidden sm:table-cell">Tags</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 px-4 py-3 font-medium hidden md:table-cell">Runs</th>
                <th className="text-right text-[11px] uppercase tracking-wider text-slate-500 px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-[#1d2742] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link href={`/app/projects/${p.id}`} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#6ea8ff]/10 flex items-center justify-center">
                        <Brain size={14} className="text-[#6ea8ff]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white hover:text-[#6ea8ff] transition-colors">{p.name}</div>
                        <div className="text-[11px] text-slate-500">{timeAgo(p.updatedAt)}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[#10172c] text-slate-400">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-slate-400">{p.runs || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => onToggleStar(p)}
                      className={`${p.starred ? "text-[#fbbd23]" : "text-slate-600"} hover:text-[#fbbd23]`}
                    >
                      {p.starred ? "★" : "☆"}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {creating ? (
          <motion.div 
            initial={modalInit} 
            animate={modalShow} 
            exit={modalInit} 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4" 
            onClick={() => setCreating(false)}
          >
            <motion.form 
              onSubmit={onCreate} 
              initial={panelInit} 
              animate={panelShow} 
              exit={panelInit} 
              className="w-full max-w-[480px] rounded-2xl bg-[#0b1226] border border-[#1d2742] p-6 shadow-2xl" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-[#6ea8ff]/10">
                  <Plus size={20} className="text-[#6ea8ff]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">New Project</h2>
                  <p className="text-xs text-slate-500">Create a new neural network experiment workspace</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-medium">Project Name *</span>
                  <input 
                    required 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="mt-1.5 w-full px-4 py-2.5 rounded-lg bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff] focus:ring-1 focus:ring-[#6ea8ff]/30 transition-all" 
                    placeholder="e.g., Izhikevich Bursting Study"
                  />
                </label>
                
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-medium">Description</span>
                  <textarea 
                    value={desc} 
                    onChange={(e) => setDesc(e.target.value)} 
                    className="mt-1.5 w-full px-4 py-2.5 rounded-lg bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff] focus:ring-1 focus:ring-[#6ea8ff]/30 min-h-[80px] resize-none transition-all" 
                    placeholder="What are you exploring in this project?"
                  />
                </label>
                
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-medium">Tags</span>
                  <input 
                    value={tags} 
                    onChange={(e) => setTags(e.target.value)} 
                    className="mt-1.5 w-full px-4 py-2.5 rounded-lg bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff] focus:ring-1 focus:ring-[#6ea8ff]/30 transition-all" 
                    placeholder="izhikevich, bursting, cortex (comma separated)"
                  />
                </label>
              </div>

              {error ? (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                  {error}
                </div>
              ) : null}

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setCreating(false)} 
                  className="px-4 py-2 rounded-lg border border-[#1d2742] text-slate-300 hover:bg-white/[0.03] text-sm transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#6ea8ff] to-[#a855f7] text-white font-semibold text-sm shadow-lg hover:shadow-[#6ea8ff]/25 transition-all"
                >
                  Create Project
                </button>
              </div>
            </motion.form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
