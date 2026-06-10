"use client";

import { Play, Pause, RotateCcw, Zap, SkipForward, Sun, Moon } from "lucide-react";
import { useSimStore } from "@/store/useSimStore";

export default function Transport({
  onReset,
  onStep,
  onInject,
}: {
  onReset: () => void;
  onStep: () => void;
  onInject: () => void;
}) {
  const running = useSimStore((s) => s.running);
  const toggleRunning = useSimStore((s) => s.toggleRunning);
  const theme = useSimStore((s) => s.theme);
  const toggleTheme = useSimStore((s) => s.toggleTheme);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={toggleRunning} className="btn-primary">
        {running ? <Pause size={16} /> : <Play size={16} />}
        {running ? "Pause" : "Play"}
      </button>
      <button type="button" onClick={onStep} className="btn-ghost">
        <SkipForward size={16} /> Step
      </button>
      <button type="button" onClick={onReset} className="btn-ghost">
        <RotateCcw size={16} /> Reset
      </button>
      <button type="button" onClick={onInject} className="btn-ghost">
        <Zap size={16} /> Inject
      </button>
      <button type="button" onClick={toggleTheme} className="btn-ghost" title="Toggle theme">
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
}
