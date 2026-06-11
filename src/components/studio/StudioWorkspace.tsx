"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import SimulatorShell from "@/components/sim/SimulatorShell";
import StudioSidebar from "./StudioSidebar";
import ActivityRunner from "./ActivityRunner";
import { STUDIO_ACTIVITIES, activityBySlug } from "@/lib/studio/registry";

export default function StudioWorkspace() {
  const [active, setActive] = useState<string>("simulator");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchEl = useRef<HTMLInputElement | null>(null);

  // Keyboard navigation: up/down move through the activity list, "/" focuses search.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (e.key === "/" && tag !== "input" && tag !== "textarea" && tag !== "select") {
        e.preventDefault();
        searchEl.current?.focus();
        return;
      }
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const order = ["simulator", ...STUDIO_ACTIVITIES.map((a) => a.slug)];
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

  const activity = active === "simulator" ? null : activityBySlug(active);

  function select(slug: string) {
    setActive(slug);
    setSidebarOpen(false);
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-3 py-4 sm:px-5">
      <div className="mb-3 flex items-center justify-between lg:hidden">
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="studio-hot rounded-lg border border-edge bg-panel2 px-3 py-1.5 text-sm text-slate-200"
        >
          {sidebarOpen ? "Close menu" : "Browse 35 activities"}
        </button>
        <span className="text-xs text-slate-500">
          {activity ? activity.title : "Live network simulator"}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <div
          className={
            "rounded-xl border border-edge bg-panel/70 p-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] " +
            (sidebarOpen ? "block" : "hidden lg:block")
          }
        >
          <StudioSidebar
            activeSlug={active}
            onSelect={select}
            searchRef={(el) => (searchEl.current = el)}
          />
        </div>

        <main className="min-h-[70vh] rounded-xl border border-edge bg-panel/40 p-3 sm:p-5">
          <AnimatePresence mode="wait">
            {active === "simulator" ? (
              <div key="simulator">
                <SimulatorShell />
              </div>
            ) : activity ? (
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
