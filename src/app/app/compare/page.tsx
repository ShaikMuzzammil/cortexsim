"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, downloadBlob } from "@/lib/client/api";

interface CompareRun {
  id: string;
  label: string;
  totalSpikes: number;
  meanRate: number;
  durationMs: number;
  readouts: Array<{ label: string; value: string }>;
  createdAt: string;
  projectId: string;
}
interface CompareResp { runs: CompareRun[]; diff: Array<{ key: string; values: unknown[] }>; }
interface RunOption { id: string; label: string; createdAt: string; }

function equal(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function ComparePage() {
  const search = useSearchParams();
  const initial = (search?.get("ids") || "").split(",").filter(Boolean);
  const [ids, setIds] = useState<string[]>(initial);
  const [picker, setPicker] = useState<RunOption[]>([]);
  const [data, setData] = useState<CompareResp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState("");

  useEffect(() => {
    // Quick picker: pull a flat list of all recent runs via /api/projects -> /api/projects/:id/runs.
    (async () => {
      try {
        const r = await api<{ projects: Array<{ id: string }> }>("/api/projects");
        const all: RunOption[] = [];
        for (const p of r.projects.slice(0, 20)) {
          const rr = await api<{ runs: RunOption[] }>(`/api/projects/${p.id}/runs`);
          for (const rec of rr.runs.slice(0, 12)) all.push(rec);
        }
        all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setPicker(all.slice(0, 60));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (ids.length < 2) {
      setData(null);
      return;
    }
    api<CompareResp>(`/api/runs/compare?ids=${ids.join(",")}`)
      .then(setData)
      .catch((e) => setErr(e?.message || "failed"));
  }, [ids.join(",")]);

  const addId = (id: string) => {
    if (!id || ids.includes(id) || ids.length >= 4) return;
    setIds([...ids, id]);
    setPendingId("");
  };
  const removeId = (id: string) => setIds(ids.filter((x) => x !== id));

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Analysis</div>
        <h1 className="text-2xl font-semibold text-white mt-1">Compare runs</h1>
        <p className="text-sm text-slate-400">Pick 2 to 4 runs to see metrics and config differences side by side.</p>
      </div>

      <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-3">
        <div className="flex flex-wrap items-center gap-2">
          {ids.map((id) => (
            <span key={id} className="text-[11px] px-2 py-1 rounded bg-[#10172c] text-slate-200 font-mono">
              {id.slice(-8)}
              <button onClick={() => removeId(id)} className="ml-2 text-slate-500 hover:text-[#ff5d73]">{"\u00d7"}</button>
            </span>
          ))}
          <select value={pendingId} onChange={(e) => addId(e.target.value)} className="px-2 py-1 rounded-md bg-[#05070e] border border-[#1d2742] text-[11px] text-white outline-none">
            <option value="">+ Add a run</option>
            {picker.filter((p) => !ids.includes(p.id)).map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          {data ? (
            <button onClick={() => downloadBlob("compare.json", JSON.stringify(data, null, 2), "application/json")} className="text-[11px] px-2 py-1 rounded-md border border-[#1d2742] text-slate-300 ml-auto">Export JSON</button>
          ) : null}
        </div>
      </div>

      {err ? <div className="text-xs text-[#ff5d73]">{err}</div> : null}
      {!data ? (
        <div className="text-xs text-slate-500">Add at least two runs above.</div>
      ) : (
        <>
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${data.runs.length}, minmax(0, 1fr))` }}>
            {data.runs.map((r) => (
              <div key={r.id} className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-3">
                <div className="text-sm font-semibold text-white truncate">{r.label}</div>
                <div className="text-[11px] text-slate-500 font-mono">{r.id.slice(-12)}</div>
                <div className="mt-2 text-[11px] grid grid-cols-2 gap-y-1">
                  <span className="text-slate-500">Spikes</span><span className="text-slate-200 text-right">{r.totalSpikes.toLocaleString()}</span>
                  <span className="text-slate-500">Mean rate</span><span className="text-slate-200 text-right">{r.meanRate.toFixed(1)} Hz</span>
                  <span className="text-slate-500">Duration</span><span className="text-slate-200 text-right">{r.durationMs} ms</span>
                </div>
                <div className="mt-2 border-t border-[#1d2742] pt-2 text-[11px] space-y-1">
                  {r.readouts.map((ro, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-slate-500">{ro.label}</span>
                      <span className="text-slate-200">{ro.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase tracking-wide text-slate-500">
                <tr><th className="text-left p-2">Config field</th>{data.runs.map((r) => <th key={r.id} className="text-left p-2">{r.label}</th>)}</tr>
              </thead>
              <tbody>
                {data.diff.map((row) => {
                  const first = row.values[0];
                  const allEqual = row.values.every((v) => equal(v, first));
                  return (
                    <tr key={row.key} className={`border-t border-[#1d2742] ${allEqual ? "" : "bg-[#1a0d12]/30"}`}>
                      <td className="p-2 font-mono text-slate-400">{row.key}</td>
                      {row.values.map((v, i) => (
                        <td key={i} className="p-2 font-mono text-slate-200">{JSON.stringify(v)}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
