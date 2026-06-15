"use client";
import { useEffect, useState } from "react";
import { api, ApiError, timeAgo } from "@/lib/client/api";

interface Hook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
  lastStatus?: number;
  lastDeliveryAt?: string;
  failures?: number;
  createdAt: string;
}

const EVENT_TYPES = [
  "*",
  "project.create", "project.update", "project.delete",
  "run.create", "run.delete",
  "note.create", "note.update", "note.delete",
  "comment.create",
  "dataset.create", "dataset.delete",
  "token.create", "token.delete",
  "webhook.test",
];

export default function WebhooksPage() {
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["*"]);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  const refresh = async () => {
    const r = await api<{ webhooks: Hook[] }>("/api/webhooks");
    setHooks(r.webhooks);
  };
  useEffect(() => {
    refresh();
  }, []);

  const toggleEvent = (ev: string) => {
    setEvents((prev) => {
      if (ev === "*") return ["*"];
      const without = prev.filter((e) => e !== "*");
      if (without.includes(ev)) return without.filter((e) => e !== ev);
      return [...without, ev];
    });
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api("/api/webhooks", {
        method: "POST",
        body: JSON.stringify({ name: name || "Webhook", url, events }),
      });
      setName("");
      setUrl("");
      setEvents(["*"]);
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "failed");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this webhook?")) return;
    await api(`/api/webhooks?id=${id}`, { method: "DELETE" });
    refresh();
  };

  const onTest = async (id: string) => {
    setTesting(id);
    try {
      await api(`/api/webhooks/${id}/test`, { method: "POST" });
      setTimeout(refresh, 600);
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Workspace</div>
        <h1 className="text-2xl font-semibold text-white mt-1">Webhooks</h1>
        <p className="text-sm text-slate-400">Receive HTTP POSTs when workspace events happen. Each delivery is signed with HMAC SHA-256 using your webhook secret.</p>
      </div>

      <form onSubmit={onCreate} className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Slack relay" className="mt-1 w-full px-3 py-1.5 rounded-md bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]"/>
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">URL</span>
            <input required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://hooks.example.com/cortex" className="mt-1 w-full px-3 py-1.5 rounded-md bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff] font-mono"/>
          </label>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-1">Events</div>
          <div className="flex flex-wrap gap-1">
            {EVENT_TYPES.map((ev) => {
              const selected = events.includes(ev);
              return (
                <button key={ev} type="button" onClick={() => toggleEvent(ev)} className={`text-[10px] px-2 py-1 rounded font-mono ${selected ? "bg-[#6ea8ff] text-[#05070e]" : "bg-[#10172c] text-slate-300 hover:bg-[#1d2742]"}`}>{ev}</button>
              );
            })}
          </div>
        </div>
        {error ? <div className="text-xs text-[#ff5d73]">{error}</div> : null}
        <div className="flex justify-end">
          <button type="submit" className="text-xs px-3 py-1.5 rounded-md bg-[#6ea8ff] text-[#05070e] font-semibold">Create webhook</button>
        </div>
      </form>

      <div className="space-y-2">
        {hooks.length === 0 ? <div className="text-xs text-slate-500">No webhooks yet.</div> : null}
        {hooks.map((h) => {
          const ok = (h.lastStatus || 0) >= 200 && (h.lastStatus || 0) < 300;
          const dotStyle: React.CSSProperties = { background: h.lastStatus == null ? "#475569" : ok ? "#36d399" : "#ff5d73" };
          return (
            <div key={h.id} className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm text-white truncate">{h.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">{h.url}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="inline-block w-2 h-2 rounded-full" style={dotStyle} title={"status " + (h.lastStatus ?? "never")}/>
                  <span className="text-[11px] text-slate-500">{h.lastDeliveryAt ? timeAgo(h.lastDeliveryAt) : "never"}</span>
                  <button onClick={() => onTest(h.id)} disabled={testing === h.id} className="text-[11px] px-2 py-1 rounded-md border border-[#1d2742] text-slate-200 disabled:opacity-60">{testing === h.id ? "Sending\u2026" : "Send test"}</button>
                  <button onClick={() => onDelete(h.id)} className="text-[11px] px-2 py-1 rounded-md border border-[#3a1d2a] text-[#ff5d73]">Delete</button>
                </div>
              </div>
              <div className="mt-2 grid sm:grid-cols-3 gap-2 text-[11px]">
                <div><span className="text-slate-500">Secret:</span> <span className="font-mono text-slate-300">{h.secret}</span></div>
                <div><span className="text-slate-500">Events:</span> <span className="font-mono text-slate-300">{h.events.join(", ")}</span></div>
                <div><span className="text-slate-500">Failures:</span> <span className="text-slate-300">{h.failures || 0}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
