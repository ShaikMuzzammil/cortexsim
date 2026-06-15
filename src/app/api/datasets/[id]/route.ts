import { NextResponse } from "next/server";
import { get, remove } from "@/lib/server/store";
import { requireUser } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import type { DatasetDoc } from "@/lib/server/docs";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const u = await requireUser();
    const d = await get<DatasetDoc>("datasets", params.id);
    if (!d || d.ownerId !== u.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ dataset: d });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const u = await requireUser();
    const d = await get<DatasetDoc>("datasets", params.id);
    if (!d || d.ownerId !== u.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await remove("datasets", params.id);
    await audit(u.id, "dataset.delete", "dataset", params.id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}
