import { useEffect, useRef } from "react";

/**
 * Custom trailing cursor: a precise dot that tracks the pointer exactly and a
 * ring that follows with smooth easing and grows over interactive elements.
 * No-op on coarse pointers (touch).
 */
export function useCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
      const el = e.target as HTMLElement | null;
      const hot = !!el?.closest(
        "button, a, input, select, [role='button'], .hot",
      );
      ring.classList.toggle("cursor-hot", hot);
    };

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      const half = ring.offsetWidth / 2;
      ring.style.transform = `translate(${rx - half}px, ${ry - half}px)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return { dotRef, ringRef };
}
