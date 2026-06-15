export const runtime = "nodejs";
import { NextResponse } from "next/server";

interface Entry { version: string; date: string; tags: string[]; items: string[]; }

const CHANGELOG: Entry[] = [
  {
    version: "1.4.0",
    date: "2026-06-13",
    tags: ["feature", "backend"],
    items: [
      "Outgoing webhooks with HMAC SHA-256 signatures",
      "Public read-only share links for projects",
      "Run comparison endpoint (compare 2-4 runs)",
      "Workspace insights: tag distribution, hourly/weekday activity, top projects",
      "Bundled Public API docs page",
    ],
  },
  {
    version: "1.3.0",
    date: "2026-06-13",
    tags: ["feature", "auth"],
    items: [
      "Authenticated workspace at /app",
      "15+ REST endpoints with bearer-token + cookie auth",
      "File-backed JSON store",
      "SSE realtime + toast notifications",
      "Cmd+K command palette with live search",
      "Account export, audit log, API tokens, dashboard analytics",
    ],
  },
  {
    version: "1.2.0",
    date: "2026-06-12",
    tags: ["feature", "studio"],
    items: [
      "Shared SNN engine with real-time engineBus",
      "35 modules across 6 categories",
      "PNG and JSON exports across activities",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-06-11",
    tags: ["refresh"],
    items: ["Brand refresh, mind-map navigation, dynamics activity"],
  },
  {
    version: "1.0.0",
    date: "2026-06-10",
    tags: ["launch"],
    items: ["Initial CortexSim public launch"],
  },
];

export async function GET() {
  return NextResponse.json({ entries: CHANGELOG });
}
