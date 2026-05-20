"use client";

import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Brain, Settings } from "lucide-react";

function NeuronGroupNode({ data }: { data: any }) {
  return (
    <div className="glass-card border-neon/30 p-4 min-w-[180px]">
      <Handle type="target" position={Position.Top} className="!bg-neon !w-3 !h-3" />

      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded bg-neon/20">
          <Brain className="w-4 h-4 text-neon" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-orbitron text-xs font-bold text-softWhite truncate">
            {data.label || "Neuron Group"}
          </div>
          <div className="text-[10px] text-lavenderGray">
            {data.count || 10} neurons
          </div>
        </div>
        <button className="p-1 rounded hover:bg-white/5 text-lavenderGray hover:text-neon transition-colors">
          <Settings className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-1 text-[10px] text-lavenderGray">
        <div className="flex justify-between">
          <span>Model:</span>
          <span className="text-neon">{data.model || "Izhikevich"}</span>
        </div>
        <div className="flex justify-between">
          <span>Type:</span>
          <span className="text-electric">{data.type || "RS"}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-neon !w-3 !h-3" />
    </div>
  );
}

export default memo(NeuronGroupNode);