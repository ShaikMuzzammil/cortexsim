// activeViewBus: a tiny module-level handoff for the currently active activity.
// ActivityRunner writes its canvas + readouts here; the workspace's Export
// button reads from here. This avoids passing refs through context every frame.

import type { Readout } from "./types";

export interface ActiveView {
  slug: string | null;
  title: string | null;
  canvas: HTMLCanvasElement | null;
  readouts: Readout[];
  params: Record<string, number | string | boolean>;
}

export const activeView: ActiveView = {
  slug: null,
  title: null,
  canvas: null,
  readouts: [],
  params: {},
};
