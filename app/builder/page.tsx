export const dynamic = 'force-dynamic';

"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  BarChart3,
  Activity,
  Box,
  X,
  LogIn,
} from "lucide-react";
import dynamicImport from "next/dynamic";
import SimulationControls from "@/components/Builder/SimulationControls";
import NodePalette from "@/components/Builder/NodePalette";
import RasterPlot from "@/components/Charts/RasterPlot";
import VoltageTrace from "@/components/Charts/VoltageTrace";
import Simulation3DView from "@/components/Simulation3DView";
import Button from "@/components/ui/Button";
import { SimulationEngine, NetworkConfig } from "@/lib/simulation/engine";

const FlowCanvas = dynamicImport(() => import("@/components/Builder/FlowCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

function BuilderContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const experimentId = searchParams.get("id");
  const isNew = searchParams.get("new") === "true";

  const [activeTab, setActiveTab] = useState<"raster" | "voltage" | "stats">("raster");
  const [show3D, setShow3D] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [simulationName, setSimulationName] = useState("Untitled Experiment");
  
  const engineRef = useRef<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [spikeTimes, setSpikeTimes] = useState<number[][]>([]);
  const [voltages, setVoltages] = useState<number[]>([]);
  const [times, setTimes] = useState<number[]>([]);
  const [currentVoltages, setCurrentVoltages] = useState<number[]>([]);
  const [currentSpikes, setCurrentSpikes] = useState<boolean[]>([]);
  const [neuronPositions, setNeuronPositions] = useState<[number, number, number][]>([]);
  const [synapses, setSynapses] = useState<{ source: number; target: number; active: boolean }[]>([]);

  useEffect(() => {
    const config: NetworkConfig = {
      neurons: [
        {
          id: "group1",
          type: "Izhikevich",
          count: 20,
          params: { a: 0.02, b: 0.2, c: -65, d: 8, I: 5 },
          position: [0, 0, 0],
        },
        {
          id: "group2",
          type: "Izhikevich",
          count: 15,
          params: { a: 0.02, b: 0.2, c: -65, d: 8, I: 0 },
          position: [2, 0, 0],
        },
      ],
      synapses: [
        {
          id: "syn1",
          source: "group1",
          target: "group2",
          params: { weight: 0.5, delay: 1, plasticity: "static" },
        },
      ],
      stimuli: [
        {
          id: "stim1",
          target: "group1",
          type: "constant",
          amplitude: 10,
        },
      ],
      dt: 0.1,
      duration: 1000,
    };

    const engine = new SimulationEngine(config);
    engineRef.current = engine;

    const positions: [number, number, number][] = [];
    for (let i = 0; i < engine.getTotalNeurons(); i++) {
      positions.push([
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
      ]);
    }
    setNeuronPositions(positions);

    const syn3D: { source: number; target: number; active: boolean }[] = [];
    for (let i = 0; i < 20; i++) {
      for (let j = 20; j < 35; j++) {
        if (Math.random() > 0.7) {
          syn3D.push({ source: i, target: j, active: false });
        }
      }
    }
    setSynapses(syn3D);

    setSpikeTimes(Array(engine.getTotalNeurons()).fill(null).map(() => []));
  }, []);

  const handleSimulationStep = useCallback((state: any) => {
    if (!engineRef.current) return;
    
    setCurrentVoltages(Array.from(state.voltages));
    setCurrentSpikes(state.spikes);
    setTimes((prev) => [...prev.slice(-500), state.time]);
    setVoltages((prev) => [...prev.slice(-500), state.voltages[0]]);
    setSpikeTimes((prev) => {
      const newSpikes = state.spikes.map((spike: boolean, i: number) => {
        if (spike) {
          return [...(prev[i] || []), state.time];
        }
        return prev[i] || [];
      });
      return newSpikes;
    });

    setSynapses((prev) =>
      prev.map((syn) => ({
        ...syn,
        active: state.spikes[syn.source] || false,
      }))
    );
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!engineRef.current) return;
    
    if (isRunning) {
      engineRef.current.pause();
      setIsRunning(false);
    } else {
      engineRef.current.start(handleSimulationStep);
      setIsRunning(true);
    }
  }, [isRunning, handleSimulationStep]);

  const handleStep = useCallback(() => {
    if (!engineRef.current || isRunning) return;
    const state = engineRef.current.step();
    handleSimulationStep(state);
  }, [isRunning, handleSimulationStep]);

  const handleReset = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.reset();
    setIsRunning(false);
    setSpikeTimes(Array(engineRef.current.getTotalNeurons()).fill(null).map(() => []));
    setVoltages([]);
    setTimes([]);
    setCurrentVoltages(Array(engineRef.current.getTotalNeurons()).fill(-65));
    setCurrentSpikes(Array(engineRef.current.getTotalNeurons()).fill(false));
  }, []);

  const handleSave = useCallback(() => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }
    alert("Experiment saved!");
  }, [session]);

  const handleExport = useCallback(() => {
    const data = {
      name: simulationName,
      spikeTimes,
      voltages,
      times,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = simulationName.replace(/\s+/g, "_") + "_data.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [simulationName, spikeTimes, voltages, times]);

  return (
    <div className="min-h-screen pt-16 flex flex-col">
      <div className="h-14 border-b border-neon/10 bg-void/80 backdrop-blur-xl flex items-center px-4 gap-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-neon" />
          <input
            type="text"
            value={simulationName}
            onChange={(e) => setSimulationName(e.target.value)}
            className="bg-transparent border-none text-softWhite font-orbitron text-sm focus:outline-none w-48"
          />
        </div>
        <div className="flex-1" />
        <button
          onClick={() => setShow3D(!show3D)}
          className={`p-2 rounded-lg transition-colors ${show3D ? "bg-neon/20 text-neon" : "text-lavenderGray hover:text-softWhite"}`}
        >
          <Box className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-neon/10 p-4 space-y-4 overflow-y-auto hidden lg:block">
          <NodePalette />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 relative">
            <FlowCanvas />
          </div>

          <div className="h-64 border-t border-neon/10 bg-void/80 backdrop-blur-xl flex">
            <div className="w-48 border-r border-neon/10 p-4 space-y-2">
              <div className="font-orbitron text-xs font-bold text-lavenderGray uppercase tracking-wider mb-3">
                Output
              </div>
              <button
                onClick={() => setActiveTab("raster")}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === "raster" ? "bg-neon/10 text-neon" : "text-lavenderGray hover:text-softWhite hover:bg-white/5"}`}
              >
                <BarChart3 className="w-4 h-4" />
                Raster Plot
              </button>
              <button
                onClick={() => setActiveTab("voltage")}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === "voltage" ? "bg-neon/10 text-neon" : "text-lavenderGray hover:text-softWhite hover:bg-white/5"}`}
              >
                <Activity className="w-4 h-4" />
                Membrane Potential
              </button>
            </div>

            <div className="flex-1 p-4">
              {activeTab === "raster" && <RasterPlot spikeTimes={spikeTimes} timeWindow={500} />}
              {activeTab === "voltage" && <VoltageTrace voltages={voltages} times={times} />}
            </div>
          </div>
        </div>

        <div className="w-72 border-l border-neon/10 p-4 space-y-4 overflow-y-auto hidden xl:block">
          <SimulationControls
            isRunning={isRunning}
            speed={speed}
            onPlayPause={handlePlayPause}
            onStep={handleStep}
            onReset={handleReset}
            onSpeedChange={setSpeed}
            onSave={handleSave}
            onExport={handleExport}
          />

          {show3D && (
            <div className="space-y-2">
              <h3 className="font-orbitron text-sm font-bold text-softWhite uppercase tracking-wider">
                3D View
              </h3>
              <div className="h-48">
                <Simulation3DView
                  neuronPositions={neuronPositions}
                  voltages={currentVoltages}
                  spikes={currentSpikes}
                  synapses={synapses}
                  autoRotate={!isRunning}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-sm mx-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-orbitron text-lg font-bold text-softWhite">
                  Save Experiment
                </h3>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-1 rounded hover:bg-white/5 text-lavenderGray hover:text-softWhite"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-lavenderGray text-sm">
                Saving experiments requires an account. Sign in or create one to store your neural networks.
              </p>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowLoginModal(false)}
                >
                  Cancel
                </Button>
                <a href="/login?callbackUrl=/builder" className="flex-1">
                  <Button variant="primary" size="sm" className="w-full gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BuilderContent />
    </Suspense>
  );
}