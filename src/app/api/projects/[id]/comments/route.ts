import { NextResponse } from "next/server";
import { find, get, insert } from "@/lib/server/store";
import { requireUser } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import { publish } from "@/lib/server/events";
import type { ProjectDoc, CommentDoc } from "@/lib/server/docs";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const u = await requireUser();
    const p = await get<ProjectDoc>("projects", params.id);
    if (!p || p.ownerId !== u.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const comments = await find<CommentDoc>("comments", (c) => c.projectId === params.id);
    comments.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return NextResponse.json({ comments });
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
    const text = String(body.body || "").trim();
    if (!text) return NextResponse.json({ error: "Body required" }, { status: 400 });
    const comment = await insert<Omit<CommentDoc, "id" | "createdAt" | "updatedAt">>(
      "comments",
      { projectId: params.id, ownerId: u.id, authorName: u.name, body: text },
      "c",
    );
    publish({ type: "comment.create", projectId: params.id, commentId: comment.id, authorName: u.name });
    await audit(u.id, "comment.create", "comment", comment.id, { projectId: params.id });
    return NextResponse.json({ comment }, { status: 201 });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}
