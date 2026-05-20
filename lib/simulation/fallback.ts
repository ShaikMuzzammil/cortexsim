// JavaScript fallback for browsers without WebGPU
import { SimulationEngine, NetworkConfig } from "./engine";

export function createFallbackEngine(config: NetworkConfig) {
  return new SimulationEngine(config);
}