import type { Guide } from "../types";
import { gettingStarted } from "./getting-started";
import { izhikevichModel } from "./izhikevich-model";
import { networkTopologies } from "./network-topologies";
import { spikingDynamics } from "./spiking-dynamics";
import { spectralAnalysis } from "./spectral-analysis";
import { synchronyMetrics } from "./synchrony-metrics";
import { stdpPlasticity } from "./stdp-plasticity";
import { exportingData } from "./exporting-data";
import { oscillationsRhythms } from "./oscillations-rhythms";
import { balancedNetworks } from "./balanced-networks";
import { informationTheory } from "./information-theory";
import { neuromorphicComputing } from "./neuromorphic-computing";
import { reproducibleResearch } from "./reproducible-research";

// Ordered learning path. The order here is the recommended reading sequence.
export const GUIDES: Guide[] = [
  gettingStarted,
  izhikevichModel,
  spikingDynamics,
  balancedNetworks,
  oscillationsRhythms,
  networkTopologies,
  spectralAnalysis,
  synchronyMetrics,
  informationTheory,
  stdpPlasticity,
  neuromorphicComputing,
  exportingData,
  reproducibleResearch,
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function getAllGuideSlugs(): string[] {
  return GUIDES.map((g) => g.slug);
}

export function getGuidesByCategory(): Array<{ category: string; guides: Guide[] }> {
  const order = ["Basics", "Neuroscience", "Networks", "Analysis", "Workflow"];
  const map = new Map<string, Guide[]>();
  for (const g of GUIDES) {
    const list = map.get(g.category) ?? [];
    list.push(g);
    map.set(g.category, list);
  }
  return order
    .filter((c) => map.has(c))
    .map((category) => ({ category, guides: map.get(category) as Guide[] }));
}

export function getAdjacentGuides(slug: string): { prev?: Guide; next?: Guide } {
  const i = GUIDES.findIndex((g) => g.slug === slug);
  if (i === -1) return {};
  return {
    prev: i > 0 ? GUIDES[i - 1] : undefined,
    next: i < GUIDES.length - 1 ? GUIDES[i + 1] : undefined,
  };
}
