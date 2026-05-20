"use client";

import { memo } from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "reactflow";

function SynapseEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: any) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const weight = data?.weight || 1;
  const plasticity = data?.plasticity || "static";
  const color = plasticity === "STDP" ? "#9D4EDD" : plasticity === "Tsodyks-Markram" ? "#FF9100" : "#00F0FF";

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: Math.abs(weight) * 2,
          opacity: 0.6,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className="glass-card px-2 py-1 text-[10px] font-mono"
        >
          <span style={{ color }}>{plasticity}</span>
          <span className="text-lavenderGray ml-1">w:{weight.toFixed(2)}</span>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(SynapseEdge);