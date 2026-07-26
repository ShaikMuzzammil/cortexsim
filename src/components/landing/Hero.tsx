"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { fadeUp, stagger, hoverLift, tapPress } from "@/lib/motion";
import { ArrowRight, Sparkles, Play, BookOpen, Zap, Shield } from "lucide-react";

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
    const N = 150;
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
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid [background-size:34px_34px] opacity-40" />
      <HeroCanvas />
      <div className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand/20 blur-[140px]" />
      <div className="absolute right-[12%] top-[22%] h-[300px] w-[300px] rounded-full bg-exc/10 blur-[130px]" />
      <div className="absolute bottom-[8%] left-[14%] h-[260px] w-[260px] rounded-full bg-inh/10 blur-[120px]" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-4xl px-6 text-center"
      >
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#6ea8ff]/30 bg-[#6ea8ff]/10 px-5 py-2 text-sm text-[#6ea8ff] font-medium backdrop-blur-sm"
        >
          <Sparkles size={16} className="animate-pulse" />
          Real-time Neural Network Simulation — No Login Required
          <Shield size={14} className="text-emerald-400" />
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          variants={fadeUp}
          className="text-balance text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight"
        >
          CortexSim{" "}
          <span className="bg-gradient-to-r from-[#6ea8ff] via-indigo-300 to-[#a855f7] bg-clip-text text-transparent">
            STUDIO
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-slate-300 leading-relaxed"
        >
          A full-stack spiking neural network simulator platform. Watch thousands of 
          Izhikevich neurons fire in stunning 3D visualizations, sculpt neural dynamics 
          live, run parameter sweeps, and export your experiments — all from your browser.
        </motion.p>

        {/* Key Features Pills */}
        <motion.div 
          variants={fadeUp}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          {["🧠 35+ Interactive Modules", "⚡ Real-time Simulation", "📊 Advanced Analytics", "🔬 Scientific Accuracy", "💾 Export to Multiple Formats"].map((feature) => (
            <span key={feature} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
              {feature}
            </span>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div variants={fadeUp} className="mt-10 flex flex-wrap justify-center gap-4">
          <motion.div whileHover={hoverLift} whileTap={tapPress}>
            <Link 
              href="/simulator" 
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#6ea8ff] to-[#a855f7] text-white font-bold text-base shadow-2xl shadow-[#6ea8ff]/30 hover:shadow-[#6ea8ff]/50 transition-all"
            >
              <Play size={20} />
              Launch Simulator
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          <motion.div whileHover={hoverLift} whileTap={tapPress}>
            <Link 
              href="/app" 
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl border border-white/20 text-white font-semibold text-base hover:bg-white/5 transition-all"
            >
              <Zap size={18} />
              Open Dashboard
            </Link>
          </motion.div>
          <motion.div whileHover={hoverLift} whileTap={tapPress}>
            <Link 
              href="/learn" 
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl border border-white/10 text-slate-300 font-medium text-base hover:text-white hover:border-white/20 transition-all"
            >
              <BookOpen size={18} />
              Start Learning
            </Link>
          </motion.div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          variants={fadeUp}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
            Instant Access — No Registration
          </span>
          <span className="w-px h-4 bg-slate-700" />
          <span>100% Browser-Based</span>
          <span className="w-px h-4 bg-slate-700" />
          <span>Open Source Platform</span>
        </motion.div>

        {/* Quick Start Guide */}
        <motion.div
          variants={fadeUp}
          className="mt-16 p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm max-w-2xl mx-auto"
        >
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <span>🚀</span> Quick Start Guide
          </h3>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl mb-2">1️⃣</div>
              <div className="text-sm font-medium text-white">Launch Studio</div>
              <div className="text-xs text-slate-500 mt-1">Click "Launch Simulator" to open the neural network workspace</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl mb-2">2️⃣</div>
              <div className="text-sm font-medium text-white">Explore Modules</div>
              <div className="text-xs text-slate-500 mt-1">Choose from 35+ interactive simulation and analysis modules</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl mb-2">3️⃣</div>
              <div className="text-sm font-medium text-white">Export Results</div>
              <div className="text-xs text-slate-500 mt-1">Save your work as PDF, CSV, JSON, PNG or SVG files</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
