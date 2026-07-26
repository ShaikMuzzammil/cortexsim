"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Brain, Download, Settings, Menu, X, Zap,
  ChevronRight
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/app", label: "Dashboard", icon: <Home size={18} /> },
  { href: "/simulator", label: "Simulator", icon: <Brain size={18} /> },
  { href: "/app/exports", label: "Export", icon: <Download size={18} /> },
  { href: "/app/settings", label: "Settings", icon: <Settings size={18} /> },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-white/[0.06] bg-[#0d0d12] shrink-0">
        {/* Logo */}
        <div className="p-4 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <span className="font-bold text-white">CortexSim</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-blue-500/15 text-blue-400 font-medium"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                {item.icon}
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Ready
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              <Menu size={20} />
            </button>
            <div className="text-sm text-gray-500">
              {NAV_ITEMS.find(item => pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href)))?.label || "Page"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/simulator"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold"
            >
              <Zap size={14} /> Quick Launch
            </Link>
            
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
              G
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 bg-[#0d0d12] border-r border-white/[0.06] md:hidden"
            >
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5 font-bold text-white">
                  <Brain size={20} /> CortexSim
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <nav className="p-3 space-y-1 mt-4">
                {NAV_ITEMS.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base ${
                        active ? "bg-blue-500/15 text-blue-400" : "text-gray-400"
                      }`}
                    >
                      {item.icon} {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
