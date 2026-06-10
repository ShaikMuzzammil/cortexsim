"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { fadeIn } from "@/lib/motion";

export default function Navbar() {
  return (
    <motion.header
      variants={fadeIn}
      initial="hidden"
      animate="show"
      className="fixed inset-x-0 top-0 z-50 border-b border-edge/60 bg-ink/70 backdrop-blur-xl"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <Brain className="text-brand" size={22} />
          <span>CortexSim</span>
          <span className="rounded-md bg-brand/15 px-2 py-0.5 text-[10px] font-bold text-brand">
            GODMODE
          </span>
        </Link>
        <div className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#stack" className="hover:text-white">Tech Stack</a>
          <a href="#showcase" className="hover:text-white">Showcase</a>
          <Link href="/learn" className="hover:text-white">Learn</Link>
          <Link href="/tips" className="hover:text-white">Tips</Link>
          <Link href="/docs" className="hover:text-white">Docs</Link>
        </div>
        <Link href="/simulator" className="btn-primary">
          Launch App
        </Link>
      </nav>
    </motion.header>
  );
}
