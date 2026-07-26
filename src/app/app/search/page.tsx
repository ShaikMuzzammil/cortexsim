"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api, timeAgo } from "@/lib/client/api";

interface Row {
  type: string;
  id: string;
  title: string;
  snippet: string;
  href: string;
  at: string;
}

export default function SearchPage() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params?.get("q") || "";
  const [q, setQ] = useState(initial);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const run = async (query: string) => {
    if (!query.trim()) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const r = await api<{ results: Row[] }>(`/api/search?q=${encodeURIComponent(query)}`);
      setRows(r.results);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initial) run(initial);
  }, [initial]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.replace(`/app/search?q=${encodeURIComponent(q)}`);
    run(q);
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Workspace</div>
        <h1 className="text-2xl font-semibold text-white mt-1">Search</h1>
        <p className="text-sm text-slate-400">Searches projects, runs, notes, datasets, and comments you own.</p>
      </div>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search anything\u2026" className="flex-1 px-3 py-2 rounded-md bg-[#0b1226] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]"/>
        <button type="submit" className="text-xs px-3 py-2 rounded-md bg-[#6ea8ff] text-[#05070e] font-semibold">Search</button>
      </form>
      {loading ? <div className="text-xs text-slate-500">{"Searching\u2026"}</div> : null}
      {!loading && q && rows.length === 0 ? <div className="text-xs text-slate-500">No results for \u201C{q}\u201D.</div> : null}
      <ul className="divide-y divide-[#1d2742] rounded-xl bg-[#0b1226] border border-[#1d2742] overflow-hidden">
        {rows.map((r, i) => (
          <li key={r.type + "-" + r.id + "-" + i}>
            <Link href={r.href} className="flex items-start gap-3 px-4 py-3 hover:bg-[#10172c]">
              <span className="text-[10px] uppercase tracking-wide text-[#6ea8ff] w-[64px] shrink-0 mt-0.5">{r.type}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{r.title}</div>
                {r.snippet ? <div className="text-[11px] text-slate-500 line-clamp-2">{r.snippet}</div> : null}
              </div>
              <div className="text-[11px] text-slate-500 shrink-0">{timeAgo(r.at)}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
