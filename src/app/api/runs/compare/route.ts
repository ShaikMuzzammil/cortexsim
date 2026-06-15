export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { get } from "@/lib/server/store";
import type { RunDoc } from "@/lib/server/docs";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const idsParam = req.nextUrl.searchParams.get("ids") || "";
    const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
    if (ids.length < 2 || ids.length > 4) {
      return NextResponse.json({ error: "compare 2 to 4 runs" }, { status: 400 });
    }
    const runs = (await Promise.all(ids.map((id) => get<RunDoc>("runs", id))))
      .filter((r): r is RunDoc => Boolean(r) && (r as RunDoc).ownerId === user.id);
    if (runs.length < 2) return NextResponse.json({ error: "not found" }, { status: 404 });
    // Build a diff table of config fields.
    const cfgKeys = new Set<string>();
    for (const r of runs) for (const k of Object.keys(r.config)) cfgKeys.add(k);
    const diff = Array.from(cfgKeys).map((k) => ({
      key: k,
      values: runs.map((r) => (r.config as Record<string, unknown>)[k] ?? null),
    }));
    return NextResponse.json({
      runs: runs.map((r) => ({
        id: r.id,
        label: r.label,
        totalSpikes: r.totalSpikes,
        meanRate: r.meanRate,
        durationMs: r.durationMs,
        readouts: r.readouts,
        createdAt: r.createdAt,
        projectId: r.projectId,
      })),
      diff,
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : 500 });
  }
}
