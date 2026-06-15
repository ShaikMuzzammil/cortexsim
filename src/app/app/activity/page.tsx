"use client";
import { useEffect, useState } from "react";
import { api, timeAgo } from "@/lib/client/api";

interface AuditRow {
  id: string;
  userId: string;
  action: string;
  target: string;
  targetId?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

const ACTION_COLOR: Record<string, string> = {
  "auth.login": "#36d399",
  "auth.signup": "#36d399",
  "auth.logout": "#fbbd23",
  "project.create": "#6ea8ff",
  "project.update": "#5db1ff",
  "project.delete": "#ff5d73",
  "run.create": "#6ea8ff",
  "run.delete": "#ff5d73",
  "note.create": "#6ea8ff",
  "note.delete": "#ff5d73",
  "note.update": "#5db1ff",
  "comment.create": "#6ea8ff",
  "dataset.create": "#36d399",
  "dataset.delete": "#ff5d73",
  "token.create": "#fbbd23",
  "token.delete": "#ff5d73",
  "account.export": "#5db1ff",
};

export default function ActivityPage() {
  const [events, setEvents] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(0);

  const refresh = async () => {
    setLoading(true);
    const r = await api<{ events: AuditRow[] }>("/api/audit?limit=200");
    setEvents(r.events);
    setLoading(false);
  };
  useEffect(() => {
    refresh();
  }, []);

  // Refresh on each live event.
  useEffect(() => {
    const es = new EventSource("/api/events");
    es.onmessage = (m) => {
      try {
        const ev = JSON.parse(m.data);
        if (ev.type === "audit") {
          setLive((c) => c + 1);
          refresh();
        }
      } catch {}
    };
    return () => es.close();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Workspace</div>
          <h1 className="text-2xl font-semibold text-white mt-1">Activity log</h1>
          <p className="text-sm text-slate-400">{`Every meaningful action across your workspace. ${live} live updates received.`}</p>
        </div>
      </div>

      <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] overflow-hidden">
        {loading ? (
          <div className="p-4 text-xs text-slate-500">{"Loading\u2026"}</div>
        ) : events.length === 0 ? (
          <div className="p-4 text-xs text-slate-500">No activity recorded yet.</div>
        ) : (
          <ul className="divide-y divide-[#1d2742]">
            {events.map((e) => {
              const dotStyle: React.CSSProperties = { background: ACTION_COLOR[e.action] || "#6ea8ff" };
              return (
                <li key={e.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="inline-block w-2 h-2 rounded-full shrink-0" style={dotStyle}/>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-200">
                      <span className="text-white font-mono">{e.action}</span>
                      <span className="text-slate-500">{" \u00b7 " + e.target}{e.targetId ? " #" + e.targetId.slice(-6) : ""}</span>
                    </div>
                    {e.meta ? <div className="text-[11px] text-slate-500 truncate">{JSON.stringify(e.meta)}</div> : null}
                  </div>
                  <div className="text-[11px] text-slate-500 shrink-0">{timeAgo(e.createdAt)}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
