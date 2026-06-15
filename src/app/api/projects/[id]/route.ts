import { NextResponse } from "next/server";
import { get, update, remove, removeWhere } from "@/lib/server/store";
import { requireUser } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import type { ProjectDoc, RunDoc, NoteDoc, CommentDoc } from "@/lib/server/docs";

export const runtime = "nodejs";

async function loadOwned(id: string, userId: string): Promise<ProjectDoc | null> {
  const p = await get<ProjectDoc>("projects", id);
  if (!p || p.ownerId !== userId) return null;
  return p;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const u = await requireUser();
    const p = await loadOwned(params.id, u.id);
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ project: p });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const u = await requireUser();
    const p = await loadOwned(params.id, u.id);
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await req.json();
    const patch: Partial<ProjectDoc> = {};
    if (typeof body.name === "string") patch.name = body.name;
    if (typeof body.description === "string") patch.description = body.description;
    if (Array.isArray(body.tags)) patch.tags = body.tags.map(String);
    if (typeof body.icon === "string") patch.icon = body.icon;
    if (typeof body.starred === "boolean") patch.starred = body.starred;
    if (body.config && typeof body.config === "object") patch.config = { ...p.config, ...body.config };
    const updated = await update<ProjectDoc>("projects", params.id, patch);
    await audit(u.id, "project.update", "project", params.id);
    return NextResponse.json({ project: updated });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const u = await requireUser();
    const p = await loadOwned(params.id, u.id);
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await remove("projects", params.id);
    await removeWhere<RunDoc>("runs", (r) => r.projectId === params.id);
    await removeWhere<NoteDoc>("notes", (n) => n.projectId === params.id);
    await removeWhere<CommentDoc>("comments", (c) => c.projectId === params.id);
    await audit(u.id, "project.delete", "project", params.id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}
