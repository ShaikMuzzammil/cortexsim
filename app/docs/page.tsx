"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Zap,
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
    content: `
## Welcome to CortexSim

CortexSim is a browser-based spiking neural network (SNN) simulator that lets you build, simulate, and visualize neural circuits without any installation.

### Quick Start

1. Navigate to the **Builder** page
2. Drag a **Neuron Group** node onto the canvas
3. Add a **Stimulus** node and connect it to your neurons
4. Add a **Probe** to record activity
5. Click **Play** to start the simulation

No coding required – but advanced users can export configurations as JSON for programmatic use.
    `,
  },
  {
    title: "Neuron Models",
    icon: <Brain className="w-5 h-5" />,
    content: `
## Supported Models

### Izhikevich Model

The Izhikevich model is a two-dimensional system of ordinary differential equations that reproduces the spiking and bursting behavior of many known types of cortical neurons.

**Equations:**
\`\`\`
v' = 0.04v² + 5v + 140 - u + I
u' = a(bv - u)
\`\`\`

**Parameters:**
- **a**: Time scale of recovery variable
- **b**: Sensitivity of recovery variable
- **c**: After-spike reset value of v
- **d**: After-spike reset value of u

### Leaky Integrate-and-Fire (LIF)

A simpler model where the membrane potential decays exponentially to a resting potential and fires when a threshold is reached.

**Equation:**
\`\`\`
τₘ dv/dt = -(v - v_rest) + R·I
\`\`\`
    `,
  },
  {
    title: "Synaptic Plasticity",
    icon: <Network className="w-5 h-5" />,
    content: `
## STDP (Spike-Timing Dependent Plasticity)

STDP adjusts synaptic strength based on the precise timing of pre- and postsynaptic spikes.

**Rule:**
- If presynaptic spike precedes postsynaptic spike (Δt > 0): **LTP** (potentiation)
- If postsynaptic spike precedes presynaptic spike (Δt < 0): **LTD** (depression)

**Parameters:**
- A₊: Maximum potentiation amplitude
- A₋: Maximum depression amplitude
- τ₊: Potentiation time constant
- τ₋: Depression time constant

## Tsodyks-Markram Model

Models synaptic depression and facilitation using three state variables:
- x: fraction of available neurotransmitter resources
- y: fraction of resources in the active state
- z: fraction of resources in the inactive state
    `,
  },
  {
    title: "Simulation Controls",
    icon: <Activity className="w-5 h-5" />,
    content: `
## Running Simulations

### Controls
- **Play/Pause**: Start or pause the simulation
- **Step**: Advance by one time step
- **Reset**: Clear all state and start over
- **Speed**: Adjust simulation speed (0.5x, 1x, 2x, 4x)

### Integration Methods
- **Euler**: Fast, first-order accurate (default)
- **Runge-Kutta 4**: More accurate, 4th-order, slower

### Noise
Add Gaussian white noise to any neuron group:
- σ (sigma): Standard deviation of noise amplitude

### Output
- **Raster Plot**: Spike times across all neurons
- **Membrane Potential**: Voltage traces for selected probes
- **Firing Rate**: Average activity per group
    `,
  },
  {
    title: "Builder Interface",
    icon: <Code className="w-5 h-5" />,
    content: `
## Node Types

### Neuron Group
Represents a population of neurons with shared parameters.
- Count: Number of neurons (1-1000)
- Model: Izhikevich or LIF
- Parameters: a, b, c, d for Izhikevich; τₘ, R for LIF
- Position: 3D coordinates for visualization

### Stimulus
Input current generator.
- Type: Constant or Poisson spike train
- Amplitude: Current strength (nA)
- Frequency: For Poisson, spikes per second

### Probe
Recording device.
- Records: Membrane potential and/or spikes
- Live preview: Mini chart in the node

### Synapse (Edge)
Connects neuron groups.
- Weight: Connection strength
- Delay: Transmission delay (ms)
- Plasticity: Static, STDP, or Tsodyks-Markram
    `,
  },
  {
    title: "Keyboard Shortcuts",
    icon: <Settings className="w-5 h-5" />,
    content: `
## Shortcuts

| Key | Action |
|-----|--------|
| Space | Play/Pause simulation |
| Delete / Backspace | Remove selected node |
| Ctrl+D | Duplicate selected node |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| Ctrl+S | Save experiment |
| Esc | Deselect all |
| 1-3 | Select tool (1=Pointer, 2=Pan, 3=Zoom) |
    `,
  },
];

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
            Learn how to build and simulate spiking neural networks with CortexSim.
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
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="text-lavenderGray leading-relaxed whitespace-pre-wrap font-inter">
                    {section.content.split('
').map((line, i) => {
                      if (line.startsWith('## ')) {
                        return <h3 key={i} className="font-orbitron text-lg font-bold text-neon mt-6 mb-3">{line.replace('## ', '')}</h3>;
                      }
                      if (line.startsWith('### ')) {
                        return <h4 key={i} className="font-bold text-softWhite mt-4 mb-2">{line.replace('### ', '')}</h4>;
                      }
                      if (line.startsWith('```')) {
                        return null;
                      }
                      if (line.startsWith('| ')) {
                        return <div key={i} className="font-mono text-xs bg-white/5 p-2 rounded my-1">{line}</div>;
                      }
                      if (line.startsWith('- ')) {
                        return (
                          <div key={i} className="flex items-start gap-2 my-1">
                            <ChevronRight className="w-4 h-4 text-neon mt-0.5 shrink-0" />
                            <span>{line.replace('- ', '')}</span>
                          </div>
                        );
                      }
                      if (line.includes('**') && line.includes(':**')) {
                        const parts = line.split('**');
                        return (
                          <p key={i} className="my-2">
                            {parts.map((part, j) => 
                              j % 2 === 1 ? <strong key={j} className="text-neon">{part}</strong> : part
                            )}
                          </p>
                        );
                      }
                      if (line.trim() === '') {
                        return <div key={i} className="h-2" />;
                      }
                      return <p key={i} className="my-2">{line}</p>;
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}