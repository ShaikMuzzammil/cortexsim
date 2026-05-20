"use client";

import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Activity, Settings } from "lucide-react";

function ProbeNode({ data }: { data: any }) {
  return (
    <div className="glass-card border-synapticGreen/30 p-4 min-w-[160px]">
      <Handle type="target" position={Position.Top} className="!bg-synapticGreen !w-3 !h-3" />

      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded bg-synapticGreen/20">
          <Activity className="w-4 h-4 text-synapticGreen" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-orbitron text-xs font-bold text-softWhite truncate">
            {data.label || "Probe"}
          </div>
          <div className="text-[10px] text-lavenderGray">
            Recording
          </div>
        </div>
        <button className="p-1 rounded hover:bg-white/5 text-lavenderGray hover:text-synapticGreen transition-colors">
          <Settings className="w-3 h-3" />
        </button>
      </div>

      <div className="h-8 bg-void/50 rounded border border-white/5 flex items-end gap-px px-1 pb-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-synapticGreen/60 rounded-sm"
            style={{ height: `${20 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(ProbeNode);