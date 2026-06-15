import { NextResponse } from "next/server";
import { find, get, insert } from "@/lib/server/store";
import { requireUser } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import type { ProjectDoc, RunDoc } from "@/lib/server/docs";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const u = await requireUser();
    const p = await get<ProjectDoc>("projects", params.id);
    if (!p || p.ownerId !== u.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const runs = await find<RunDoc>("runs", (r) => r.projectId === params.id);
    runs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ runs });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const u = await requireUser();
    const p = await get<ProjectDoc>("projects", params.id);
    if (!p || p.ownerId !== u.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await req.json();
    const run = await insert<Omit<RunDoc, "id" | "createdAt" | "updatedAt">>(
      "runs",
      {
        projectId: params.id,
        ownerId: u.id,
        label: String(body.label || `Run ${new Date().toLocaleString()}`),
        durationMs: Number(body.durationMs) || 0,
        totalSpikes: Number(body.totalSpikes) || 0,
        meanRate: Number(body.meanRate) || 0,
        config: { ...p.config, ...(body.config || {}) },
        readouts: Array.isArray(body.readouts) ? body.readouts : [],
        notes: body.notes ? String(body.notes) : undefined,
      },
      "r",
    );
    await audit(u.id, "run.create", "run", run.id, { projectId: params.id });
    return NextResponse.json({ run }, { status: 201 });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}
