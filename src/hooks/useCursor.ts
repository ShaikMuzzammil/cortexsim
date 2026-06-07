import { useEffect } from "react";

/**
 * Custom pointer: a precise dot plus a smoothly trailing ring that scales up
 * when hovering interactive elements. No-op on touch / coarse pointers.
 */
export function useCursor(
  dotRef: React.RefObject<HTMLDivElement>,
  ringRef: React.RefObject<HTMLDivElement>,
) {
  useEffect(() => {
    const fine = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    if (!fine) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx}px, ${my}px)`;
      }
      const el = e.target as HTMLElement;
      const hot = !!el.closest(
        'a, button, input, select, [role="button"], .hot',
      );
      ringRef.current?.classList.toggle("cursor-hot", hot);
    };

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx}px, ${ry}px)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [dotRef, ringRef]);
}
