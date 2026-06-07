import type { CSSProperties } from "react";
import { useSim } from "../../store/useSim";
import Platform from "./Platform";
import LearnDeepDive from "../landing/LearnDeepDive";

const appBg: CSSProperties = {
  background:
    "radial-gradient(1100px 600px at 15% -10%, rgba(34,211,238,0.10), transparent 60%), radial-gradient(900px 600px at 100% 0%, rgba(168,85,247,0.10), transparent 55%), #05060a",
};

export default function PlatformApp() {
  const goHome = useSim((s) => s.goHome);
  const running = useSim((s) => s.running);
  const toggleRunning = useSim((s) => s.toggleRunning);

  return (
    <div style={appBg} className="relative z-10 min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-cyan to-brand-violet text-ink">
              ◉
            </span>
            <div className="leading-tight">
              <div className="gradient-text text-sm font-extrabold">
                CortexSim Pro
              </div>
              <div className="text-[10px] uppercase tracking-widest text-white/40">
                Live Simulator
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleRunning}
              className="hot glass rounded-xl px-3 py-1.5 text-sm text-white/80 hover:text-white"
            >
              {running ? "❚❚ Pause" : "▶ Play"}
            </button>
            <button
              onClick={goHome}
              className="glow-btn rounded-xl px-4 py-1.5 text-sm"
            >
              ← Home
            </button>
          </div>
        </div>
      </header>
      <Platform />
      <LearnDeepDive variant="platform" />
    </div>
  );
}
