import type { TopologyName } from "@/types";

// Sparse adjacency built as per-neuron target lists.
export interface Connectivity {
  targets: Int32Array[]; // outgoing target indices per presynaptic neuron
  delays: Int8Array[]; // matching axonal delay (in steps) per target
}

function emptyLists(N: number): { targets: number[][]; delays: number[][] } {
  const targets: number[][] = new Array(N);
  const delays: number[][] = new Array(N);
  for (let i = 0; i < N; i++) {
    targets[i] = [];
    delays[i] = [];
  }
  return { targets, delays };
}

function finalize(
  targets: number[][],
  delays: number[][],
): Connectivity {
  const N = targets.length;
  const t: Int32Array[] = new Array(N);
  const d: Int8Array[] = new Array(N);
  for (let i = 0; i < N; i++) {
    t[i] = Int32Array.from(targets[i]);
    d[i] = Int8Array.from(delays[i]);
  }
  return { targets: t, delays: d };
}

function randDelay(maxDelay: number, enabled: boolean): number {
  if (!enabled || maxDelay <= 1) return 0;
  return Math.floor(Math.random() * maxDelay);
}

export function buildTopology(
  N: number,
  connectivity: number,
  kind: TopologyName,
  delaysEnabled: boolean,
  maxDelay: number,
): Connectivity {
  const { targets, delays } = emptyLists(N);
  const k = Math.max(1, Math.round(connectivity * N));

  if (kind === "random") {
    for (let i = 0; i < N; i++) {
      for (let c = 0; c < k; c++) {
        const j = (Math.random() * N) | 0;
        if (j === i) continue;
        targets[i].push(j);
        delays[i].push(randDelay(maxDelay, delaysEnabled));
      }
    }
  } else if (kind === "grid") {
    const side = Math.max(1, Math.round(Math.sqrt(N)));
    for (let i = 0; i < N; i++) {
      const x = i % side;
      const y = (i / side) | 0;
      const neigh = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ];
      for (const [nx, ny] of neigh) {
        if (nx < 0 || ny < 0 || nx >= side || ny >= side) continue;
        const j = ny * side + nx;
        if (j >= N || j === i) continue;
        targets[i].push(j);
        delays[i].push(randDelay(maxDelay, delaysEnabled));
      }
    }
  } else if (kind === "smallworld") {
    // Watts-Strogatz style: ring lattice with rewiring.
    const half = Math.max(1, (k / 2) | 0);
    const beta = 0.15;
    for (let i = 0; i < N; i++) {
      for (let off = 1; off <= half; off++) {
        let j = (i + off) % N;
        if (Math.random() < beta) j = (Math.random() * N) | 0;
        if (j === i) continue;
        targets[i].push(j);
        delays[i].push(randDelay(maxDelay, delaysEnabled));
      }
    }
  } else {
    // scale-free: preferential attachment on out-degree.
    const degree = new Float64Array(N).fill(1);
    let total = N;
    for (let i = 0; i < N; i++) {
      for (let c = 0; c < k; c++) {
        let r = Math.random() * total;
        let j = 0;
        while (j < N - 1 && r > degree[j]) {
          r -= degree[j];
          j++;
        }
        if (j === i) continue;
        targets[i].push(j);
        delays[i].push(randDelay(maxDelay, delaysEnabled));
        degree[j] += 1;
        total += 1;
      }
    }
  }

  return finalize(targets, delays);
}
