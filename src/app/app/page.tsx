"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, Activity, Download, ArrowRight, Zap, BarChart3, Settings } from "lucide-react";

const QUICK_ACTIONS = [
  {
    href: "/simulator",
    title: "Neural Simulator",
    desc: "Run Izhikevich neuron simulations with real-time visualization",
    icon: <Brain size={24} />,
    color: "from-blue-500 to-cyan-500",
  },
  {
    href: "/app/exports",
    title: "Export Data",
    desc: "Download results in CSV, JSON, PNG formats",
    icon: <Download size={24} />,
    color: "from-emerald-500 to-teal-500",
  },
  {
    href: "/app/settings",
    title: "Settings",
    desc: "Configure simulation parameters and preferences",
    icon: <Settings size={24} />,
    color: "from-purple-500 to-pink-500",
  },
];

const RECENT_SIMULATIONS = [
  { id: 1, name: "Regular Spiking", params: "a=0.02, b=0.2, I=10", spikes: 1247, time: "2 min ago" },
  { id: 2, name: "Bursting Mode", params: "a=0.02, b=0.25, I=15", spikes: 3421, time: "5 min ago" },
  { id: 3, name: "Fast Spiking", params: "a=0.1, b=0.2, I=10", spikes: 8934, time: "12 min ago" },
];

export default function DashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Neural network simulation workspace</p>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.href} href={action.href}>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-4`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{action.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{action.desc}</p>
              <span className="inline-flex items-center gap-1 text-xs text-gray-600 mt-3 group-hover:text-blue-400">
                Open <ArrowRight size={12} />
              </span>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Activity size={14} /> Total Simulations
          </div>
          <div className="text-2xl font-bold text-white">47</div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Zap size={14} /> Spikes Generated
          </div>
          <div className="text-2xl font-bold text-blue-400">2.8M</div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <BarChart3 size={14} /> Avg Firing Rate
          </div>
          <div className="text-2xl font-bold text-emerald-400">42 Hz</div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Brain size={14} /> Neurons Simulated
          </div>
          <div className="text-2xl font-bold text-purple-400">12.4K</div>
        </div>
      </div>

      {/* Recent Simulations */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Simulations</h2>
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Name</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Parameters</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Spikes</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_SIMULATIONS.map((sim) => (
                <tr key={sim.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <Link href="/simulator" className="text-white hover:text-blue-400 font-medium">{sim.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{sim.params}</td>
                  <td className="px-4 py-3 text-right text-sm text-blue-400">{sim.spikes.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-500">{sim.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Ready to simulate?</h3>
        <p className="text-sm text-gray-400 mb-4">Launch the neural simulator with one click</p>
        <Link
          href="/simulator"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition-all"
        >
          <Zap size={18} /> Launch Simulator
        </Link>
      </div>
    </motion.div>
  );
}
