"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// A custom, smooth, fast cursor: a tight dot that tracks almost instantly plus a
// trailing ring that springs behind it. Disabled on touch / coarse pointers.
export default function StudioCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hot, setHot] = useState(false);
  const [down, setDown] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const dotX = useSpring(x, { stiffness: 1400, damping: 60, mass: 0.25 });
  const dotY = useSpring(y, { stiffness: 1400, damping: 60, mass: 0.25 });
  const ringX = useSpring(x, { stiffness: 260, damping: 26, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 260, damping: 26, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);
    document.body.classList.add("studio-cursor-on");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement | null;
      const interactive = !!(
        el &&
        el.closest("a, button, input, select, textarea, [role=button], .studio-hot")
      );
      setHot(interactive);
    };
    const downH = () => setDown(true);
    const upH = () => setDown(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", downH);
    window.addEventListener("mouseup", upH);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", downH);
      window.removeEventListener("mouseup", upH);
      document.body.classList.remove("studio-cursor-on");
    };
  }, [x, y]);

  if (!enabled) return null;

  const dotStyle = { left: dotX, top: dotY };
  const ringStyle = { left: ringX, top: ringY };
  const dotAnim = { scale: down ? 0.6 : hot ? 1.6 : 1 };
  const ringAnim = { scale: down ? 0.8 : hot ? 1.8 : 1, opacity: hot ? 0.9 : 0.5 };

  return (
    <>
      <motion.div
        className="studio-cursor-dot"
        style={dotStyle}
        animate={dotAnim}
        transition={dotTransition}
      />
      <motion.div
        className={"studio-cursor-ring" + (hot ? " hot" : "")}
        style={ringStyle}
        animate={ringAnim}
        transition={ringTransition}
      />
    </>
  );
}

const dotTransition = { type: "spring", stiffness: 900, damping: 40 };
const ringTransition = { type: "spring", stiffness: 300, damping: 24 };
