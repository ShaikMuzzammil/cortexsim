declare global {
  interface Navigator {
    gpu?: any;
  }
}

export async function initWebGPU() {
  if (!navigator.gpu) {
    throw new Error("WebGPU not supported");
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error("Failed to get WebGPU adapter");
  }

  const device = await adapter.requestDevice();
  return device;
}

export const izhikevichShader = `
  struct Neuron {
    v: f32,
    u: f32,
    a: f32,
    b: f32,
    c: f32,
    d: f32,
    I: f32,
    spike: f32,
  };

  @group(0) @binding(0)
  var<storage, read_write> neurons: array<Neuron>;

  @group(0) @binding(1)
  var<storage, read> synapses: array<f32>;

  @group(0) @binding(2)
  var<storage, read> stimuli: array<f32>;

  @compute @workgroup_size(64)
  fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let idx = global_id.x;
    if (idx >= arrayLength(&neurons)) {
      return;
    }

    var neuron = neurons[idx];
    let dt = 0.1;
    let n = arrayLength(&neurons);

    var synapticInput = 0.0;
    for (var i = 0u; i < n; i = i + 1u) {
      if (neurons[i].spike > 0.5) {
        synapticInput += synapses[i * n + idx] * 5.0;
      }
    }

    neuron.v += stimuli[idx] + synapticInput;

    if (neuron.v >= 30.0) {
      neuron.spike = 1.0;
      neuron.v = neuron.c;
      neuron.u += neuron.d;
    } else {
      let dv = (0.04 * neuron.v * neuron.v + 5.0 * neuron.v + 140.0 - neuron.u + neuron.I) * dt;
      let du = (neuron.a * (neuron.b * neuron.v - neuron.u)) * dt;
      neuron.v += dv;
      neuron.u += du;
      neuron.spike = 0.0;
    }

    neurons[idx] = neuron;
  }
`;

export async function createSimulationPipeline(device: any, neuronCount: number) {
  const shaderModule = device.createShaderModule({
    code: izhikevichShader,
  });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: 8, buffer: { type: "storage" } },
      { binding: 1, visibility: 8, buffer: { type: "read-only-storage" } },
      { binding: 2, visibility: 8, buffer: { type: "read-only-storage" } },
    ],
  });

  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  const pipeline = device.createComputePipeline({
    layout: pipelineLayout,
    compute: { module: shaderModule, entryPoint: "main" },
  });

  return { pipeline, bindGroupLayout };
}