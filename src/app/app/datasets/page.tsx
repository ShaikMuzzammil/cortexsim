"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api, ApiError, timeAgo } from "@/lib/client/api";

interface Dataset {
  id: string;
  name: string;
  format: "csv" | "json" | "text";
  size: number;
  rows: number;
  preview: string;
  tags: string[];
  createdAt: string;
}

const rowInit = { opacity: 0, y: 6 };
const rowShow = { opacity: 1, y: 0 };

export default function DatasetsPage() {
  const [list, setList] = useState<Dataset[]>([]);
  const [name, setName] = useState("");
  const [format, setFormat] = useState<Dataset["format"]>("csv");
  const [data, setData] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Dataset | null>(null);
  const [activeContent, setActiveContent] = useState<string>("");

  const refresh = async () => {
    const r = await api<{ datasets: Dataset[] }>("/api/datasets");
    setList(r.datasets);
  };
  useEffect(() => {
    refresh();
  }, []);

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api("/api/datasets", {
        method: "POST",
        body: JSON.stringify({
          name,
          format,
          data,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      setName("");
      setData("");
      setTags("");
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    }
  };

  const onOpen = async (d: Dataset) => {
    setActive(d);
    const r = await api<{ dataset: Dataset & { data: string } }>(`/api/datasets/${d.id}`);
    setActiveContent(r.dataset.data);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this dataset?")) return;
    await api(`/api/datasets/${id}`, { method: "DELETE" });
    if (active && active.id === id) {
      setActive(null);
      setActiveContent("");
    }
    refresh();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    setName(name || f.name);
    setData(text);
    if (f.name.endsWith(".csv")) setFormat("csv");
    else if (f.name.endsWith(".json")) setFormat("json");
    else setFormat("text");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Workspace</div>
          <h1 className="text-2xl font-semibold text-white mt-1">Datasets</h1>
          <p className="text-sm text-slate-400">Upload CSV, JSON, or plain-text data. Stored in your workspace, searchable.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-3">
        <form onSubmit={onUpload} className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4 space-y-2 lg:col-span-1">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Upload</div>
          <label className="block">
            <span className="text-[10px] text-slate-500">Name</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-1.5 rounded-md bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]"/>
          </label>
          <label className="block">
            <span className="text-[10px] text-slate-500">Format</span>
            <select value={format} onChange={(e) => setFormat(e.target.value as Dataset["format"])} className="mt-1 w-full px-3 py-1.5 rounded-md bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]">
              <option value="csv">csv</option>
              <option value="json">json</option>
              <option value="text">text</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] text-slate-500">From file</span>
            <input type="file" onChange={onFile} className="mt-1 w-full text-xs text-slate-300"/>
          </label>
          <label className="block">
            <span className="text-[10px] text-slate-500">Data</span>
            <textarea required value={data} onChange={(e) => setData(e.target.value)} className="mt-1 w-full min-h-[160px] px-3 py-2 rounded-md bg-[#05070e] border border-[#1d2742] text-[11px] font-mono text-white outline-none focus:border-[#6ea8ff]" placeholder="col_a,col_b\n1,2\n3,4"/>
          </label>
          <label className="block">
            <span className="text-[10px] text-slate-500">Tags</span>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 w-full px-3 py-1.5 rounded-md bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]" placeholder="comma, separated"/>
          </label>
          {error ? <div className="text-xs text-[#ff5d73]">{error}</div> : null}
          <button type="submit" className="w-full mt-1 text-xs px-3 py-1.5 rounded-md bg-[#6ea8ff] text-[#05070e] font-semibold">Upload dataset</button>
        </form>
        <div className="lg:col-span-2 space-y-2">
          {list.length === 0 ? <div className="text-xs text-slate-500">No datasets uploaded yet.</div> : null}
          {list.map((d) => (
            <motion.div key={d.id} initial={rowInit} animate={rowShow} className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-3">
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => onOpen(d)} className="text-left flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{d.name}</div>
                  <div className="text-[11px] text-slate-500">{`${d.format.toUpperCase()} \u00b7 ${d.rows} rows \u00b7 ${(d.size / 1024).toFixed(1)} KB \u00b7 ${timeAgo(d.createdAt)}`}</div>
                </button>
                <button onClick={() => onDelete(d.id)} className="text-slate-500 hover:text-[#ff5d73] text-xs">{"\u00d7"}</button>
              </div>
              {d.tags.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {d.tags.map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[#10172c] text-slate-300">{t}</span>
                  ))}
                </div>
              ) : null}
              {active && active.id === d.id ? (
                <pre className="mt-2 text-[11px] text-slate-200 bg-[#05070e] border border-[#1d2742] rounded-md p-2 overflow-x-auto max-h-[300px]">{activeContent || d.preview}</pre>
              ) : null}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
