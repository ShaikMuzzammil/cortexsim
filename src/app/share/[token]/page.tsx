"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { downloadBlob } from "@/lib/client/api";
import Markdown from "@/components/app/Markdown";

interface SharedRun { id: string; label: string; totalSpikes: number; meanRate: number; createdAt: string; readouts: Array<{ label: string; value: string }>; }
interface SharedNote { id: string; title: string; body: string; updatedAt: string; }
interface Shared {
  project: { id: string; name: string; description: string; tags: string[]; config: Record<string, unknown>; createdAt: string; updatedAt: string };
  runs: SharedRun[];
  notes: SharedNote[];
  share: { views: number; createdAt: string };
}

const panelInit = { opacity: 0, y: 10 };
const panelShow = { opacity: 1, y: 0 };

export default function SharePage() {
  const params = useParams<{ token: string }>();
  const [data, setData] = useState<Shared | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.token) return;
    (async () => {
      const res = await fetch(`/api/share/${params.token}`);
      if (!res.ok) {
        setErr((await res.json()).error || "not found");
        return;
      }
      setData(await res.json());
    })();
  }, [params?.token]);

  if (err) {
    return (
      <div className="min-h-screen bg-[#05070e] text-slate-200 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-2xl font-semibold text-white">Share link unavailable</div>
          <div className="text-sm text-slate-400 mt-2">{err === "expired" ? "This share link has expired." : "The link is invalid or has been revoked."}</div>
          <Link href="/" className="inline-block mt-4 text-xs px-3 py-1.5 rounded-md bg-[#6ea8ff] text-[#05070e] font-semibold">Back to CortexSim</Link>
        </div>
      </div>
    );
  }
  if (!data) return <div className="min-h-screen bg-[#05070e] text-slate-400 flex items-center justify-center text-sm">{"Loading\u2026"}</div>;

  return (
    <div className="min-h-screen bg-[#05070e] text-slate-100">
      <header className="sticky top-0 z-30 border-b border-[#1d2742] bg-[#05070e]/85 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-[#6ea8ff]"/>
            <span className="font-semibold tracking-tight">CortexSim</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Shared view</span>
          </Link>
          <div className="text-[11px] text-slate-500">{data.share.views} views</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <motion.div initial={panelInit} animate={panelShow}>
          <h1 className="text-3xl font-semibold text-white">{data.project.name}</h1>
          {data.project.description ? <p className="text-sm text-slate-400 mt-2 max-w-3xl">{data.project.description}</p> : null}
          <div className="mt-3 flex flex-wrap gap-1">
            {data.project.tags.map((t) => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[#10172c] text-slate-300">{t}</span>
            ))}
          </div>
        </motion.div>

        <section className="grid md:grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Runs</div>
            <div className="text-2xl font-semibold text-white mt-1">{data.runs.length}</div>
          </div>
          <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Notes</div>
            <div className="text-2xl font-semibold text-white mt-1">{data.notes.length}</div>
          </div>
          <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Created</div>
            <div className="text-sm text-slate-200 mt-1">{new Date(data.project.createdAt).toLocaleDateString()}</div>
          </div>
        </section>

        <section className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Configuration</h2>
            <button onClick={() => downloadBlob(`${data.project.name}-config.json`, JSON.stringify(data.project.config, null, 2), "application/json")} className="text-[11px] px-2 py-1 rounded-md border border-[#1d2742] text-slate-300">Download JSON</button>
          </div>
          <pre className="text-[11px] text-slate-200 bg-[#05070e] border border-[#1d2742] rounded-md p-3 overflow-x-auto">{JSON.stringify(data.project.config, null, 2)}</pre>
        </section>

        {data.runs.length ? (
          <section className="rounded-xl bg-[#0b1226] border border-[#1d2742] overflow-hidden">
            <div className="px-4 py-2 text-sm font-semibold text-white border-b border-[#1d2742]">Runs</div>
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase tracking-wide text-slate-500">
                <tr><th className="text-left p-2">Label</th><th className="text-right p-2">Spikes</th><th className="text-right p-2">Mean rate</th><th className="text-right p-2">When</th></tr>
              </thead>
              <tbody>
                {data.runs.map((r) => (
                  <tr key={r.id} className="border-t border-[#1d2742]">
                    <td className="p-2 text-slate-200">{r.label}</td>
                    <td className="p-2 text-right text-slate-300">{r.totalSpikes.toLocaleString()}</td>
                    <td className="p-2 text-right text-slate-300">{r.meanRate.toFixed(1)} Hz</td>
                    <td className="p-2 text-right text-slate-500">{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        {data.notes.length ? (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-white">Notes</h2>
            {data.notes.map((n) => (
              <article key={n.id} className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
                <h3 className="text-sm font-semibold text-white">{n.title}</h3>
                <div className="text-[10px] text-slate-500 mb-2">{new Date(n.updatedAt).toLocaleString()}</div>
                <Markdown source={n.body}/>
              </article>
            ))}
          </section>
        ) : null}

        <footer className="text-center text-[11px] text-slate-500 pt-6">
          Shared with CortexSim. <Link href="/auth/signup" className="text-[#6ea8ff]">Create your own workspace</Link>.
        </footer>
      </main>
    </div>
  );
}
