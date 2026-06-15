export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { find, get, update } from "@/lib/server/store";
import type { ShareDoc, ProjectDoc, RunDoc, NoteDoc } from "@/lib/server/docs";

// PUBLIC: no auth. Resolves a share token to a read-only project view.
export async function GET(_: NextRequest, ctx: { params: { token: string } }) {
  const token = ctx.params.token;
  const shares = await find<ShareDoc>("shares", { token });
  const share = shares[0];
  if (!share) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
    return NextResponse.json({ error: "expired" }, { status: 410 });
  }
  const project = await get<ProjectDoc>("projects", share.projectId);
  if (!project) return NextResponse.json({ error: "not found" }, { status: 404 });
  const runs = await find<RunDoc>("runs", { projectId: share.projectId });
  const notes = await find<NoteDoc>("notes", { projectId: share.projectId });
  await update<ShareDoc>("shares", share.id, { views: (share.views || 0) + 1 });
  return NextResponse.json({
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      tags: project.tags,
      config: project.config,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    },
    runs: runs
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((r) => ({
        id: r.id,
        label: r.label,
        totalSpikes: r.totalSpikes,
        meanRate: r.meanRate,
        createdAt: r.createdAt,
        readouts: r.readouts,
      })),
    notes: notes
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((n) => ({ id: n.id, title: n.title, body: n.body, updatedAt: n.updatedAt })),
    share: { views: (share.views || 0) + 1, createdAt: share.createdAt },
  });
}
