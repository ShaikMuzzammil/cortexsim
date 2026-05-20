"use client";

import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Zap, Settings } from "lucide-react";

function StimulusNode({ data }: { data: any }) {
  return (
    <div className="glass-card border-amberAP/30 p-4 min-w-[160px]">
      <Handle type="target" position={Position.Top} className="!bg-amberAP !w-3 !h-3" />

      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded bg-amberAP/20">
          <Zap className="w-4 h-4 text-amberAP" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-orbitron text-xs font-bold text-softWhite truncate">
            {data.label || "Stimulus"}
          </div>
          <div className="text-[10px] text-lavenderGray">
            {data.type || "Constant"}
          </div>
        </div>
        <button className="p-1 rounded hover:bg-white/5 text-lavenderGray hover:text-amberAP transition-colors">
          <Settings className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-1 text-[10px] text-lavenderGray">
        <div className="flex justify-between">
          <span>Amplitude:</span>
          <span className="text-amberAP">{data.amplitude || 10} nA</span>
        </div>
        <div className="flex justify-between">
          <span>Freq:</span>
          <span className="text-amberAP">{data.frequency || 0} Hz</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-amberAP !w-3 !h-3" />
    </div>
  );
}

export default memo(StimulusNode);