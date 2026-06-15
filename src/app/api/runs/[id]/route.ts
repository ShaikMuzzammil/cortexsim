import { NextResponse } from "next/server";
import { get, remove } from "@/lib/server/store";
import { requireUser } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import type { RunDoc } from "@/lib/server/docs";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const u = await requireUser();
    const r = await get<RunDoc>("runs", params.id);
    if (!r || r.ownerId !== u.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ run: r });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const u = await requireUser();
    const r = await get<RunDoc>("runs", params.id);
    if (!r || r.ownerId !== u.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await remove("runs", params.id);
    await audit(u.id, "run.delete", "run", params.id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}
