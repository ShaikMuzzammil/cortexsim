"use client";

import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Gauge,
  Save,
  Download,
} from "lucide-react";
import Button from "@/components/ui/Button";

interface SimulationControlsProps {
  isRunning: boolean;
  speed: number;
  onPlayPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onSave: () => void;
  onExport: () => void;
}

export default function SimulationControls({
  isRunning,
  speed,
  onPlayPause,
  onStep,
  onReset,
  onSpeedChange,
  onSave,
  onExport,
}: SimulationControlsProps) {
  return (
    <div className="glass-card border-neon/20 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-orbitron text-sm font-bold text-softWhite uppercase tracking-wider">
          Simulation
        </h3>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-synapticGreen animate-pulse" : "bg-amberAP"}`} />
          <span className="text-xs text-lavenderGray">
            {isRunning ? "Running" : "Paused"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={isRunning ? "secondary" : "primary"}
          size="sm"
          onClick={onPlayPause}
          className="gap-1"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? "Pause" : "Play"}
        </Button>

        <Button variant="ghost" size="sm" onClick={onStep} className="gap-1">
          <SkipForward className="w-4 h-4" />
          Step
        </Button>

        <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-lavenderGray flex items-center gap-1">
            <Gauge className="w-3 h-3" />
            Speed
          </span>
          <span className="text-neon font-mono">{speed.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="4"
          step="0.1"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon"
        />
        <div className="flex justify-between text-[10px] text-lavenderGray">
          <span>0.1x</span>
          <span>1x</span>
          <span>4x</span>
        </div>
      </div>

      <div className="pt-3 border-t border-white/5 flex gap-2">
        <Button variant="primary" size="sm" onClick={onSave} className="flex-1 gap-1">
          <Save className="w-3 h-3" />
          Save
        </Button>
        <Button variant="ghost" size="sm" onClick={onExport} className="gap-1">
          <Download className="w-3 h-3" />
          Export
        </Button>
      </div>
    </div>
  );
}