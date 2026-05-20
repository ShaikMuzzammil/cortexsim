export interface NeuronParams {
  a: number;
  b: number;
  c: number;
  d: number;
  v: number;
  u: number;
  I: number;
}

export interface SynapseParams {
  weight: number;
  delay: number;
  plasticity: "static" | "STDP" | "Tsodyks-Markram";
}

export interface NetworkConfig {
  neurons: {
    id: string;
    type: "Izhikevich" | "LIF";
    count: number;
    params: Partial<NeuronParams>;
    position: [number, number, number];
  }[];
  synapses: {
    id: string;
    source: string;
    target: string;
    params: SynapseParams;
  }[];
  stimuli: {
    id: string;
    target: string;
    type: "constant" | "poisson";
    amplitude: number;
    frequency?: number;
  }[];
  dt: number;
  duration: number;
}

export interface SimulationState {
  time: number;
  voltages: Float32Array;
  spikes: boolean[];
  spikeTimes: number[][];
  synapticWeights: Float32Array;
}

export class SimulationEngine {
  private config: NetworkConfig;
  private state: SimulationState;
  private running: boolean = false;
  private stepCallback?: (state: SimulationState) => void;
  private animationFrameId?: number;
  private totalNeurons: number;
  private neuronOffsets: Map<string, number>;
  private synapseMatrix: number[][];

  constructor(config: NetworkConfig) {
    this.config = config;
    this.totalNeurons = config.neurons.reduce((sum, n) => sum + n.count, 0);
    this.neuronOffsets = new Map();

    let offset = 0;
    for (const group of config.neurons) {
      this.neuronOffsets.set(group.id, offset);
      offset += group.count;
    }

    this.synapseMatrix = Array(this.totalNeurons).fill(null).map(() => Array(this.totalNeurons).fill(0));
    for (const syn of config.synapses) {
      const srcOffset = this.neuronOffsets.get(syn.source)!;
      const tgtOffset = this.neuronOffsets.get(syn.target)!;
      const srcGroup = config.neurons.find(n => n.id === syn.source)!;
      const tgtGroup = config.neurons.find(n => n.id === syn.target)!;

      for (let i = 0; i < srcGroup.count; i++) {
        for (let j = 0; j < tgtGroup.count; j++) {
          this.synapseMatrix[srcOffset + i][tgtOffset + j] = syn.params.weight;
        }
      }
    }

    this.state = {
      time: 0,
      voltages: new Float32Array(this.totalNeurons).fill(-65),
      spikes: Array(this.totalNeurons).fill(false),
      spikeTimes: Array(this.totalNeurons).fill(null).map(() => []),
      synapticWeights: new Float32Array(this.totalNeurons * this.totalNeurons),
    };

    // Initialize weights
    let idx = 0;
    for (let i = 0; i < this.totalNeurons; i++) {
      for (let j = 0; j < this.totalNeurons; j++) {
        this.state.synapticWeights[idx++] = this.synapseMatrix[i][j];
      }
    }
  }

  step(): SimulationState {
    const { dt } = this.config;
    const newVoltages = new Float32Array(this.state.voltages);
    const newSpikes = Array(this.totalNeurons).fill(false);

    // Apply stimuli
    for (const stim of this.config.stimuli) {
      const offset = this.neuronOffsets.get(stim.target)!;
      const group = this.config.neurons.find(n => n.id === stim.target)!;

      for (let i = 0; i < group.count; i++) {
        if (stim.type === "constant") {
          newVoltages[offset + i] += stim.amplitude * dt;
        } else if (stim.type === "poisson") {
          const rate = stim.frequency || 10;
          if (Math.random() < rate * dt / 1000) {
            newVoltages[offset + i] += stim.amplitude;
          }
        }
      }
    }

    // Update neurons (Izhikevich model)
    let neuronIdx = 0;
    for (const group of this.config.neurons) {
      const params = group.params;
      const a = params.a ?? 0.02;
      const b = params.b ?? 0.2;
      const c = params.c ?? -65;
      const d = params.d ?? 8;

      for (let i = 0; i < group.count; i++) {
        const idx = neuronIdx + i;
        let v = newVoltages[idx];
        let u = (params.u ?? b * v) || 0;

        // Synaptic input
        let synapticInput = 0;
        for (let pre = 0; pre < this.totalNeurons; pre++) {
          if (this.state.spikes[pre]) {
            synapticInput += this.synapseMatrix[pre][idx] * 5;
          }
        }

        v += synapticInput;

        if (v >= 30) {
          newSpikes[idx] = true;
          this.state.spikeTimes[idx].push(this.state.time);
          v = c;
          u += d;
        } else {
          const dv = (0.04 * v * v + 5 * v + 140 - u + (params.I || 0)) * dt;
          const du = (a * (b * v - u)) * dt;
          v += dv;
          u += du;
        }

        newVoltages[idx] = v;
      }
      neuronIdx += group.count;
    }

    this.state = {
      time: this.state.time + dt,
      voltages: newVoltages,
      spikes: newSpikes,
      spikeTimes: this.state.spikeTimes,
      synapticWeights: this.state.synapticWeights,
    };

    return this.state;
  }

  start(callback: (state: SimulationState) => void) {
    if (this.running) return;
    this.running = true;
    this.stepCallback = callback;
    this.loop();
  }

  private loop = () => {
    if (!this.running) return;
    const state = this.step();
    this.stepCallback?.(state);
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  pause() {
    this.running = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  reset() {
    this.pause();
    this.state = {
      time: 0,
      voltages: new Float32Array(this.totalNeurons).fill(-65),
      spikes: Array(this.totalNeurons).fill(false),
      spikeTimes: Array(this.totalNeurons).fill(null).map(() => []),
      synapticWeights: this.state.synapticWeights,
    };
  }

  isRunning() {
    return this.running;
  }

  getState() {
    return this.state;
  }

  getTotalNeurons() {
    return this.totalNeurons;
  }

  getNeuronOffsets() {
    return this.neuronOffsets;
  }

  getConfig() {
    return this.config;
  }
}