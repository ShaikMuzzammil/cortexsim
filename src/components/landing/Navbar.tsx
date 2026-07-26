"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = pathname === "/";

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]"
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">CortexSim</span>
        </Link>

        {/* Desktop Nav - Minimal */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/simulator" 
            className={`text-sm font-medium transition-colors ${pathname === '/simulator' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            Simulator
          </Link>
          <Link 
            href="/app/exports" 
            className={`text-sm font-medium transition-colors ${pathname.includes('/exports') ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            Export
          </Link>
          <Link 
            href="/app/settings" 
            className={`text-sm font-medium transition-colors ${pathname.includes('/settings') ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            Settings
          </Link>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-4">
          <Link
            href="/simulator"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            Launch App →
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/[0.06]"
        >
          <div className="px-6 py-4 space-y-3">
            <Link href="/simulator" onClick={() => setMobileOpen(false)} className="block py-3 text-gray-300 hover:text-white">Simulator</Link>
            <Link href="/app/exports" onClick={() => setMobileOpen(false)} className="block py-3 text-gray-300 hover:text-white">Export</Link>
            <Link href="/app/settings" onClick={() => setMobileOpen(false)} className="block py-3 text-gray-300 hover:text-white">Settings</Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
