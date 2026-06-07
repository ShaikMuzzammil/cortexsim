import type { CSSProperties } from "react";

const blobCyan: CSSProperties = {
  background: "radial-gradient(circle, rgba(34,211,238,0.55), transparent 70%)",
};
const blobViolet: CSSProperties = {
  background: "radial-gradient(circle, rgba(168,85,247,0.55), transparent 70%)",
};
const blobPink: CSSProperties = {
  background: "radial-gradient(circle, rgba(236,72,153,0.45), transparent 70%)",
};
const grid: CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
  backgroundSize: "46px 46px",
};

export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-ink" />
      <div
        style={blobCyan}
        className="absolute -left-40 -top-40 h-[40rem] w-[40rem] rounded-full opacity-40 blur-[120px] animate-float"
      />
      <div
        style={blobViolet}
        className="absolute right-[-12rem] top-1/3 h-[36rem] w-[36rem] rounded-full opacity-40 blur-[120px] animate-float"
      />
      <div
        style={blobPink}
        className="absolute bottom-[-12rem] left-1/3 h-[34rem] w-[34rem] rounded-full opacity-30 blur-[120px] animate-float"
      />
      <div style={grid} className="absolute inset-0 opacity-[0.05]" />
    </div>
  );
}
