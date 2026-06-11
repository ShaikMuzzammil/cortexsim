"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { activitiesByGroup, STUDIO_STATS } from "@/lib/studio/registry";
import type { Activity, SectionStatus } from "@/lib/studio/types";

const STATUS_DOT: Record<SectionStatus, string> = {
  live: "bg-good",
  beta: "bg-warn",
  roadmap: "bg-edge",
};

function StatusDot({ status }: { status: SectionStatus }) {
  const cls = "inline-block h-1.5 w-1.5 rounded-full " + (STATUS_DOT[status] || "bg-edge");
  return <span className={cls} />;
}

export default function StudioSidebar({
  activeSlug,
  onSelect,
  searchRef,
}: {
  activeSlug: string;
  onSelect: (slug: string) => void;
  searchRef?: (el: HTMLInputElement | null) => void;
}) {
  const [q, setQ] = useState("");
  const groups = useMemo(() => activitiesByGroup(), []);
  const query = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!query) return groups;
    return groups
      .map((g) => ({
        group: g.group,
        items: g.items.filter(
          (a) =>
            a.title.toLowerCase().includes(query) ||
            a.what.toLowerCase().includes(query) ||
            a.group.toLowerCase().includes(query),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  return (
    <aside className="flex h-full w-full flex-col gap-3 overflow-hidden">
      <div className="px-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Studio workspace
          </span>
          <span className="chip text-[10px]">{STUDIO_STATS.total} sections</span>
        </div>
        <div className="mt-1 flex gap-2 text-[10px] text-slate-500">
          <span className="text-good">{STUDIO_STATS.live} live</span>
          <span className="text-warn">{STUDIO_STATS.beta} beta</span>
          <span>{STUDIO_STATS.roadmap} roadmap</span>
        </div>
      </div>

      <input
        ref={searchRef}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search 35 activities  ( / )"
        className="w-full rounded-lg border border-edge bg-panel2 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-brand"
      />

      <nav className="scrollbar-thin flex-1 space-y-4 overflow-y-auto pr-1">
        <button
          onClick={() => onSelect("simulator")}
          className={
            "studio-hot flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition " +
            (activeSlug === "simulator"
              ? "border-brand bg-brand/10 text-white"
              : "border-edge bg-panel2/60 text-slate-300 hover:border-brand/60")
          }
        >
          <span className="text-base" aria-hidden="true">⚡</span>
          <span className="font-medium">Live network simulator</span>
        </button>

        {filtered.map((g) => (
          <div key={g.group} className="space-y-1">
            <div className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {g.group}
            </div>
            {g.items.map((a) => (
              <SidebarItem
                key={a.slug}
                activity={a}
                active={a.slug === activeSlug}
                onSelect={onSelect}
              />
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-2 py-6 text-center text-xs text-slate-500">
            No activity matches that search.
          </div>
        )}
      </nav>
    </aside>
  );
}

function SidebarItem({
  activity,
  active,
  onSelect,
}: {
  activity: Activity;
  active: boolean;
  onSelect: (slug: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(activity.slug)}
      className={
        "studio-hot relative flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[13px] transition " +
        (active ? "text-white" : "text-slate-300 hover:text-white")
      }
    >
      {active && (
        <motion.span
          layoutId="studio-active"
          className="absolute inset-0 -z-10 rounded-lg border border-brand bg-brand/10"
          transition={activePillTransition}
        />
      )}
      <span className="w-6 shrink-0 text-[10px] tabular-nums text-slate-500">
        {String(activity.id).padStart(2, "0")}
      </span>
      <span className="flex-1 truncate">{activity.title}</span>
      <StatusDot status={activity.status} />
    </button>
  );
}

const activePillTransition = { type: "spring", stiffness: 500, damping: 36 };
