"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api, ApiError, timeAgo } from "@/lib/client/api";

interface Project {
  id: string;
  name: string;
  description: string;
  tags: string[];
  starred?: boolean;
  updatedAt: string;
  createdAt: string;
}

const rowInit = { opacity: 0, y: 6 };
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

  const refresh = async () => {
    setLoading(true);
    try {
      const r = await api<{ projects: Project[] }>("/api/projects");
      setProjects(r.projects);
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

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Workspace</div>
          <h1 className="text-2xl font-semibold text-white mt-1">Projects</h1>
          <p className="text-sm text-slate-400">Each project owns its config, runs, notes, and discussion.</p>
        </div>
        <div className="flex items-center gap-2">
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter\u2026" className="px-3 py-1.5 rounded-md bg-[#0b1226] border border-[#1d2742] text-xs text-white outline-none focus:border-[#6ea8ff]"/>
          <button onClick={() => setCreating(true)} className="text-xs px-3 py-1.5 rounded-md bg-[#6ea8ff] text-[#05070e] font-semibold">New project</button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">{"Loading\u2026"}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-8 text-center">
          <div className="text-sm text-slate-300">No projects yet.</div>
          <button onClick={() => setCreating(true)} className="mt-3 text-xs px-3 py-1.5 rounded-md bg-[#6ea8ff] text-[#05070e] font-semibold">Create your first project</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <motion.div key={p.id} initial={rowInit} animate={rowShow} className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4 hover:border-[#2a3760] transition">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/app/projects/${p.id}`} className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{p.name}</div>
                  <div className="text-[11px] text-slate-500">{"Updated " + timeAgo(p.updatedAt)}</div>
                </Link>
                <button onClick={() => onToggleStar(p)} className={`text-sm ${p.starred ? "text-[#fbbd23]" : "text-slate-600"} hover:text-[#fbbd23]`} title="Toggle star">
                  {p.starred ? "\u2605" : "\u2606"}
                </button>
              </div>
              <div className="text-xs text-slate-400 mt-2 line-clamp-2 min-h-[2em]">{p.description || "No description."}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {p.tags.map((t) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[#10172c] text-slate-300">{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {creating ? (
          <motion.div initial={modalInit} animate={modalShow} exit={modalInit} className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center px-4" onClick={() => setCreating(false)}>
            <motion.form onSubmit={onCreate} initial={panelInit} animate={panelShow} exit={panelInit} className="w-full max-w-[460px] rounded-xl bg-[#0b1226] border border-[#1d2742] p-5" onClick={(e) => e.stopPropagation()}>
              <div className="text-sm font-semibold text-white mb-3">New project</div>
              <label className="block mb-2">
                <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Name</span>
                <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-md bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]" placeholder="Cortex coverage study"/>
              </label>
              <label className="block mb-2">
                <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Description</span>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-md bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff] min-h-[80px]" placeholder="What are you exploring?"/>
              </label>
              <label className="block mb-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Tags (comma separated)</span>
                <input value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-md bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]" placeholder="snn, cortex, exploration"/>
              </label>
              {error ? <div className="text-xs text-[#ff5d73] mb-2">{error}</div> : null}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setCreating(false)} className="text-xs px-3 py-1.5 rounded-md border border-[#1d2742] text-slate-300">Cancel</button>
                <button type="submit" className="text-xs px-3 py-1.5 rounded-md bg-[#6ea8ff] text-[#05070e] font-semibold">Create project</button>
              </div>
            </motion.form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
