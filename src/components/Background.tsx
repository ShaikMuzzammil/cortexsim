import type { CSSProperties } from "react";

// A calm, static backdrop — a soft radial wash plus a faint grid.
// No floating "bubbles".
const wash: CSSProperties = {
  background:
    "radial-gradient(1200px 700px at 50% -10%, rgba(34,211,238,0.10), transparent 60%), radial-gradient(900px 600px at 90% 20%, rgba(168,85,247,0.10), transparent 60%), #05060a",
};
const grid: CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
};

export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div style={wash} className="absolute inset-0" />
      <div style={grid} className="absolute inset-0 opacity-[0.04]" />
    </div>
  );
}
