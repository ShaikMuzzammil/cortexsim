// Studio activity system types. Each of the 35 platform sections is expressed
// as an Activity: a data-driven, interactive in-app workspace with its own
// controls, live canvas output, numeric readouts and tips.

export type SectionStatus = "live" | "beta" | "roadmap";
export type ControlType = "range" | "select" | "toggle" | "button";

export interface Control {
  key: string;
  label: string;
  type: ControlType;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: Array<{ label: string; value: string }>;
  default: number | string | boolean;
  tip?: string;
}

export interface DrawArgs {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
}

export type Params = Record<string, any>;
export type ActState = Record<string, any>;

export interface Readout {
  label: string;
  value: string;
  accent?: string;
}

export interface Activity {
  slug: string;
  id: number;
  title: string;
  group: string;
  status: SectionStatus;
  what: string;
  outcome: string;
  tips: string[];
  controls: Control[];
  animated?: boolean;
  init: (p: Params) => ActState;
  step?: (s: ActState, p: Params, t: number) => void;
  draw: (d: DrawArgs, s: ActState, p: Params, t: number) => void;
  readouts?: (s: ActState, p: Params) => Readout[];
}
