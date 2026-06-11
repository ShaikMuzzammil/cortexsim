"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import StudioSidebar from "./StudioSidebar";
import ActivityRunner from "./ActivityRunner";
import { STUDIO_ACTIVITIES, activityBySlug, STUDIO_STATS } from "@/lib/studio/registry";

const FIRST = STUDIO_ACTIVITIES[0]?.slug || "";

export default function StudioWorkspace() {
  const [active, setActive] = useState<string>(FIRST);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchEl = useRef<HTMLInputElement | null>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);

  // Deep link support: /simulator?s=<slug> (used by the mind map).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const slug = new URLSearchParams(window.location.search).get("s");
    if (slug && activityBySlug(slug)) setActive(slug);
  }, []);

  // Keyboard navigation: up/down move through the activity list, "/" focuses search.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select";
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchEl.current?.focus();
        return;
      }
      if (typing) return;
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const order = STUDIO_ACTIVITIES.map((a) => a.slug);
      const idx = order.indexOf(active);
      const next =
        e.key === "ArrowDown"
          ? order[Math.min(order.length - 1, idx + 1)]
          : order[Math.max(0, idx - 1)];
      setActive(next);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active]);

  const activity = activityBySlug(active);

  function select(slug: string) {
    setActive(slug);
    setSidebarOpen(false);
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex h-screen flex-col bg-ink text-white">
      {/* Top bar with Home button */}
      <header className="flex shrink-0 items-center justify-between border-b border-edge bg-panel/80 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="studio-hot inline-flex items-center gap-1.5 rounded-lg border border-edge bg-panel2 px-3 py-1.5 text-sm text-slate-200 hover:border-brand"
          >
            <span aria-hidden>{"\u2302"}</span> Home
          </Link>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-sm font-semibold text-white">CortexSim Studio</span>
            <span className="chip text-[10px]">{STUDIO_STATS.total} activities</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-4 text-sm text-slate-400 md:flex">
            <Link href="/learn/map" className="hover:text-white">Mind map</Link>
            <Link href="/learn" className="hover:text-white">Learn</Link>
            <Link href="/platform" className="hover:text-white">Platform</Link>
          </nav>
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="studio-hot rounded-lg border border-edge bg-panel2 px-3 py-1.5 text-sm text-slate-200 lg:hidden"
          >
            {sidebarOpen ? "Close" : "Activities"}
          </button>
        </div>
      </header>

      {/* Body: independent scroll regions. Only the sidebar (and the main panel)
          scroll \u2014 the page itself does not. */}
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
    </div>
  );
}
