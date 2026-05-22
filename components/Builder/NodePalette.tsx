"use client";

import { motion } from "framer-motion";
import { Brain, Zap, Activity, GripVertical } from "lucide-react";

const nodeTypes = [
  {
    type: "neuronGroup",
    label: "Neuron Group",
    description: "Population of neurons",
    icon: <Brain className="w-5 h-5" />,
    color: "neon",
  },
  {
    type: "stimulus",
    label: "Stimulus",
    description: "Input current",
    icon: <Zap className="w-5 h-5" />,
    color: "amberAP",
  },
  {
    type: "probe",
    label: "Probe",
    description: "Record activity",
    icon: <Activity className="w-5 h-5" />,
    color: "synapticGreen",
  },
];

export default function NodePalette() {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="glass-card border-neon/20 p-4 space-y-3">
      <h3 className="font-orbitron text-sm font-bold text-softWhite uppercase tracking-wider">
        Nodes
      </h3>

      <div className="space-y-2">
        {nodeTypes.map((node, index) => (
          <motion.div
            key={node.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            draggable
            onDragStart={(e: React.DragEvent<HTMLDivElement>) => onDragStart(e, node.type)}
            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-neon/20 cursor-grab active:cursor-grabbing transition-all group"
          >
            <GripVertical className="w-3 h-3 text-lavenderGray opacity-0 group-hover:opacity-100" />
            <div className={`p-1.5 rounded bg-${node.color}/20`}>
              <div className={node.color === "neon" ? "text-neon" : node.color === "amberAP" ? "text-amberAP" : "text-synapticGreen"}>
                {node.icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-softWhite">{node.label}</div>
              <div className="text-[10px] text-lavenderGray">{node.description}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
