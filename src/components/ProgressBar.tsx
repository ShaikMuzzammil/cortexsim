import { useEffect, useRef } from "react";

export default function ProgressBar() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? (h.scrollTop / max) * 100 : 0;
      if (ref.current) ref.current.style.width = `${p}%`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed left-0 top-0 z-[90] h-0.5 w-full bg-transparent">
      <div
        ref={ref}
        className="h-full w-0 bg-gradient-to-r from-brand-cyan via-brand-violet to-brand-pink"
      />
    </div>
  );
}
