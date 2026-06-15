import { NextResponse } from "next/server";
import { find } from "@/lib/server/store";
import { requireUser } from "@/lib/server/auth";
import type { ProjectDoc, RunDoc, NoteDoc, DatasetDoc, CommentDoc } from "@/lib/server/docs";

export const runtime = "nodejs";

function has(s: string, q: string): boolean {
  return s.toLowerCase().includes(q);
}

export async function GET(req: Request) {
  try {
    const u = await requireUser();
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").toLowerCase().trim();
    if (!q) return NextResponse.json({ results: [] });

    const projects = await find<ProjectDoc>("projects", (p) => p.ownerId === u.id);
    const runs = await find<RunDoc>("runs", (r) => r.ownerId === u.id);
    const notes = await find<NoteDoc>("notes", (n) => n.ownerId === u.id);
    const datasets = await find<DatasetDoc>("datasets", (d) => d.ownerId === u.id);
    const comments = await find<CommentDoc>("comments", (c) => c.ownerId === u.id);

    const results: Array<{
      type: string;
      id: string;
      title: string;
      snippet: string;
      href: string;
      at: string;
    }> = [];

    for (const p of projects) {
      if (has(p.name, q) || has(p.description, q) || p.tags.some((t) => has(t, q))) {
        results.push({
          type: "project",
          id: p.id,
          title: p.name,
          snippet: p.description.slice(0, 140),
          href: `/app/projects/${p.id}`,
          at: p.updatedAt,
        });
      }
    }
    for (const r of runs) {
      if (has(r.label, q) || (r.notes && has(r.notes, q))) {
        results.push({
          type: "run",
          id: r.id,
          title: r.label,
          snippet: `${r.totalSpikes} spikes \u00b7 ${r.meanRate.toFixed(1)} Hz`,
          href: `/app/projects/${r.projectId}?tab=runs`,
          at: r.createdAt,
        });
      }
    }
    for (const n of notes) {
      if (has(n.title, q) || has(n.body, q)) {
        results.push({
          type: "note",
          id: n.id,
          title: n.title,
          snippet: n.body.slice(0, 140),
          href: `/app/projects/${n.projectId}?tab=notes`,
          at: n.updatedAt,
        });
      }
    }
    for (const d of datasets) {
      if (has(d.name, q) || has(d.preview, q) || d.tags.some((t) => has(t, q))) {
        results.push({
          type: "dataset",
          id: d.id,
          title: d.name,
          snippet: `${d.rows} rows \u00b7 ${d.format}`,
          href: `/app/datasets`,
          at: d.createdAt,
        });
      }
    }
    for (const c of comments) {
      if (has(c.body, q)) {
        results.push({
          type: "comment",
          id: c.id,
          title: "Comment by " + c.authorName,
          snippet: c.body.slice(0, 140),
          href: `/app/projects/${c.projectId}?tab=discussion`,
          at: c.createdAt,
        });
      }
    }
    results.sort((a, b) => b.at.localeCompare(a.at));
    return NextResponse.json({ results: results.slice(0, 50) });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}
