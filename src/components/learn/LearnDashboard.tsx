"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Trophy, CheckCircle2, RotateCcw, ArrowRight } from "lucide-react";
import { useLearnStore } from "@/store/useLearnStore";
import { GUIDES } from "@/content/guides";
import { TOTAL_XP } from "@/content/modules";
import { fadeUp } from "@/lib/motion";
import ProgressRing from "./ProgressRing";

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function LearnDashboard() {
  const store = useLearnStore();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready) {
    return (
      <div className="h-28 animate-pulse rounded-2xl border border-edge bg-panel/40" />
    );
  }

  const done = store.completedCount();
  const total = GUIDES.length;
  const pct = total > 0 ? done / total : 0;
  const xpPct = TOTAL_XP > 0 ? store.xp / TOTAL_XP : 0;
  const notifications = store.notifications.slice(0, 4);
  const lastGuide = GUIDES.find((g) => g.slug === store.lastVisited);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="grid gap-5 lg:grid-cols-3"
    >
      <div className="rounded-2xl border border-edge bg-panel/60 p-5 lg:col-span-2">
        <div className="flex items-center gap-5">
          <ProgressRing value={pct} size={72} stroke={7} />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">Your progress</h3>
            <p className="text-sm text-slate-400">
              {done} of {total} modules complete
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Trophy size={15} className="text-warn" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-edge">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-warn to-good transition-all duration-500"
                  style={progressWidth(xpPct)}
                />
              </div>
              <span className="text-xs font-semibold text-slate-300">
                {store.xp} / {TOTAL_XP} XP
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {lastGuide ? (
            <Link
              href={`/learn/${lastGuide.slug}`}
              className="btn-primary inline-flex items-center gap-1.5"
            >
              Resume: {lastGuide.title}
              <ArrowRight size={14} />
            </Link>
          ) : (
            <Link href="/learn/getting-started" className="btn-primary">
              Start learning
            </Link>
          )}
          <Link href="/learn/map" className="btn-ghost">
            View mind map
          </Link>
          {done > 0 ? (
            <button
              onClick={() => store.resetProgress()}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-exc"
            >
              <RotateCcw size={13} /> Reset progress
            </button>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-edge bg-panel/60 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-white">
            <Bell size={16} className="text-brand" /> Notifications
          </div>
          {store.notifications.length > 0 ? (
            <button
              onClick={() => store.clearNotifications()}
              className="text-xs text-slate-500 hover:text-white"
            >
              Clear
            </button>
          ) : null}
        </div>
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500">
            Complete a module or save notes - your activity shows up here.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-start gap-2">
                <CheckCircle2
                  size={15}
                  className={
                    n.kind === "reward" ? "mt-0.5 text-warn" : "mt-0.5 text-good"
                  }
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200">{n.title}</p>
                  <p className="truncate text-xs text-slate-500">
                    {n.body} - {timeAgo(n.ts)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

function progressWidth(pct: number) {
  return { width: `${Math.round(Math.max(0, Math.min(1, pct)) * 100)}%` };
}
