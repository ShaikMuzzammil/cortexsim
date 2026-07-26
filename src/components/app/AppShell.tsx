"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./AuthProvider";
import { api, downloadBlob } from "@/lib/client/api";

const NAV = [
  { href: "/app", label: "Dashboard", icon: "📊" },
  { href: "/simulator", label: "Neural Studio", icon: "🧠" },
  { href: "/app/projects", label: "Projects", icon: "📁" },
  { href: "/app/datasets", label: "Datasets", icon: "📈" },
  { href: "/app/exports", label: "Export Center", icon: "📤" },
  { href: "/app/insights", label: "Insights", icon: "💡" },
  { href: "/app/compare", label: "Compare Runs", icon: "⚖️" },
  { href: "/app/search", label: "Search", icon: "🔍" },
  { href: "/app/activity", label: "Activity", icon: "📋" },
  { href: "/learn", label: "Learn", icon: "📚" },
  { href: "/docs", label: "Documentation", icon: "📖" },
  { href: "/platform", label: "Platform", icon: "🚀" },
  { href: "/app/settings", label: "Settings", icon: "⚙️" },
];

interface Toast {
  id: number;
  text: string;
  type?: "success" | "info" | "warning" | "error";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [results, setResults] = useState<Array<{ type: string; title: string; href: string; snippet: string }>>([]);

  // Add toast notification
  const addToast = (text: string, type: Toast["type"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((cur) => [...cur, { id, text, type }]);
    setTimeout(() => setToasts((cur) => cur.filter((t) => t.id !== id)), 4000);
  };

  // Keyboard shortcut: Cmd/Ctrl+K for search
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

  // Live search with debounce
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
    if (user.isGuest) return "G";
    const parts = user.name.split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || user.email[0].toUpperCase();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070e] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-[#6ea8ff] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-slate-400 text-sm">Loading CortexSim Studio...</p>
        </div>
      </div>
    );
  }

  // Show app shell even without user (guest mode)
  const displayUser = user || { name: "Guest", email: "guest@cortexsim.local", isGuest: true };

  return (
    <div className="min-h-screen bg-[#05070e] text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-[260px] shrink-0 flex-col border-r border-[#1d2742] bg-[#070b18] sticky top-0 h-screen">
        {/* Logo & Brand */}
        <div className="px-5 pt-5 pb-4 border-b border-[#1d2742]">
          <Link href="/" className="group flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6ea8ff] to-[#a855f7] flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-[#6ea8ff]/20">
              🧠
            </div>
            <div>
              <span className="text-[17px] font-bold tracking-tight text-white group-hover:text-[#6ea8ff] transition-colors">CortexSim</span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-[#6ea8ff] font-semibold">Studio v6.0</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 px-3 mb-3 font-semibold">Main Navigation</div>
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== "/app" && pathname?.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                  active 
                    ? "bg-gradient-to-r from-[#6ea8ff]/20 to-[#a855f7]/10 text-white border border-[#6ea8ff]/30 shadow-lg shadow-[#6ea8ff]/5" 
                    : "text-slate-400 hover:bg-[#0b1226] hover:text-white hover:border hover:border-[#1d2742]"
                }`}
              >
                <span className="text-base w-6 text-center">{n.icon}</span>
                <span className={`font-medium ${active ? "text-white" : ""}`}>{n.label}</span>
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6ea8ff]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="px-4 py-4 border-t border-[#1d2742] space-y-3">
          {/* Quick Actions */}
          <div className="space-y-2">
            <button 
              onClick={() => setPaletteOpen(true)} 
              className="w-full text-left text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg bg-[#0b1226] border border-[#1d2742] hover:border-[#2a3760] flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-2">
                <span>🔍</span> Quick Search
              </span>
              <kbd className="text-[10px] text-slate-500 bg-[#05070e] px-1.5 py-0.5 rounded">⌘K</kbd>
            </button>
            
            <Link 
              href="/simulator"
              className="w-full text-left text-xs text-white px-3 py-2 rounded-lg bg-gradient-to-r from-[#6ea8ff] to-[#a855f7] flex items-center justify-between font-semibold hover:shadow-lg hover:shadow-[#6ea8ff]/20 transition-all"
            >
              <span className="flex items-center gap-2">
                <span>🚀</span> Launch Studio
              </span>
              <span>→</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-[#0b1226]">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
              displayUser.isGuest 
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white" 
                : "bg-[#6ea8ff] text-[#05070e]"
            }`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white truncate font-medium">{displayUser.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{displayUser.email}</div>
            </div>
            {displayUser.isGuest && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">GUEST</span>
            )}
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 px-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
              System Online
            </span>
            <span>v6.0.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#05070e]/90 border-b border-[#1d2742]">
          <div className="flex items-center gap-4 px-4 sm:px-6 py-3">
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-slate-300 hover:text-white p-2 rounded-lg hover:bg-[#0b1226]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb / Current Page */}
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-slate-500 hover:text-white transition-colors">Home</Link>
              <span className="text-slate-600">/</span>
              <span className="text-slate-300 truncate max-w-[200px] sm:max-w-none">
                {pathname.split("/").filter(Boolean).map((p, i, arr) => (
                  <span key={p} className="capitalize">{i === arr.length - 1 ? p : p + " /"}</span>
                ))}
              </span>
            </div>

            <div className="flex-1"/>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPaletteOpen(true)} 
                className="hidden sm:flex items-center gap-2 text-xs text-slate-300 px-3 py-1.5 rounded-lg bg-[#0b1226] border border-[#1d2742] hover:border-[#2a3760] hover:text-white transition-all"
              >
                <span>Search...</span>
                <kbd className="text-[10px] text-slate-500 bg-[#05070e] px-1.5 py-0.5 rounded">⌘K</kbd>
              </button>
              
              <Link 
                href="/simulator" 
                className="hidden sm:flex items-center gap-1.5 text-xs text-[#6ea8ff] hover:text-white px-3 py-1.5 rounded-lg border border-[#6ea8ff]/30 hover:bg-[#6ea8ff]/10 transition-all font-medium"
              >
                <span>🧠</span> Studio →
              </Link>

              {/* Mobile User Avatar */}
              <div className="md:hidden w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold flex items-center justify-center">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 px-4 sm:px-6 py-6 overflow-auto">
          {children}
        </div>
      </main>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#070b18] border-r border-[#1d2742] overflow-y-auto"
            >
              <div className="p-5 border-b border-[#1d2742]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6ea8ff] to-[#a855f7] flex items-center justify-center text-lg">
                    🧠
                  </div>
                  <div>
                    <span className="font-bold text-white">CortexSim</span>
                    <span className="block text-[10px] text-[#6ea8ff]">STUDIO</span>
                  </div>
                </div>
              </div>
              <nav className="p-3 space-y-1">
                {NAV.map((n) => {
                  const active = pathname === n.href || (n.href !== "/app" && pathname?.startsWith(n.href));
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all ${
                        active ? "bg-[#6ea8ff]/20 text-white" : "text-slate-400 hover:bg-[#0b1226] hover:text-white"
                      }`}
                    >
                      <span className="text-base w-6 text-center">{n.icon}</span>
                      <span>{n.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-[380px]">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={toastInit}
              animate={toastShow}
              exit={toastInit}
              className={`px-4 py-3 rounded-xl border shadow-2xl pointer-events-auto flex items-start gap-3 ${
                t.type === "success" ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-200" :
                t.type === "error" ? "bg-red-950/90 border-red-500/30 text-red-200" :
                t.type === "warning" ? "bg-amber-950/90 border-amber-500/30 text-amber-200" :
                "bg-[#0b1226] border-[#1d2742] text-slate-200"
              }`}
            >
              <span className="text-base mt-0.5">
                {t.type === "success" ? "✅" : t.type === "error" ? "❌" : t.type === "warning" ? "⚠️" : "ℹ️"}
              </span>
              <span className="text-sm flex-1">{t.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Command Palette (Search) */}
      <AnimatePresence>
        {paletteOpen ? (
          <motion.div
            key="palette-bg"
            initial={paletteInit}
            animate={paletteShow}
            exit={paletteInit}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[16vh] px-4"
            onClick={() => setPaletteOpen(false)}
          >
            <motion.div
              initial={panelInit}
              animate={panelShow}
              exit={panelInit}
              className="w-full max-w-[680px] rounded-2xl bg-[#0b1226] border border-[#1d2742] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1d2742]">
                <span className="text-slate-400">🔍</span>
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.targetvalue)}
                  placeholder="Search projects, simulations, datasets, documentation..."
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
                <kbd className="text-[10px] text-slate-500 bg-[#05070e] px-2 py-1 rounded">ESC</kbd>
              </div>
              
              {/* Search Results */}
              <div className="max-h-[55vh] overflow-y-auto">
                {results.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <div className="text-4xl mb-3">🔬</div>
                    <div className="text-sm text-slate-400">
                      {query ? `No results for "${query}"` : "Type to search across CortexSim Studio"}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-2">Try searching for projects, runs, or documentation</div>
                  </div>
                ) : (
                  results.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setPaletteOpen(false);
                        router.push(r.href);
                      }}
                      className="w-full text-left px-5 py-3.5 hover:bg-[#10172c] flex items-start gap-4 border-b border-[#0f1530] transition-colors"
                    >
                      <span className="text-[10px] uppercase tracking-wide text-[#6ea8ff] w-[65px] shrink-0 mt-0.5 font-semibold">{r.type}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm text-white truncate font-medium">{r.title}</span>
                        {r.snippet ? <span className="block text-[11px] text-slate-500 truncate mt-0.5">{r.snippet}</span> : null}
                      </span>
                      <span className="text-slate-600 text-xs">→</span>
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 text-[10px] text-slate-500 border-t border-[#1d2742] flex items-center justify-between bg-[#070b18]">
                <span className="flex items-center gap-4">
                  <span>⌘K to open</span>
                  <span>↑↓ to navigate</span>
                  <span>↵ to select</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                  Ready
                </span>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
