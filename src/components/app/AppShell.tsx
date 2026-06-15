"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./AuthProvider";
import { api } from "@/lib/client/api";

const NAV = [
  { href: "/app", label: "Dashboard", icon: "\u25A0" },
  { href: "/app/projects", label: "Projects", icon: "\u25C7" },
  { href: "/app/datasets", label: "Datasets", icon: "\u25B3" },
  { href: "/app/exports", label: "Export Center", icon: "\u2913" },
  { href: "/app/insights", label: "Insights", icon: "\u25B0" },
  { href: "/app/compare", label: "Compare", icon: "\u25C8" },
  { href: "/app/search", label: "Search", icon: "\u26AC" },
  { href: "/app/activity", label: "Activity", icon: "\u25CB" },
  { href: "/app/shares", label: "Shares", icon: "\u25C9" },
  { href: "/app/webhooks", label: "Webhooks", icon: "\u29BF" },
  { href: "/app/api-docs", label: "API", icon: "\u2329" },
  { href: "/app/changelog", label: "Changelog", icon: "\u2261" },
  { href: "/simulator", label: "Studio", icon: "\u2756" },
  { href: "/app/settings", label: "Settings", icon: "\u25A2" },
];

interface Toast {
  id: number;
  text: string;
}

const toastInit = { opacity: 0, y: 12, scale: 0.96 };
const toastShow = { opacity: 1, y: 0, scale: 1 };
const paletteInit = { opacity: 0 };
const paletteShow = { opacity: 1 };
const panelInit = { opacity: 0, y: -8, scale: 0.98 };
const panelShow = { opacity: 1, y: 0, scale: 1 };

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [liveConnected, setLiveConnected] = useState(false);
  const [results, setResults] = useState<Array<{ type: string; title: string; href: string; snippet: string }>>([]);

  // Live event stream.
  useEffect(() => {
    if (!user) return;
    const es = new EventSource("/api/events");
    es.onopen = () => setLiveConnected(true);
    es.onerror = () => setLiveConnected(false);
    es.onmessage = (m) => {
      try {
        const ev = JSON.parse(m.data);
        if (ev.type === "hello" || ev.type === "ping") return;
        const text = ev.type === "comment.create"
          ? `New comment by ${ev.authorName}`
          : ev.type === "audit"
          ? `${ev.action} \u00b7 ${ev.target}`
          : ev.type;
        const id = Date.now() + Math.random();
        setToasts((cur) => [...cur, { id, text }]);
        setTimeout(() => setToasts((cur) => cur.filter((t) => t.id !== id)), 4000);
      } catch {}
    };
    return () => es.close();
  }, [user]);

  // Keyboard shortcut: Cmd/Ctrl+K.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (e.key === "Escape" && paletteOpen) {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen]);

  // Live search.
  useEffect(() => {
    if (!paletteOpen) return;
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      api<{ results: Array<{ type: string; title: string; href: string; snippet: string }> }>(
        `/api/search?q=${encodeURIComponent(q)}`,
      )
        .then((r) => setResults(r.results || []))
        .catch(() => setResults([]));
    }, 180);
    return () => clearTimeout(t);
  }, [query, paletteOpen]);

  const initials = useMemo(() => {
    if (!user) return "?";
    const parts = user.name.split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || user.email[0].toUpperCase();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070e] flex items-center justify-center text-slate-400 text-sm">
        {"Loading\u2026"}
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-[#05070e] flex items-center justify-center text-slate-400 text-sm">
        {"Redirecting to sign in\u2026"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070e] text-slate-100 flex">
      <aside className="hidden md:flex md:w-[240px] shrink-0 flex-col border-r border-[#1d2742] bg-[#070b18] sticky top-0 h-screen">
        <div className="px-4 pt-5 pb-3">
          <Link href="/" className="text-[15px] font-semibold tracking-tight flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#6ea8ff]"/>
            CortexSim
          </Link>
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mt-1">Workspace</div>
        </div>
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== "/app" && pathname?.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition ${active ? "bg-[#10172c] text-white" : "text-slate-300 hover:bg-[#0b1226] hover:text-white"}`}
              >
                <span className="w-4 text-center text-[#6ea8ff]">{n.icon}</span>
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-3 border-t border-[#1d2742]">
          <button onClick={() => setPaletteOpen(true)} className="w-full text-left text-xs text-slate-400 hover:text-white px-2 py-1.5 rounded-md bg-[#0b1226] flex items-center justify-between">
            <span>Quick search</span>
            <kbd className="text-[10px] text-slate-500">{"\u2318K"}</kbd>
          </button>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#6ea8ff] text-[#05070e] text-xs font-semibold flex items-center justify-center">{initials}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white truncate">{user.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
            </div>
            <button onClick={logout} className="text-[10px] text-slate-400 hover:text-white" title="Sign out">
              {"\u23FB"}
            </button>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${liveConnected ? "bg-[#36d399]" : "bg-[#fbbd23]"}`}/>
            {liveConnected ? "Live" : "Connecting"}
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 backdrop-blur bg-[#05070e]/85 border-b border-[#1d2742]">
          <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
            <button className="md:hidden text-sm text-slate-300" onClick={() => router.push("/app")}>
              {"\u2261"}
            </button>
            <div className="text-sm text-slate-300 truncate">{pathname}</div>
            <div className="flex-1"/>
            <button onClick={() => setPaletteOpen(true)} className="hidden sm:flex items-center gap-2 text-xs text-slate-300 px-2.5 py-1 rounded-md bg-[#0b1226] border border-[#1d2742] hover:border-[#2a3760]">
              <span>Search</span>
              <kbd className="text-[10px] text-slate-500">{"\u2318K"}</kbd>
            </button>
            <Link href="/simulator" className="hidden sm:inline text-xs text-[#6ea8ff] hover:text-white">{"Studio \u2192"}</Link>
          </div>
        </header>
        <div className="px-4 sm:px-6 py-5">{children}</div>
      </main>

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={toastInit}
              animate={toastShow}
              exit={toastInit}
              className="px-3 py-2 rounded-lg bg-[#0b1226] border border-[#1d2742] text-xs text-slate-200 shadow-lg pointer-events-auto"
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Command palette */}
      <AnimatePresence>
        {paletteOpen ? (
          <motion.div
            key="palette-bg"
            initial={paletteInit}
            animate={paletteShow}
            exit={paletteInit}
            className="fixed inset-0 z-40 bg-black/60 flex items-start justify-center pt-[16vh] px-4"
            onClick={() => setPaletteOpen(false)}
          >
            <motion.div
              initial={panelInit}
              animate={panelShow}
              exit={panelInit}
              className="w-full max-w-[640px] rounded-xl bg-[#0b1226] border border-[#1d2742] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, runs, notes, datasets, comments\u2026"
                className="w-full px-4 py-3 bg-transparent text-sm text-white outline-none border-b border-[#1d2742]"
              />
              <div className="max-h-[60vh] overflow-y-auto">
                {results.length === 0 ? (
                  <div className="px-4 py-6 text-xs text-slate-500">{query ? "No results." : "Type to search across your workspace. Cmd+K toggles this dialog."}</div>
                ) : (
                  results.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setPaletteOpen(false);
                        router.push(r.href);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#10172c] flex items-start gap-3 border-b border-[#0f1530]"
                    >
                      <span className="text-[10px] uppercase tracking-wide text-[#6ea8ff] w-[60px] shrink-0 mt-0.5">{r.type}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm text-white truncate">{r.title}</span>
                        {r.snippet ? <span className="block text-[11px] text-slate-500 truncate">{r.snippet}</span> : null}
                      </span>
                    </button>
                  ))
                )}
              </div>
              <div className="px-3 py-2 text-[10px] text-slate-500 border-t border-[#1d2742] flex items-center justify-between">
                <span>{"Cmd+K opens \u00b7 Esc closes"}</span>
                <span>{liveConnected ? "Live connected" : "Live offline"}</span>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
