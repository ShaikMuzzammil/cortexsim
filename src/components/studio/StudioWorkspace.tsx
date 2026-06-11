"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import StudioSidebar from "./StudioSidebar";
import ActivityRunner from "./ActivityRunner";
import EngineProvider, { useEngine } from "./EngineProvider";
import EngineBar from "./EngineBar";
import StatusBar from "./StatusBar";
import CommandPalette, { type Command } from "./CommandPalette";
import { STUDIO_ACTIVITIES, activityBySlug, STUDIO_STATS } from "@/lib/studio/registry";
import { activeView } from "@/lib/studio/activeViewBus";
import {
  downloadCanvasPng,
  downloadJson,
  loadAllSessions,
  saveSession,
  deleteSession,
  type StudioSession,
} from "@/lib/studio/sessions";

const FIRST = STUDIO_ACTIVITIES[0]?.slug || "";

export default function StudioWorkspace() {
  return (
    <EngineProvider>
      <WorkspaceInner />
    </EngineProvider>
  );
}

function WorkspaceInner() {
  const { snapshot, toggleRunning, resetEngine, stepOnce, injectPulse, updateConfig, config } = useEngine();
  const [active, setActive] = useState<string>(FIRST);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [sessions, setSessions] = useState<StudioSession[]>([]);
  const searchEl = useRef<HTMLInputElement | null>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);

  // Deep link via /simulator?s=<slug>.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const slug = new URLSearchParams(window.location.search).get("s");
    if (slug && activityBySlug(slug)) setActive(slug);
  }, []);

  // Load saved sessions on mount.
  useEffect(() => {
    setSessions(loadAllSessions());
  }, []);

  // Global keyboard shortcuts.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select";
      if (typing) return;
      // Space = play/pause, ] = step, R = reset, I = pulse, / = focus search
      if (e.key === " ") {
        e.preventDefault();
        toggleRunning();
      } else if (e.key === "]") {
        e.preventDefault();
        stepOnce();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        resetEngine();
      } else if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        injectPulse();
      } else if (e.key === "/") {
        e.preventDefault();
        searchEl.current?.focus();
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const order = STUDIO_ACTIVITIES.map((a) => a.slug);
        const idx = order.indexOf(active);
        const next =
          e.key === "ArrowDown"
            ? order[Math.min(order.length - 1, idx + 1)]
            : order[Math.max(0, idx - 1)];
        setActive(next);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, toggleRunning, stepOnce, resetEngine, injectPulse]);

  const activity = activityBySlug(active);

  function select(slug: string) {
    setActive(slug);
    setSidebarOpen(false);
    setSessionsOpen(false);
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("s", slug);
      window.history.replaceState({}, "", url.toString());
    }
  }

  function doSave() {
    const name =
      typeof window !== "undefined"
        ? window.prompt("Session name", `Session ${new Date().toLocaleString()}`)
        : null;
    if (!name) return;
    saveSession(name, active, config);
    setSessions(loadAllSessions());
  }

  function doLoad(s: StudioSession) {
    updateConfig(s.config);
    setActive(s.activeSlug);
    setSessionsOpen(false);
  }

  function doDelete(id: string) {
    deleteSession(id);
    setSessions(loadAllSessions());
  }

  function exportActiveView() {
    if (activeView.canvas) {
      downloadCanvasPng(activeView.canvas, `cortexsim-${activeView.slug}-${Date.now()}.png`);
    }
  }
  function exportActiveJson() {
    downloadJson(`cortexsim-${activeView.slug || "view"}-${Date.now()}.json`, {
      activity: { slug: activeView.slug, title: activeView.title },
      readouts: activeView.readouts,
      params: activeView.params,
      engine: snapshot,
      config,
      capturedAt: new Date().toISOString(),
    });
  }

  const commands: Command[] = useMemo(
    () => [
      { id: "cmd:play", label: snapshot.running ? "Pause simulation" : "Resume simulation", hint: "Space", group: "Engine", run: toggleRunning },
      { id: "cmd:reset", label: "Reset network", hint: "R", group: "Engine", run: resetEngine },
      { id: "cmd:step", label: "Step one dt", hint: "]", group: "Engine", run: stepOnce },
      { id: "cmd:pulse", label: "Inject current pulse", hint: "I", group: "Engine", run: injectPulse },
      { id: "cmd:save", label: "Save session", hint: "local", group: "Session", run: doSave },
      { id: "cmd:png", label: "Export view as PNG", group: "Export", run: exportActiveView },
      { id: "cmd:json", label: "Export readouts as JSON", group: "Export", run: exportActiveJson },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [snapshot.running, active],
  );

  return (
    <div className="flex h-screen flex-col bg-ink text-white">
      {/* Top header */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-edge bg-panel/80 px-3 py-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-edge bg-panel2 px-3 py-1.5 text-sm text-slate-200 hover:border-brand"
          >
            <span aria-hidden>{"\u2302"}</span> Home
          </Link>
          <span className="hidden text-sm font-semibold text-white sm:inline">CortexSim Studio</span>
          <span className="hidden text-[10px] text-slate-500 md:inline">{STUDIO_STATS.total} activities</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={doSave}
            className="rounded-md border border-edge bg-panel2 px-2.5 py-1 text-xs text-slate-200 hover:border-brand"
            title="Save current sim as a session"
          >
            Save
          </button>
          <div className="relative">
            <button
              onClick={() => setSessionsOpen((o) => !o)}
              className="rounded-md border border-edge bg-panel2 px-2.5 py-1 text-xs text-slate-200 hover:border-brand"
            >
              Sessions ({sessions.length})
            </button>
            {sessionsOpen && (
              <div className="absolute right-0 top-full z-40 mt-1 w-72 overflow-hidden rounded-md border border-edge bg-panel shadow-xl">
                {sessions.length === 0 ? (
                  <div className="p-3 text-xs text-slate-500">No saved sessions yet.</div>
                ) : (
                  <ul className="max-h-72 overflow-y-auto py-1">
                    {sessions.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between px-3 py-1.5 text-xs hover:bg-panel2"
                      >
                        <button onClick={() => doLoad(s)} className="flex-1 text-left">
                          <div className="text-slate-200">{s.name}</div>
                          <div className="text-[10px] text-slate-500">{new Date(s.createdAt).toLocaleString()}</div>
                        </button>
                        <button
                          onClick={() => doDelete(s.id)}
                          className="ml-2 rounded border border-edge px-1.5 py-0.5 text-[10px] text-slate-400 hover:border-exc hover:text-exc"
                        >
                          {"\u00d7"}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <button
            onClick={exportActiveView}
            className="rounded-md border border-edge bg-panel2 px-2.5 py-1 text-xs text-slate-200 hover:border-brand"
            title="Export current view as PNG"
          >
            PNG
          </button>
          <button
            onClick={exportActiveJson}
            className="rounded-md border border-edge bg-panel2 px-2.5 py-1 text-xs text-slate-200 hover:border-brand"
            title="Export current readouts as JSON"
          >
            JSON
          </button>
          <span className="hidden rounded-md border border-edge bg-panel2 px-2 py-1 text-[10px] text-slate-400 md:inline">
            {"\u2318 K"} to search
          </span>
          <nav className="hidden items-center gap-3 text-xs text-slate-400 lg:flex">
            <Link href="/learn/map" className="hover:text-white">Mind map</Link>
            <Link href="/learn" className="hover:text-white">Learn</Link>
          </nav>
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="rounded-md border border-edge bg-panel2 px-2.5 py-1 text-xs text-slate-200 lg:hidden"
          >
            {sidebarOpen ? "Close" : "Activities"}
          </button>
        </div>
      </header>

      {/* Engine bar (shared simulation controls that actually drive the network). */}
      <EngineBar />

      {/* Body */}
      <div className="grid min-h-0 flex-1 lg:grid-cols-[280px_1fr]">
        <div
          className={
            "min-h-0 border-r border-edge bg-panel/50 " +
            (sidebarOpen
              ? "absolute inset-x-0 top-[53px] bottom-0 z-20 overflow-y-auto p-3 lg:static"
              : "hidden overflow-y-auto p-3 lg:block")
          }
        >
          <StudioSidebar
            activeSlug={active}
            onSelect={select}
            searchRef={(el) => (searchEl.current = el)}
          />
        </div>

        <main ref={mainRef} className="min-h-0 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {activity ? (
              <ActivityRunner key={activity.slug} activity={activity} />
            ) : (
              <div key="empty" className="p-8 text-sm text-slate-500">
                Select an activity from the sidebar.
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Status bar */}
      <StatusBar activeSlug={active} />

      {/* Command palette */}
      <CommandPalette onSelect={select} commands={commands} />
    </div>
  );
}
