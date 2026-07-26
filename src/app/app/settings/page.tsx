"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, User, Palette, Globe, Info } from "lucide-react";

export default function SettingsPage() {
  const [theme, setTheme] = useState("dark");
  const [neurons, setNeurons] = useState(50);
  const [duration, setDuration] = useState(1000);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-2xl"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your simulation preferences</p>
      </div>

      {/* Profile Section */}
      <section className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center gap-3 mb-4">
          <User size={20} className="text-blue-400" />
          <h2 className="font-semibold text-white">Profile</h2>
        </div>
        
        <div className="flex items-center gap-4 p-4 rounded-lg bg-[#0d0d12] border border-white/[0.04]">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold">
            G
          </div>
          <div>
            <div className="font-medium text-white">Guest User</div>
            <div className="text-sm text-gray-500">guest@cortexsim.local</div>
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
              <Info size={10} /> Guest Mode - No login required
            </span>
          </div>
        </div>
      </section>

      {/* Default Parameters */}
      <section className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center gap-3 mb-4">
          <Settings size={20} className="text-purple-400" />
          <h2 className="font-semibold text-white">Default Simulation</h2>
        </div>
        
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Default Neurons</span>
              <span className="text-blue-400 font-mono">{neurons}</span>
            </div>
            <input
              type="range"
              min={1}
              max={200}
              value={neurons}
              onChange={(e) => setNeurons(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Default Duration (ms)</span>
              <span className="text-emerald-400 font-mono">{duration}</span>
            </div>
            <input
              type="range"
              min={100}
              max={5000}
              step={100}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center gap-3 mb-4">
          <Palette size={20} className="text-pink-400" />
          <h2 className="font-semibold text-white">Appearance</h2>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {["dark", "midnight", "ocean"].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`p-3 rounded-lg border transition-all capitalize ${
                theme === t
                  ? "border-blue-500 bg-blue-500/10 text-blue-400"
                  : "border-white/[0.06] text-gray-400 hover:border-white/[0.12]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* System Info */}
      <section className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center gap-3 mb-4">
          <Globe size={20} className="text-cyan-400" />
          <h2 className="font-semibold text-white">System</h2>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Platform</span>
            <span className="text-white">CortexSim Studio v6.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Engine</span>
            <span className="text-white">Izhikevich Model</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Storage</span>
            <span className="text-white">Browser LocalStorage</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
              Online
            </span>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
