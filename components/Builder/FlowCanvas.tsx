"use client";

import { useCallback, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import NeuronGroupNode from "./NeuronGroupNode";
import StimulusNode from "./StimulusNode";
import ProbeNode from "./ProbeNode";
import SynapseEdge from "./SynapseEdge";

const nodeTypes: NodeTypes = {
  neuronGroup: NeuronGroupNode,
  stimulus: StimulusNode,
  probe: ProbeNode,
};

const edgeTypes: EdgeTypes = {
  synapse: SynapseEdge,
};

interface FlowCanvasProps {
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

export default function FlowCanvas({
  onNodesChange,
  onEdgesChange,
  initialNodes = [],
  initialEdges = [],
}: FlowCanvasProps) {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      const edge = { ...connection, type: "synapse", data: { weight: 1, delay: 1, plasticity: "static" } };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      // Handle node deletion
    },
    []
  );

  return (
    <div className="w-full h-full bg-void/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => {
          onNodesChangeInternal(changes);
          onNodesChange?.(nodes);
        }}
        onEdgesChange={(changes) => {
          onEdgesChangeInternal(changes);
          onEdgesChange?.(edges);
        }}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-void/50"
      >
        <Background color="#1A1A2E" gap={20} size={1} />
        <Controls className="!bg-violetSlate !border-neon/20 !text-neon" />
        <MiniMap
          className="!bg-violetSlate/80 !border-neon/20"
          nodeColor={() => "#00F0FF"}
          maskColor="rgba(10, 10, 15, 0.8)"
        />
      </ReactFlow>
    </div>
  );
}