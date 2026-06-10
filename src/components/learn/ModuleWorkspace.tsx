"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Bookmark,
  Save,
  Target,
  FlaskConical,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import type { ModuleMeta } from "@/content/modules";
import { useLearnStore } from "@/store/useLearnStore";
import { useToast } from "@/store/useToast";
import { fadeUp } from "@/lib/motion";
import ProgressRing from "./ProgressRing";

export default function ModuleWorkspace({
  meta,
  title,
}: {
  meta: ModuleMeta;
  title: string;
}) {
  const slug = meta.slug;
  const store = useLearnStore();
  const show = useToast((s) => s.show);

  // Hydration guard: persisted store is client-only.
  const [ready, setReady] = useState(false);
  const [note, setNote] = useState("");
  useEffect(() => {
    setReady(true);
    setNote(store.getNote(slug));
    store.setLastVisited(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!ready) {
    return (
      <div className="rounded-2xl border border-edge bg-panel/60 p-6 text-sm text-slate-500">
        Loading your workspace...
      </div>
    );
  }

  const complete = store.isComplete(slug);
  const bookmarked = store.isBookmarked(slug);
  const checkProgress = store.checklistProgress(slug, meta.objectives.length);

  const onSaveNote = () => {
    store.setNote(slug, note);
    store.pushNotification({
      title: "Notes saved",
      body: `Your notes for \"${title}\" are stored locally.`,
      kind: "info",
    });
    show({ title: "Notes saved", body: "Stored on this device.", kind: "info" });
  };

  const onToggleComplete = () => {
    const nowComplete = store.toggleComplete(slug, meta.xp);
    if (nowComplete) {
      store.pushNotification({
        title: "Module completed",
        body: `\"${title}\" complete - +${meta.xp} XP earned.`,
        kind: "reward",
      });
      show({
        title: `+${meta.xp} XP`,
        body: `\"${title}\" marked complete.`,
        kind: "reward",
      });
    } else {
      show({ title: "Marked incomplete", kind: "info" });
    }
  };

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="rounded-2xl border border-brand/30 bg-gradient-to-b from-panel2/60 to-panel/60 p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="text-brand" size={20} />
          <div>
            <h2 className="text-lg font-bold text-white">Your workspace</h2>
            <p className="text-xs text-slate-400">
              Track objectives, jot notes, and earn XP. Saved on this device.
            </p>
          </div>
        </div>
        <ProgressRing value={checkProgress} />
      </div>

      {/* Objectives checklist */}
      <div className="mt-6">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
          <Target size={15} className="text-brand" /> What to do
        </div>
        <ul className="space-y-2">
          {meta.objectives.map((obj, i) => {
            const checked = store.isChecked(slug, i);
            return (
              <li key={i}>
                <button
                  onClick={() => store.toggleCheck(slug, i)}
                  className="flex w-full items-start gap-3 rounded-lg border border-edge bg-panel/60 px-3 py-2.5 text-left transition-colors hover:border-brand/50"
                >
                  {checked ? (
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-good" />
                  ) : (
                    <Circle size={17} className="mt-0.5 shrink-0 text-slate-500" />
                  )}
                  <span
                    className={
                      checked
                        ? "text-sm text-slate-500 line-through"
                        : "text-sm text-slate-200"
                    }
                  >
                    {obj}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Try this */}
      <div className="mt-6">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
          <FlaskConical size={15} className="text-inh" /> Try this
        </div>
        <ul className="space-y-2">
          {meta.tryThis.map((t, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-lg border border-edge/70 bg-panel/40 px-3 py-2.5 text-sm text-slate-300"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-inh" />
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* Outcomes */}
      <div className="mt-6 rounded-xl border border-good/30 bg-good/10 p-4">
        <div className="mb-2 text-sm font-semibold text-good">
          Expected outcomes
        </div>
        <ul className="space-y-1.5">
          {meta.outcomes.map((o, i) => (
            <li key={i} className="flex gap-2 text-sm leading-6 text-slate-200">
              <CheckCircle2 size={15} className="mt-1 shrink-0 text-good" />
              {o}
            </li>
          ))}
        </ul>
      </div>

      {/* Notes */}
      <div className="mt-6">
        <label className="mb-2 block text-sm font-semibold text-white">
          Your notes
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="Record what you observed, your hypotheses, the parameter values that worked..."
          className="scrollbar-thin w-full resize-y rounded-xl border border-edge bg-ink/70 p-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-brand/60"
        />
        <div className="mt-2 flex items-center gap-2">
          <button onClick={onSaveNote} className="btn-ghost inline-flex items-center gap-1.5">
            <Save size={15} /> Save notes
          </button>
          {note.length > 0 ? (
            <button
              onClick={() => setNote("")}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white"
            >
              <RotateCcw size={13} /> Clear draft
            </button>
          ) : null}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-edge/60 pt-5">
        <button
          onClick={onToggleComplete}
          className={
            complete
              ? "inline-flex items-center gap-2 rounded-lg border border-good/50 bg-good/15 px-4 py-2 text-sm font-semibold text-good"
              : "btn-primary inline-flex items-center gap-2"
          }
        >
          <CheckCircle2 size={16} />
          {complete ? "Completed" : `Mark complete (+${meta.xp} XP)`}
        </button>
        <button
          onClick={() => {
            store.toggleBookmark(slug);
            show({
              title: bookmarked ? "Bookmark removed" : "Bookmarked",
              kind: "info",
            });
          }}
          className={
            bookmarked
              ? "inline-flex items-center gap-2 rounded-lg border border-warn/50 bg-warn/15 px-4 py-2 text-sm font-semibold text-warn"
              : "btn-ghost inline-flex items-center gap-2"
          }
        >
          <Bookmark size={16} />
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </button>
      </div>
    </motion.section>
  );
}
