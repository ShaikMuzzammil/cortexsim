import { NextResponse } from "next/server";
import { get, remove, update } from "@/lib/server/store";
import { requireUser } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import type { NoteDoc } from "@/lib/server/docs";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const u = await requireUser();
    const n = await get<NoteDoc>("notes", params.id);
    if (!n || n.ownerId !== u.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await req.json();
    const patch: Partial<NoteDoc> = {};
    if (typeof body.title === "string") patch.title = body.title;
    if (typeof body.body === "string") patch.body = body.body;
    if (typeof body.pinned === "boolean") patch.pinned = body.pinned;
    const updated = await update<NoteDoc>("notes", params.id, patch);
    await audit(u.id, "note.update", "note", params.id);
    return NextResponse.json({ note: updated });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const u = await requireUser();
    const n = await get<NoteDoc>("notes", params.id);
    if (!n || n.ownerId !== u.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await remove("notes", params.id);
    await audit(u.id, "note.delete", "note", params.id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}
