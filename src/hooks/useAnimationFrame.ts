import { useEffect, useRef } from "react";

// Calls the provided callback on every animation frame with a delta time (ms).
// The callback ref pattern avoids re-subscribing the rAF loop on every render.
export function useAnimationFrame(
  callback: (deltaMs: number) => void,
  active: boolean,
) {
  const cbRef = useRef(callback);
  const lastRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!active) return;
    lastRef.current = performance.now();
    const loop = (now: number) => {
      const dt = now - lastRef.current;
      lastRef.current = now;
      cbRef.current(dt);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);
}
