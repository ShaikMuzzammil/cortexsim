"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, ApiError, timeAgo, downloadBlob } from "@/lib/client/api";
import { 
  Database, Upload, FileText, FileJson, Trash2, Eye, Download,
  Search, Plus, X, ChevronDown
} from "lucide-react";

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

// Demo datasets for guest mode
const DEMO_DATASETS: Dataset[] = [
  {
    id: "ds-1",
    name: "Izhikevich Parameters",
    format: "csv",
    size: 2048,
    rows: 100,
    preview: "a,b,c,d,I\n0.02,0.2,-65,8,10\n0.02,0.2,-55,4,5...",
    tags: ["izhikevich", "parameters", "neuron"],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "ds-2",
    name: "Spike Train Data",
    format: "json",
    size: 4096,
    rows: 500,
    preview: '[{"t": 1.2, "i": 0}, {"t": 2.5, "i": 1}...]',
    tags: ["spikes", "temporal", "recording"],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "ds-3",
    name: "Weight Matrix Sample",
    format: "csv",
    size: 8192,
    rows: 50,
    preview: "n1,n2,n3,n4,n5\n0.1,0.0,0.3,0.0,0.2...",
    tags: ["weights", "connectivity", "matrix"],
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "ds-4",
    name: "STDP Window Function",
    format: "text",
    size: 512,
    rows: 20,
    preview: "t(ms), A+, A-\n-100, 0, 0.5\n-50, 0.1, 0.4...",
    tags: ["stdp", "plasticity", "timing"],
    createdAt: new Date(Date.now() - 28800000).toISOString(),
  },
];

const rowInit = { opacity: 0, y: 20 };
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
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);

  const refresh = async () => {
    try {
      const r = await api<{ datasets: Dataset[] }>("/api/datasets");
      setList(r.datasets);
      setIsDemoMode(false);
    } catch {
      setList(DEMO_DATASETS);
      setIsDemoMode(true);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isDemoMode || !data) {
      // Create demo dataset locally
      const newDataset: Dataset = {
        id: `ds-${Date.now()}`,
        name: name || "New Dataset",
        format,
        size: new Blob([data]).size,
        rows: data.split("\n").length,
        preview: data.substring(0, 80) + (data.length > 80 ? "..." : ""),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        createdAt: new Date().toISOString(),
      };
      setList((prev) => [newDataset, ...prev]);
      setName("");
      setData("");
      setTags("");
      setShowUploadForm(false);
      return;
    }

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
      setShowUploadForm(false);
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    }
  };

  const onOpen = async (d: Dataset) => {
    setActive(d);
    if (isDemoMode) {
      // Generate sample content based on format
      if (d.format === "csv") {
        setActiveContent("time,neuron_id,voltage,current\n0.00,0,-70.0,0.15\n0.01,0,-69.8,0.16\n... (sample CSV data)");
      } else if (d.format === "json") {
        setActiveContent(JSON.stringify([
          { t: 0, i: 0, v: -70 },
          { t: 1, i: 0, v: -69.5 },
          { t: 2, i: 1, v: -70.2 }
        ], null, 2));
      } else {
        setActiveContent(d.preview + "\n... (sample text data)");
      }
      return;
    }
    
    try {
      const r = await api<{ dataset: Dataset & { data: string } }>(`/api/datasets/${d.id}`);
      setActiveContent(r.dataset.data);
    } catch {
      setActiveContent(d.preview);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this dataset?")) return;
    
    if (isDemoMode) {
      setList((prev) => prev.filter((d) => d.id !== id));
      if (active && active.id === id) {
        setActive(null);
        setActiveContent("");
      }
      return;
    }
    
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
    setName(name || f.name.replace(/\.[^/.]+$/, ""));
    setData(text);
    if (f.name.endsWith(".csv")) setFormat("csv");
    else if (f.name.endsWith(".json")) setFormat("json");
    else setFormat("text");
  };

  const onDownload = (d: Dataset) => {
    const content = active && active.id === d.id ? activeContent : d.preview;
    const mimeType = d.format === "json" ? "application/json" : d.format === "csv" ? "text/csv" : "text/plain";
    downloadBlob(`${d.name}.${d.format}`, content, mimeType);
  };

  const filtered = list.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.tags.some((t) => t.toLowerCase().includes(q)) ||
      d.format.includes(q)
    );
  });

  const formatIcon = (format: string) => {
    switch (format) {
      case "csv": return <FileText size={16} className="text-green-400" />;
      case "json": return <FileJson size={16} className="text-blue-400" />;
      default: return <FileText size={16} className="text-slate-400" />;
    }
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
            <h1 className="text-3xl font-bold text-white">Datasets</h1>
            {isDemoMode && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-medium">DEMO MODE</span>
            )}
          </div>
          <p className="text-sm text-slate-400 max-w-xl">
            Upload and manage neural data in CSV, JSON, or plain-text formats.
            Use these datasets in your simulations and analysis.
          </p>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6ea8ff] to-[#a855f7] text-white font-semibold text-sm shadow-lg hover:shadow-[#6ea8ff]/25 transition-all"
        >
          {showUploadForm ? <X size={16} /> : <Upload size={16} />}
          {showUploadForm ? "Cancel" : "Upload Dataset"}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search datasets by name or tag..."
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0b1226] border border-[#1d2742] text-xs text-white outline-none focus:border-[#6ea8ff]"
        />
      </div>

      {/* Upload Form */}
      <AnimatePresence>
        {showUploadForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={onUpload}
            className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-5 space-y-4 overflow-hidden"
          >
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Plus size={16} className="text-[#6ea8ff]" /> New Dataset
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="space-y-1.5">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Name *</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]"
                  placeholder="My spike data"
                />
              </label>
              
              <label className="space-y-1.5">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Format</span>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as Dataset["format"])}
                  className="w-full px-3 py-2 rounded-lg bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]"
                >
                  <option value="csv">CSV (.csv)</option>
                  <option value="json">JSON (.json)</option>
                  <option value="text">Plain Text (.txt)</option>
                </select>
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Or upload a file</span>
              <input
                type="file"
                onChange={onFile}
                accept=".csv,.json,.txt"
                className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#6ea8ff] file:text-white hover:file:bg-[#5a97e6] cursor-pointer"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Data Content *</span>
              <textarea
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full min-h-[120px] px-3 py-2 rounded-lg bg-[#05070e] border border-[#1d2742] text-xs font-mono text-white outline-none focus:border-[#6ea8ff] resize-none"
                placeholder={format === "csv" ? "col_a,col_b\n1,2\n3,4" : format === "json" ? '[{"key": "value"}]' : "Enter your data here..."}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Tags (optional)</span>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]"
                placeholder="spikes, recording, experiment"
              />
            </label>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#6ea8ff] to-[#a855f7] text-white font-semibold text-sm shadow-lg hover:shadow-[#6ea8ff]/25 transition-all"
            >
              <Upload size={16} className="inline mr-2" /> Upload Dataset
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Datasets Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-12 text-center">
          <Database size={40} className="mx-auto mb-4 text-slate-600" />
          <h3 className="text-lg font-semibold text-white mb-2">No datasets found</h3>
          <p className="text-sm text-slate-400 mb-4">
            {searchQuery ? "Try adjusting your search" : "Upload your first dataset to get started"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6ea8ff] text-white font-semibold text-sm"
            >
              <Upload size={16} /> Upload Dataset
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d, i) => (
            <motion.div
              key={d.id}
              initial={rowInit}
              animate={rowShow}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className={`group rounded-xl bg-[#0b1226] border p-4 transition-all cursor-pointer ${
                active?.id === d.id ? "border-[#6ea8ff] shadow-lg shadow-[#6ea8ff]/10" : "border-[#1d2742] hover:border-[#2a3760]"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <button onClick={() => onOpen(d)} className="flex items-start gap-3 flex-1 min-w-0 text-left">
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[#6ea8ff]/10 transition-colors">
                    {formatIcon(d.format)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white group-hover:text-[#6ea8ff] transition-colors truncate">{d.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{timeAgo(d.createdAt)}</p>
                  </div>
                </button>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onDownload(d)}
                    className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(d.id)}
                    className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3">
                <span className="px-2 py-0.5 rounded bg-white/5 uppercase font-medium">{d.format}</span>
                <span>{d.rows} rows</span>
                <span>{(d.size / 1024).toFixed(1)} KB</span>
              </div>

              {/* Tags */}
              {d.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {d.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#10172c] text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Expanded Preview */}
              <AnimatePresence>
                {active?.id === d.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-[#1d2742]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Preview</span>
                        <button
                          onClick={() => onDownload(d)}
                          className="text-[11px] text-[#6ea8ff] hover:text-white flex items-center gap-1"
                        >
                          <Download size={12} /> Download Full
                        </button>
                      </div>
                      <pre className="text-[11px] text-slate-300 bg-[#05070e] border border-[#1d2742] rounded-lg p-3 overflow-x-auto max-h-[200px] font-mono">
                        {activeContent || d.preview}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
          <span>{filtered.length} datasets</span>
          <span>•</span>
          <span>{filtered.reduce((acc, d) => acc + d.rows, 0).toLocaleString()} total rows</span>
          <span>•</span>
          <span>{(filtered.reduce((acc, d) => acc + d.size, 0) / 1024).toFixed(0)} KB total</span>
        </div>
      )}
    </div>
  );
}
