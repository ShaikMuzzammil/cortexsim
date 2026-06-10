// Content model for the Learn / Guides system.
// Guides are authored as structured block arrays so they can be rendered
// consistently, searched, and statically generated at build time.

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; lang?: string; code: string }
  | { type: "tip"; text: string }
  | { type: "warn"; text: string }
  | { type: "math"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "kbd"; keys: Array<{ combo: string; action: string }> };

export type GuideCategory =
  | "Basics"
  | "Neuroscience"
  | "Networks"
  | "Analysis"
  | "Workflow";

export interface Guide {
  slug: string;
  title: string;
  category: GuideCategory;
  summary: string;
  readingTimeMin: number;
  updated: string;
  blocks: GuideBlock[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  related?: string[];
}

export interface Tip {
  title: string;
  body: string;
  category: string;
}
