"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError, timeAgo } from "@/lib/client/api";

interface ShareLink {
  id: string;
  projectId: string;
  token: string;
  views: number;
  createdAt: string;
  expiresAt?: string;
}
interface Project { id: string; name: string; }

export default function SharesPage() {
  const [shares, setShares] = useState<ShareLink[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pid, setPid] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  const refresh = async () => {
    const [s, p] = await Promise.all([
      api<{ shares: ShareLink[] }>("/api/share"),
      api<{ projects: Project[] }>("/api/projects"),
    ]);
    setShares(s.shares);
    setProjects(p.projects);
  };
  useEffect(() => {
    refresh();
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api("/api/share", { method: "POST", body: JSON.stringify({ projectId: pid }) });
      setPid("");
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "failed");
    }
  };

  const onRevoke = async (id: string) => {
    if (!confirm("Revoke this share link?")) return;
    await api(`/api/share?id=${id}`, { method: "DELETE" });
    refresh();
  };

  const nameFor = (id: string) => projects.find((p) => p.id === id)?.name || id.slice(-8);

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Workspace</div>
        <h1 className="text-2xl font-semibold text-white mt-1">Share links</h1>
        <p className="text-sm text-slate-400">Public, read-only views of a project. Anyone with the link can see the project config, runs, and notes.</p>
      </div>

      <form onSubmit={onCreate} className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-3 flex flex-wrap items-end gap-2">
        <label className="block flex-1 min-w-[220px]">
          <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Project</span>
          <select required value={pid} onChange={(e) => setPid(e.target.value)} className="mt-1 w-full px-3 py-1.5 rounded-md bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]">
            <option value="">Pick a project\u2026</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <button type="submit" className="text-xs px-3 py-1.5 rounded-md bg-[#6ea8ff] text-[#05070e] font-semibold">Generate share link</button>
      </form>
      {error ? <div className="text-xs text-[#ff5d73]">{error}</div> : null}

      <div className="space-y-2">
        {shares.length === 0 ? <div className="text-xs text-slate-500">No share links yet.</div> : null}
        {shares.map((s) => {
          const url = origin + "/share/" + s.token;
          return (
            <div key={s.id} className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <Link href={`/app/projects/${s.projectId}`} className="text-sm text-white hover:text-[#6ea8ff]">{nameFor(s.projectId)}</Link>
                  <div className="text-[11px] text-slate-500">{s.views} views \u00b7 {timeAgo(s.createdAt)}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <code className="text-[11px] px-2 py-1 rounded bg-[#05070e] border border-[#1d2742] text-slate-300 font-mono">{url}</code>
                  <button onClick={() => navigator.clipboard?.writeText(url)} className="text-[11px] px-2 py-1 rounded-md border border-[#1d2742] text-slate-200">Copy</button>
                  <a href={url} target="_blank" rel="noreferrer" className="text-[11px] px-2 py-1 rounded-md border border-[#1d2742] text-slate-200">Open</a>
                  <button onClick={() => onRevoke(s.id)} className="text-[11px] px-2 py-1 rounded-md border border-[#3a1d2a] text-[#ff5d73]">Revoke</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
