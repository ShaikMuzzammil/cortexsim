import { NextResponse } from "next/server";
import { find, get, insert } from "@/lib/server/store";
import { requireUser } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import type { ProjectDoc, NoteDoc } from "@/lib/server/docs";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const u = await requireUser();
    const p = await get<ProjectDoc>("projects", params.id);
    if (!p || p.ownerId !== u.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const notes = await find<NoteDoc>("notes", (n) => n.projectId === params.id);
    notes.sort((a, b) => (a.pinned === b.pinned ? b.updatedAt.localeCompare(a.updatedAt) : a.pinned ? -1 : 1));
    return NextResponse.json({ notes });
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
    const title = String(body.title || "").trim();
    const text = String(body.body || "");
    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });
    const note = await insert<Omit<NoteDoc, "id" | "createdAt" | "updatedAt">>(
      "notes",
      { projectId: params.id, ownerId: u.id, title, body: text, pinned: !!body.pinned },
      "n",
    );
    await audit(u.id, "note.create", "note", note.id, { projectId: params.id });
    return NextResponse.json({ note }, { status: 201 });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}
