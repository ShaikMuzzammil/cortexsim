"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, Menu, X, Zap } from "lucide-react";
import { fadeIn } from "@/lib/motion";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { useState } from "react";

const SECTION_IDS = ["features", "platform", "stack", "showcase", "learn-cta"];

const SECTION_LINKS: Array<{ id: string; label: string }> = [
  { id: "features", label: "Features" },
  { id: "platform", label: "Platform" },
  { id: "tech", label: "Technology" },
  { id: "showcase", label: "Showcase" },
];

const PAGE_LINKS: Array<{ href: string; label: string; icon?: string }> = [
  { href: "/simulator", label: "Launch Studio", icon: "🚀" },
  { href: "/learn", label: "Learn", icon: "📚" },
  { href: "/docs", label: "Docs", icon: "📖" },
  { href: "/app", label: "Dashboard", icon: "📊" },
  { href: "/platform", label: "Platform", icon: "🔧" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const active = useScrollSpy(SECTION_IDS);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      variants={fadeIn}
      initial="hidden"
      animate="show"
      className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#05070e]/80 backdrop-blur-xl"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6ea8ff] to-[#a855f7] flex items-center justify-center shadow-lg shadow-[#6ea8ff]/30 group-hover:shadow-[#6ea8ff]/50 transition-shadow">
            <Brain className="text-white" size={20} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white tracking-tight text-lg">CortexSim</span>
            <span className="rounded-md bg-gradient-to-r from-[#6ea8ff]/20 to-[#a855f7]/20 px-2 py-0.5 text-[10px] font-bold text-[#6ea8ff] border border-[#6ea8ff]/30">
              STUDIO
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1 text-sm">
          {SECTION_LINKS.map((s) => {
            const isActive = isHome && active === s.id;
            return (
              <a
                key={s.id}
                href={`/#${s.id}`}
                className={`relative px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "text-white font-semibold bg-white/5"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {s.label}
                {isActive ? (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#6ea8ff]"
                  />
                ) : null}
              </a>
            );
          })}
          
          <div className="w-px h-5 bg-white/10 mx-2" />
          
          {PAGE_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                pathname.startsWith(l.href) && l.href !== "/"
                  ? "text-white font-semibold bg-[#6ea8ff]/10 border border-[#6ea8ff]/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {l.icon && <span>{l.icon}</span>}
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA Button - Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <Link 
            href="/simulator" 
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6ea8ff] to-[#a855f7] text-white font-semibold text-sm shadow-lg shadow-[#6ea8ff]/25 hover:shadow-[#6ea8ff]/40 hover:scale-[1.02] transition-all"
          >
            <Zap size={16} />
            Start Simulating
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden absolute top-full left-0 right-0 bg-[#070b18]/95 backdrop-blur-xl border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {/* Section Links */}
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Navigation</div>
            {SECTION_LINKS.map((s) => (
              <a
                key={s.id}
                href={`/#${s.id}`}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                {s.label}
              </a>
            ))}
            
            <div className="border-t border-white/10 my-3" />
            
            {/* Page Links */}
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Quick Access</div>
            {PAGE_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                  pathname.startsWith(l.href)
                    ? "text-white bg-[#6ea8ff]/10 font-medium"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {l.icon && <span>{l.icon}</span>}
                {l.label}
              </Link>
            ))}
            
            <div className="border-t border-white/10 my-3" />
            
            {/* CTA Button - Mobile */}
            <Link 
              href="/simulator"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center px-5 py-3 rounded-xl bg-gradient-to-r from-[#6ea8ff] to-[#a855f7] text-white font-semibold"
            >
              🚀 Launch Studio Now — No Login Required
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
