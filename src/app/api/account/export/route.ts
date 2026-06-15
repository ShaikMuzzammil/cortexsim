import { NextResponse } from "next/server";
import { find } from "@/lib/server/store";
import { requireUser, publicUser } from "@/lib/server/auth";
import type { ProjectDoc, RunDoc, NoteDoc, DatasetDoc, CommentDoc } from "@/lib/server/docs";
import { audit, type AuditEvent } from "@/lib/server/audit";

export const runtime = "nodejs";

export async function GET() {
  try {
    const u = await requireUser();
    const projects = await find<ProjectDoc>("projects", (p) => p.ownerId === u.id);
    const runs = await find<RunDoc>("runs", (r) => r.ownerId === u.id);
    const notes = await find<NoteDoc>("notes", (n) => n.ownerId === u.id);
    const datasets = await find<DatasetDoc>("datasets", (d) => d.ownerId === u.id);
    const comments = await find<CommentDoc>("comments", (c) => c.ownerId === u.id);
    const auditEvents = await find<AuditEvent>("audit", (a) => a.userId === u.id);
    await audit(u.id, "account.export", "user", u.id);
    return NextResponse.json(
      {
        exportedAt: new Date().toISOString(),
        user: publicUser(u),
        counts: {
          projects: projects.length,
          runs: runs.length,
          notes: notes.length,
          datasets: datasets.length,
          comments: comments.length,
          audit: auditEvents.length,
        },
        projects,
        runs,
        notes,
        datasets,
        comments,
        audit: auditEvents,
      },
      {
        headers: {
          "Content-Disposition": `attachment; filename="cortexsim-export-${Date.now()}.json"`,
        },
      },
    );
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}
