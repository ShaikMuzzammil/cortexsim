import { useEffect, useState } from "react";

export default function ProgressBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-[90] h-0.5 bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-brand-cyan via-brand-violet to-brand-pink transition-[width] duration-150"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
