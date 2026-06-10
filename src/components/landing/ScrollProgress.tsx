"use client";

import { motion, useScroll, useSpring } from "framer-motion";

const barStyle = { scaleX: 0 } as const;

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });
  const style = { scaleX };
  return (
    <motion.div
      style={style}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-brand via-inh to-good"
    />
  );
}
