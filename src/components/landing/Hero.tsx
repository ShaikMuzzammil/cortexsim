"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { fadeUp, stagger, hoverLift, tapPress } from "@/lib/motion";
import { ArrowRight, Sparkles } from "lucide-react";

// Animated neural-particle hero backdrop drawn on a canvas.
function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const N = 120;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.3 + Math.random() * 0.7,
      vx: (Math.random() - 0.5) * 0.0008,
      vy: (Math.random() - 0.5) * 0.0008,
      p: Math.random() * Math.PI * 2,
      warm: Math.random() < 0.35,
    }));
    const resize = () => {
      canvas.width = canvas.clientWidth * DPR;
      canvas.height = canvas.clientHeight * DPR;
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      for (const pt of pts) {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.p += 0.03;
        if (pt.x < 0 || pt.x > 1) pt.vx *= -1;
        if (pt.y < 0 || pt.y > 1) pt.vy *= -1;
      }
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = (pts[i].x - pts[j].x) * w;
          const dy = (pts[i].y - pts[j].y) * h;
          const d = Math.hypot(dx, dy);
          if (d < 165 * DPR) {
            const a = (1 - d / (165 * DPR)) * 0.22;
            const warm = pts[i].warm || pts[j].warm;
            ctx.strokeStyle = warm
              ? "rgba(255,93,115," + a.toFixed(3) + ")"
              : "rgba(110,168,255," + a.toFixed(3) + ")";
            ctx.lineWidth = warm ? 0.8 : 0.6;
            ctx.beginPath();
            ctx.moveTo(pts[i].x * w, pts[i].y * h);
            ctx.lineTo(pts[j].x * w, pts[j].y * h);
            ctx.stroke();
          }
        }
      }
      for (const pt of pts) {
        const pulse = 0.5 + 0.5 * Math.sin(pt.p);
        const r = (1.1 + pulse * 2.1) * pt.z * DPR;
        const cx = pt.x * w;
        const cy = pt.y * h;
        const core = pt.warm ? "255,120,140" : "150,195,255";
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 4);
        glow.addColorStop(0, "rgba(" + core + "," + (0.6 * pt.z).toFixed(3) + ")");
        glow.addColorStop(1, "rgba(" + core + ",0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(210,230,255," + (0.7 * pt.z).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full opacity-70"
      aria-hidden
    />
  );
}

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-grid [background-size:34px_34px] opacity-40" />
      <HeroCanvas />
      <div className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand/20 blur-[140px]" />
      <div className="absolute right-[12%] top-[22%] h-[300px] w-[300px] rounded-full bg-exc/10 blur-[130px]" />
      <div className="absolute bottom-[8%] left-[14%] h-[260px] w-[260px] rounded-full bg-inh/10 blur-[120px]" />
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
      >
        <motion.div
          variants={fadeUp}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-edge bg-panel/60 px-4 py-1.5 text-xs text-slate-300"
        >
          <Sparkles size={14} className="text-brand" />
          Real-time brain dynamics, simulated in your browser
        </motion.div>
        <motion.h1
          variants={fadeUp}
          className="text-balance text-5xl font-extrabold leading-tight sm:text-7xl"
        >
          CortexSim{" "}
          <span className="bg-gradient-to-r from-brand via-indigo-300 to-exc bg-clip-text text-transparent">
            STUDIO
          </span>
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-xl text-lg text-slate-300"
        >
          A full-stack spiking neural network simulator. Watch thousands of
          Izhikevich neurons fire in 3D, sculpt the dynamics live, run parameter
          sweeps, and export your experiments.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-10 flex flex-wrap justify-center gap-4">
          <motion.div whileHover={hoverLift} whileTap={tapPress}>
            <Link href="/simulator" className="btn-primary text-base">
              Launch the Simulator <ArrowRight size={18} />
            </Link>
          </motion.div>
          <motion.div whileHover={hoverLift} whileTap={tapPress}>
            <Link href="/docs" className="btn-ghost text-base">
              Read the science
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
