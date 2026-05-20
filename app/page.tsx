"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Brain,
  Activity,
  Network,
  MousePointerClick,
  ChevronRight,
  Sparkles,
  Zap,
  Play,
  ArrowDown,
} from "lucide-react";
import ExpandableCard from "@/components/ExpandableCard";
import Button from "@/components/ui/Button";

const features = [
  {
    title: "Real-Time Simulation",
    summary: "Simulate Izhikevich neurons in your browser with WebGPU acceleration for instant feedback.",
    icon: <Activity className="w-6 h-6" />,
    details: (
      <>
        <p>
          Our simulation engine supports up to 1000 Izhikevich and Leaky Integrate-and-Fire (LIF) neurons 
          running entirely in your browser. Using WebGPU compute shaders, we achieve near-native performance 
          without any backend infrastructure.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-3 rounded-lg bg-white/5">
            <div className="text-neon font-mono text-lg font-bold">1000+</div>
            <div className="text-xs text-lavenderGray">Neurons simulated</div>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <div className="text-neon font-mono text-lg font-bold">&lt;1ms</div>
            <div className="text-xs text-lavenderGray">Step latency</div>
          </div>
        </div>
        <p className="mt-4">
          Features include configurable integration methods (Euler, RK4), Gaussian noise injection, 
          and heterogeneous parameter distributions within neuron groups.
        </p>
      </>
    ),
  },
  {
    title: "3D Brain Visualisation",
    summary: "See every spike as a lightning bolt in a fully rotatable, interactive 3D network view.",
    icon: <Brain className="w-6 h-6" />,
    details: (
      <>
        <p>
          Built with @react-three/fiber, our 3D visualizer renders neurons as glowing spheres that 
          change color based on membrane potential. Spikes trigger purple flashes and synaptic 
          connections pulse with light as action potentials propagate.
        </p>
        <ul className="mt-4 space-y-2">
          <li className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-neon" />
            Real-time membrane potential color mapping
          </li>
          <li className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-neon" />
            Spike propagation animations along synapses
          </li>
          <li className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-neon" />
            OrbitControls with auto-rotation when paused
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Synaptic Plasticity",
    summary: "Watch STDP reshape connections over time. Observe learning in real-time.",
    icon: <Network className="w-6 h-6" />,
    details: (
      <>
        <p>
          Implement Spike-Timing Dependent Plasticity (STDP) and Tsodyks-Markram synaptic dynamics 
          directly in your experiments. Visualize weight changes as heatmaps and observe how network 
          topology evolves during stimulation.
        </p>
        <div className="mt-4 p-4 rounded-lg bg-white/5 font-mono text-xs">
          <div className="text-neon">// STDP Rule</div>
          <div className="text-lavenderGray">Δw = A₊ · exp(-Δt/τ₊) if Δt &gt; 0</div>
          <div className="text-lavenderGray">Δw = A₋ · exp(Δt/τ₋) if Δt &lt; 0</div>
        </div>
      </>
    ),
  },
  {
    title: "Drag-and-Drop Builder",
    summary: "Wire up experiments without code. Connect neurons, stimuli, and probes visually.",
    icon: <MousePointerClick className="w-6 h-6" />,
    details: (
      <>
        <p>
          Our React Flow-based builder lets you construct complex neural circuits by dragging 
          neuron groups, stimulus generators, and recording probes onto a canvas. Connect them with 
          synaptic edges that define weight, delay, and plasticity rules.
        </p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {["Neuron Group", "Stimulus", "Probe"].map((item) => (
            <div key={item} className="p-3 rounded-lg bg-white/5 text-center">
              <div className="text-xs text-neon font-medium">{item}</div>
            </div>
          ))}
        </div>
        <p className="mt-4">
          Keyboard shortcuts: Delete (remove node), Ctrl+D (duplicate), Space (play/pause simulation).
        </p>
      </>
    ),
  },
];

function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-20" />

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-electric/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative section-container text-center space-y-8 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon/10 border border-neon/20 text-neon text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            WebGPU Powered Simulation
          </div>

          <h1 className="font-orbitron text-5xl md:text-7xl font-black text-gradient leading-tight">
            Simulate the Brain.
            <br />
            <span className="text-electric">Visualise Intelligence.</span>
          </h1>

          <p className="text-xl text-lavenderGray max-w-2xl mx-auto leading-relaxed">
            CortexSim – build spiking neural networks, watch them fire, and understand plasticity 
            with our advanced browser-based simulation platform.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/builder">
            <Button variant="primary" size="lg" className="gap-2">
              <Play className="w-5 h-5" />
              Start Building
            </Button>
          </Link>
          <Link href="/#features">
            <Button variant="secondary" size="lg" className="gap-2">
              Learn More
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-8 max-w-lg mx-auto pt-12"
        >
          {[
            { value: "1000+", label: "Neurons" },
            { value: "60 FPS", label: "Simulation" },
            { value: "100%", label: "Free" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-orbitron text-2xl md:text-3xl font-bold text-neon">
                {stat.value}
              </div>
              <div className="text-sm text-lavenderGray">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <Link href="/#features" className="animate-bounce inline-block text-lavenderGray hover:text-neon transition-colors">
            <ArrowDown className="w-6 h-6" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const [openCard, setOpenCard] = useState<number | null>(null);

  return (
    <section id="features" className="relative py-24 bg-grid">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-gradient mb-4">
            Advanced Features
          </h2>
          <p className="text-lavenderGray max-w-xl mx-auto">
            Everything you need to build, simulate, and analyze spiking neural networks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <ExpandableCard
              key={feature.title}
              {...feature}
              index={index}
              isOpen={openCard === index}
              onToggle={() => setOpenCard(openCard === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="demo" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-void via-violetSlate/50 to-void" />

      <div ref={ref} className="relative section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-gradient mb-4">
            Live Demo
          </h2>
          <p className="text-lavenderGray max-w-xl mx-auto">
            A miniature network running in real-time. Hover to see membrane potentials.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="glass-card border-neon/20 p-1 max-w-4xl mx-auto"
        >
          <div className="relative aspect-video bg-void rounded-lg overflow-hidden flex items-center justify-center">
            {/* Simulated mini network visualization */}
            <div className="absolute inset-0">
              {Array.from({ length: 20 }).map((_, i) => {
                const x = 20 + (i % 5) * 15 + Math.random() * 5;
                const y = 20 + Math.floor(i / 5) * 20 + Math.random() * 5;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      background: i % 3 === 0 ? "#00F0FF" : i % 3 === 1 ? "#9D4EDD" : "#00E676",
                      boxShadow: `0 0 10px ${i % 3 === 0 ? "#00F0FF" : i % 3 === 1 ? "#9D4EDD" : "#00E676"}`,
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 1.5 + Math.random(),
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                );
              })}

              {/* Connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {Array.from({ length: 15 }).map((_, i) => {
                  const x1 = 20 + (i % 5) * 15;
                  const y1 = 25 + Math.floor(i / 5) * 20;
                  const x2 = 20 + ((i + 1) % 5) * 15;
                  const y2 = 25 + Math.floor((i + 1) / 5) * 20;
                  return (
                    <motion.line
                      key={i}
                      x1={`${x1}%`}
                      y1={`${y1}%`}
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                      stroke="#00F0FF"
                      strokeWidth="1"
                      strokeOpacity="0.2"
                      animate={{ strokeOpacity: [0.1, 0.4, 0.1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  );
                })}
              </svg>
            </div>

            <div className="relative z-10 text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon/20 border border-neon/30 text-neon text-sm">
                <Play className="w-4 h-4" />
                Simulation Running
              </div>
              <p className="text-lavenderGray text-sm">
                20 neurons • 15 synapses • Real-time firing
              </p>
            </div>
          </div>
        </motion.div>

        <div className="text-center mt-8">
          <Link href="/builder">
            <Button variant="primary" className="gap-2">
              Open Full Builder
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function BuilderAccessSection() {
  return (
    <section id="builder-access" className="relative py-24">
      <div className="absolute inset-0 bg-neon/5" />
      <div className="relative section-container text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-gradient mb-4">
            Ready to Build?
          </h2>
          <p className="text-lavenderGray max-w-xl mx-auto mb-8">
            Jump into the experiment builder and start creating your own spiking neural networks. 
            No installation required – everything runs in your browser.
          </p>
          <Link href="/builder">
            <Button variant="primary" size="lg" className="gap-2">
              <Brain className="w-5 h-5" />
              Launch Builder
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <BuilderAccessSection />
    </>
  );
}