"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Activity,
  Network,
  ChevronRight,
  Code,
  Settings,
} from "lucide-react";

const sections = [
  {
    title: "Getting Started",
    icon: <BookOpen className="w-5 h-5" />,
    content: [
      { type: "heading", text: "Welcome to CortexSim" },
      { type: "text", text: "CortexSim is a browser-based spiking neural network simulator." },
      { type: "heading2", text: "Quick Start" },
      { type: "list", text: "Navigate to the Builder page" },
      { type: "list", text: "Drag a Neuron Group onto the canvas" },
      { type: "list", text: "Add a Stimulus and connect it" },
      { type: "list", text: "Add a Probe to record activity" },
      { type: "list", text: "Click Play to start simulation" },
    ],
  },
  {
    title: "Neuron Models",
    icon: <Brain className="w-5 h-5" />,
    content: [
      { type: "heading", text: "Supported Models" },
      { type: "heading2", text: "Izhikevich Model" },
      { type: "text", text: "Two-dimensional ODE system reproducing spiking and bursting behavior." },
      { type: "code", text: "v' = 0.04v^2 + 5v + 140 - u + I | u' = a(bv - u)" },
      { type: "heading2", text: "Parameters" },
      { type: "list", text: "a: Time scale of recovery variable" },
      { type: "list", text: "b: Sensitivity of recovery variable" },
      { type: "list", text: "c: After-spike reset of v" },
      { type: "list", text: "d: After-spike reset of u" },
      { type: "heading2", text: "Leaky Integrate-and-Fire" },
      { type: "text", text: "Simpler model with exponential decay to resting potential." },
      { type: "code", text: "tau_m dv/dt = -(v - v_rest) + R*I" },
    ],
  },
  {
    title: "Synaptic Plasticity",
    icon: <Network className="w-5 h-5" />,
    content: [
      { type: "heading", text: "STDP" },
      { type: "text", text: "Adjusts synaptic strength based on spike timing." },
      { type: "list", text: "Pre before Post (dt > 0): LTP potentiation" },
      { type: "list", text: "Post before Pre (dt < 0): LTD depression" },
      { type: "heading2", text: "Parameters" },
      { type: "list", text: "A+: Maximum potentiation amplitude" },
      { type: "list", text: "A-: Maximum depression amplitude" },
      { type: "list", text: "tau+: Potentiation time constant" },
      { type: "list", text: "tau-: Depression time constant" },
      { type: "heading2", text: "Tsodyks-Markram Model" },
      { type: "text", text: "Models depression/facilitation with x, y, z state variables." },
    ],
  },
  {
    title: "Simulation Controls",
    icon: <Activity className="w-5 h-5" />,
    content: [
      { type: "heading", text: "Running Simulations" },
      { type: "heading2", text: "Controls" },
      { type: "list", text: "Play/Pause: Start or pause" },
      { type: "list", text: "Step: Advance one time step" },
      { type: "list", text: "Reset: Clear all state" },
      { type: "list", text: "Speed: 0.5x, 1x, 2x, 4x" },
      { type: "heading2", text: "Integration Methods" },
      { type: "list", text: "Euler: Fast, first-order (default)" },
      { type: "list", text: "Runge-Kutta 4: More accurate, slower" },
      { type: "heading2", text: "Output" },
      { type: "list", text: "Raster Plot: Spike times" },
      { type: "list", text: "Membrane Potential: Voltage traces" },
      { type: "list", text: "Firing Rate: Average activity" },
    ],
  },
  {
    title: "Builder Interface",
    icon: <Code className="w-5 h-5" />,
    content: [
      { type: "heading", text: "Node Types" },
      { type: "heading2", text: "Neuron Group" },
      { type: "list", text: "Count: 1-1000 neurons" },
      { type: "list", text: "Model: Izhikevich or LIF" },
      { type: "list", text: "Parameters: a,b,c,d or tau_m,R" },
      { type: "heading2", text: "Stimulus" },
      { type: "list", text: "Type: Constant or Poisson" },
      { type: "list", text: "Amplitude: Current strength (nA)" },
      { type: "heading2", text: "Probe" },
      { type: "text", text: "Records membrane potential and spikes." },
      { type: "heading2", text: "Synapse" },
      { type: "text", text: "Connects groups: Static, STDP, Tsodyks-Markram." },
    ],
  },
  {
    title: "Keyboard Shortcuts",
    icon: <Settings className="w-5 h-5" />,
    content: [
      { type: "heading", text: "Shortcuts" },
      { type: "shortcut", key: "Space", action: "Play/Pause" },
      { type: "shortcut", key: "Delete", action: "Remove node" },
      { type: "shortcut", key: "Ctrl+D", action: "Duplicate" },
      { type: "shortcut", key: "Ctrl+Z", action: "Undo" },
      { type: "shortcut", key: "Ctrl+S", action: "Save" },
      { type: "shortcut", key: "Esc", action: "Deselect" },
    ],
  },
];

function renderContent(items: any[]) {
  return items.map((item, i) => {
    switch (item.type) {
      case "heading":
        return <h3 key={i} className="font-orbitron text-lg font-bold text-neon mt-6 mb-3">{item.text}</h3>;
      case "heading2":
        return <h4 key={i} className="font-bold text-softWhite mt-4 mb-2">{item.text}</h4>;
      case "text":
        return <p key={i} className="my-2">{item.text}</p>;
      case "list":
        return (
          <div key={i} className="flex items-start gap-2 my-1">
            <ChevronRight className="w-4 h-4 text-neon mt-0.5 shrink-0" />
            <span>{item.text}</span>
          </div>
        );
      case "code":
        return (
          <pre key={i} className="font-mono text-xs bg-white/5 p-3 rounded my-2 overflow-x-auto">
            <code>{item.text}</code>
          </pre>
        );
      case "shortcut":
        return (
          <div key={i} className="flex items-center gap-4 my-1 py-1 border-b border-white/5">
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono text-neon min-w-[80px] text-center">{item.key}</kbd>
            <span className="text-sm">{item.action}</span>
          </div>
        );
      default:
        return null;
    }
  });
}

export default function DocsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="relative section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neon/10 mb-4">
            <BookOpen className="w-6 h-6 text-neon" />
          </div>
          <h1 className="font-orbitron text-3xl md:text-4xl font-bold text-gradient mb-4">
            Documentation
          </h1>
          <p className="text-lavenderGray max-w-xl mx-auto">
            Learn how to build and simulate spiking neural networks.
          </p>
        </motion.div>
        <div className="max-w-3xl mx-auto space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-neon/10 text-neon">
                    {section.icon}
                  </div>
                  <h2 className="font-orbitron text-xl font-bold text-softWhite">
                    {section.title}
                  </h2>
                </div>
                <div className="text-lavenderGray leading-relaxed text-sm">
                  {renderContent(section.content)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
