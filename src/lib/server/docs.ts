// Shared document shapes for the API + dashboard. Kept here (not in src/types)
// so server-only types live next to the store that owns them.

import type { BaseDoc } from "./store";
import type { SimConfig } from "@/types";

export interface ProjectDoc extends BaseDoc {
  ownerId: string;
  name: string;
  description: string;
  tags: string[];
  icon?: string;
  starred?: boolean;
  config: SimConfig;
}

export interface RunDoc extends BaseDoc {
  projectId: string;
  ownerId: string;
  label: string;
  durationMs: number;
  totalSpikes: number;
  meanRate: number;
  config: SimConfig;
  readouts: Array<{ label: string; value: string }>;
  notes?: string;
}

export interface NoteDoc extends BaseDoc {
  projectId: string;
  ownerId: string;
  title: string;
  body: string;
  pinned?: boolean;
}

export interface CommentDoc extends BaseDoc {
  projectId: string;
  ownerId: string;
  authorName: string;
  body: string;
}

export interface DatasetDoc extends BaseDoc {
  ownerId: string;
  name: string;
  format: "csv" | "json" | "text";
  size: number;
  rows: number;
  preview: string;
  data: string;
  tags: string[];
}

export interface WebhookDoc extends BaseDoc {
  ownerId: string;
  url: string;
  name: string;
  events: string[];
  secret: string;
  active: boolean;
  lastStatus?: number;
  lastDeliveryAt?: string;
  failures?: number;
}

export interface ShareDoc extends BaseDoc {
  ownerId: string;
  projectId: string;
  token: string;
  readonly: boolean;
  expiresAt?: string;
  views: number;
}

export interface PostDoc extends BaseDoc {
  authorId: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  published: boolean;
}
