"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { api, ApiError, downloadBlob, timeAgo } from "@/lib/client/api";
import Markdown from "@/components/app/Markdown";
import type { SimConfig } from "@/types";

interface Project {
  id: string;
  name: string;
  description: string;
  tags: string[];
  starred?: boolean;
  config: SimConfig;
  createdAt: string;
  updatedAt: string;
}
interface Run { id: string; label: string; totalSpikes: number; meanRate: number; durationMs: number; createdAt: string; }
interface Note { id: string; title: string; body: string; pinned?: boolean; updatedAt: string; createdAt: string; }
interface Comment { id: string; authorName: string; body: string; createdAt: string; }

const TABS = ["overview", "runs", "notes", "discussion", "config"] as const;
type Tab = typeof TABS[number];
const panelInit = { opacity: 0, y: 6 };
const panelShow = { opacity: 1, y: 0 };

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const initialTab = (search?.get("tab") as Tab) || "overview";
  const [tab, setTab] = useState<Tab>(TABS.includes(initialTab) ? initialTab : "overview");
  const [project, setProject] = useState<Project | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [newRunLabel, setNewRunLabel] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteBody, setNewNoteBody] = useState("");
  const [newComment, setNewComment] = useState("");
  const [savingDesc, setSavingDesc] = useState(false);
  const [editingDesc, setEditingDesc] = useState("");

  const id = params?.id || "";

  const load = useCallback(async () => {
    try {
      const [p, r, n, c] = await Promise.all([
        api<{ project: Project }>(`/api/projects/${id}`),
        api<{ runs: Run[] }>(`/api/projects/${id}/runs`),
        api<{ notes: Note[] }>(`/api/projects/${id}/notes`),
        api<{ comments: Comment[] }>(`/api/projects/${id}/comments`),
      ]);
      setProject(p.project);
      setEditingDesc(p.project.description);
      setRuns(r.runs);
      setNotes(n.notes);
      setComments(c.comments);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "failed");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) load();
  }, [id, load]);

  const onSaveDesc = async () => {
    if (!project) return;
    setSavingDesc(true);
    try {
      await api(`/api/projects/${id}`, { method: "PUT", body: JSON.stringify({ description: editingDesc }) });
      await load();
    } finally {
      setSavingDesc(false);
    }
  };

  const onAddRun = async () => {
    if (!project) return;
    await api(`/api/projects/${id}/runs`, {
      method: "POST",
      body: JSON.stringify({
        label: newRunLabel || `Run ${new Date().toLocaleString()}`,
        durationMs: 1000,
        totalSpikes: Math.floor(Math.random() * 8000 + 2000),
        meanRate: Math.round((4 + Math.random() * 18) * 10) / 10,
        config: project.config,
        readouts: [
          { label: "E rate", value: "12.4 Hz" },
          { label: "I rate", value: "18.1 Hz" },
          { label: "Sync", value: "0.32" },
        ],
      }),
    });
    setNewRunLabel("");
    await load();
  };

  const onDeleteRun = async (rid: string) => {
    await api(`/api/runs/${rid}`, { method: "DELETE" });
    await load();
  };

  const onAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    await api(`/api/projects/${id}/notes`, {
      method: "POST",
      body: JSON.stringify({ title: newNoteTitle, body: newNoteBody }),
    });
    setNewNoteTitle("");
    setNewNoteBody("");
    await load();
  };

  const onDeleteNote = async (nid: string) => {
    await api(`/api/notes/${nid}`, { method: "DELETE" });
    await load();
  };

  const onTogglePinNote = async (note: Note) => {
    await api(`/api/notes/${note.id}`, { method: "PUT", body: JSON.stringify({ pinned: !note.pinned }) });
    await load();
  };

  const onAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await api(`/api/projects/${id}/comments`, { method: "POST", body: JSON.stringify({ body: newComment }) });
    setNewComment("");
    await load();
  };

  const onDeleteProject = async () => {
    if (!confirm("Delete this project and all its runs/notes/comments?")) return;
    await api(`/api/projects/${id}`, { method: "DELETE" });
    router.push("/app/projects");
  };

  if (loading) return <div className="text-sm text-slate-500">{"Loading\u2026"}</div>;
  if (err || !project) return <div className="text-sm text-[#ff5d73]">{err || "Project not found."}</div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Project</div>
          <h1 className="text-2xl font-semibold text-white mt-1 truncate max-w-[60vw]">{project.name}</h1>
          <div className="text-[11px] text-slate-500">{"Created " + timeAgo(project.createdAt) + " \u00b7 updated " + timeAgo(project.updatedAt)}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => downloadBlob(`${project.name}.json`, JSON.stringify({ project, runs, notes, comments }, null, 2), "application/json")} className="text-xs px-3 py-1.5 rounded-md border border-[#1d2742] text-slate-200">Export project JSON</button>
          <button onClick={onDeleteProject} className="text-xs px-3 py-1.5 rounded-md border border-[#3a1d2a] text-[#ff5d73] hover:bg-[#1a0d12]">Delete project</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-[#1d2742]">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`text-xs px-3 py-2 -mb-px border-b-2 ${tab === t ? "border-[#6ea8ff] text-white" : "border-transparent text-slate-400 hover:text-white"}`}>{t}</button>
        ))}
      </div>

      {tab === "overview" ? (
        <motion.div initial={panelInit} animate={panelShow} className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2 rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-1">Description</div>
            <textarea value={editingDesc} onChange={(e) => setEditingDesc(e.target.value)} className="w-full min-h-[120px] px-3 py-2 rounded-md bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]"/>
            <div className="mt-2 flex justify-end">
              <button onClick={onSaveDesc} disabled={savingDesc} className="text-xs px-3 py-1.5 rounded-md bg-[#6ea8ff] text-[#05070e] font-semibold disabled:opacity-60">{savingDesc ? "Saving\u2026" : "Save description"}</button>
            </div>
          </div>
          <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-2">Snapshot</div>
            <div className="text-xs text-slate-300 grid grid-cols-2 gap-1">
              <span className="text-slate-500">Runs</span><span>{runs.length}</span>
              <span className="text-slate-500">Notes</span><span>{notes.length}</span>
              <span className="text-slate-500">Comments</span><span>{comments.length}</span>
              <span className="text-slate-500">Tags</span><span>{project.tags.length}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {project.tags.map((t) => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[#10172c] text-slate-300">{t}</span>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}

      {tab === "runs" ? (
        <motion.div initial={panelInit} animate={panelShow} className="space-y-3">
          <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-3 flex items-center gap-2">
            <input value={newRunLabel} onChange={(e) => setNewRunLabel(e.target.value)} placeholder="Run label (optional)" className="flex-1 px-3 py-1.5 rounded-md bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]"/>
            <button onClick={onAddRun} className="text-xs px-3 py-1.5 rounded-md bg-[#6ea8ff] text-[#05070e] font-semibold">Record run snapshot</button>
          </div>
          {runs.length === 0 ? (
            <div className="text-xs text-slate-500 px-1">No runs saved yet. Record a snapshot to keep config + metrics together.</div>
          ) : (
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase tracking-wide text-slate-500">
                <tr><th className="text-left p-2">Label</th><th className="text-right p-2">Spikes</th><th className="text-right p-2">Mean rate</th><th className="text-right p-2">Created</th><th/></tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} className="border-t border-[#1d2742] hover:bg-[#0b1226]">
                    <td className="p-2 text-slate-200">{r.label}</td>
                    <td className="p-2 text-right text-slate-300">{r.totalSpikes.toLocaleString()}</td>
                    <td className="p-2 text-right text-slate-300">{r.meanRate.toFixed(1)} Hz</td>
                    <td className="p-2 text-right text-slate-500">{timeAgo(r.createdAt)}</td>
                    <td className="p-2 text-right"><button onClick={() => onDeleteRun(r.id)} className="text-slate-500 hover:text-[#ff5d73]">{"\u00d7"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      ) : null}

      {tab === "notes" ? (
        <motion.div initial={panelInit} animate={panelShow} className="grid md:grid-cols-2 gap-3">
          <form onSubmit={onAddNote} className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-2">New note</div>
            <input value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} placeholder="Title" className="w-full px-3 py-1.5 rounded-md bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]"/>
            <textarea value={newNoteBody} onChange={(e) => setNewNoteBody(e.target.value)} placeholder="Markdown body\u2026" className="mt-2 w-full min-h-[120px] px-3 py-2 rounded-md bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff] font-mono text-[12px]"/>
            <div className="mt-2 flex justify-end">
              <button type="submit" className="text-xs px-3 py-1.5 rounded-md bg-[#6ea8ff] text-[#05070e] font-semibold">Add note</button>
            </div>
          </form>
          <div className="space-y-2">
            {notes.length === 0 ? <div className="text-xs text-slate-500">No notes yet.</div> : null}
            {notes.map((n) => (
              <div key={n.id} className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white truncate">{n.title}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onTogglePinNote(n)} className={`text-xs ${n.pinned ? "text-[#fbbd23]" : "text-slate-500"} hover:text-[#fbbd23]`} title="Pin">{n.pinned ? "\u25C9" : "\u25CB"}</button>
                    <button onClick={() => onDeleteNote(n.id)} className="text-xs text-slate-500 hover:text-[#ff5d73]">{"\u00d7"}</button>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mb-2">{timeAgo(n.updatedAt)}</div>
                <Markdown source={n.body}/>
              </div>
            ))}
          </div>
        </motion.div>
      ) : null}

      {tab === "discussion" ? (
        <motion.div initial={panelInit} animate={panelShow} className="space-y-3">
          <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-3">
            {comments.length === 0 ? <div className="text-xs text-slate-500 mb-2">No comments yet.</div> : (
              <ul className="space-y-3 mb-3">
                {comments.map((c) => (
                  <li key={c.id} className="text-sm">
                    <div className="text-[11px] text-slate-500">{c.authorName} \u00b7 {timeAgo(c.createdAt)}</div>
                    <div className="text-slate-200 whitespace-pre-wrap">{c.body}</div>
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={onAddComment} className="flex gap-2">
              <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment\u2026" className="flex-1 px-3 py-1.5 rounded-md bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]"/>
              <button type="submit" className="text-xs px-3 py-1.5 rounded-md bg-[#6ea8ff] text-[#05070e] font-semibold">Send</button>
            </form>
          </div>
        </motion.div>
      ) : null}

      {tab === "config" ? (
        <motion.div initial={panelInit} animate={panelShow} className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-2">Project configuration</div>
          <pre className="text-[11px] text-slate-200 bg-[#05070e] border border-[#1d2742] rounded-md p-3 overflow-x-auto">{JSON.stringify(project.config, null, 2)}</pre>
          <Link href={`/simulator?cfg=${project.id}`} className="inline-block mt-2 text-xs px-3 py-1.5 rounded-md bg-[#6ea8ff] text-[#05070e] font-semibold">Open in Studio</Link>
        </motion.div>
      ) : null}
    </div>
  );
}
