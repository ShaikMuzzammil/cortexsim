export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { find } from "@/lib/server/store";
import type { ProjectDoc, RunDoc, NoteDoc, CommentDoc, DatasetDoc } from "@/lib/server/docs";
import type { AuditEvent } from "@/lib/server/audit";

export async function GET() {
  try {
    const user = await requireUser();
    const [projects, runs, notes, comments, datasets, audit] = await Promise.all([
      find<ProjectDoc>("projects", { ownerId: user.id }),
      find<RunDoc>("runs", { ownerId: user.id }),
      find<NoteDoc>("notes", { ownerId: user.id }),
      find<CommentDoc>("comments", { ownerId: user.id }),
      find<DatasetDoc>("datasets", { ownerId: user.id }),
      find<AuditEvent>("audit", { userId: user.id }),
    ]);

    // Tag distribution (top 20).
    const tagCounts: Record<string, number> = {};
    for (const p of projects) {
      for (const t of p.tags || []) tagCounts[t] = (tagCounts[t] || 0) + 1;
    }
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    // Runs per project (top 12).
    const runsByProject: Record<string, number> = {};
    for (const r of runs) runsByProject[r.projectId] = (runsByProject[r.projectId] || 0) + 1;
    const topProjects = projects
      .map((p) => ({ id: p.id, name: p.name, runs: runsByProject[p.id] || 0 }))
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 12);

    // Spikes per project (top 12).
    const spikesByProject: Record<string, number> = {};
    for (const r of runs) spikesByProject[r.projectId] = (spikesByProject[r.projectId] || 0) + r.totalSpikes;
    const topSpikes = projects
      .map((p) => ({ id: p.id, name: p.name, spikes: spikesByProject[p.id] || 0 }))
      .filter((p) => p.spikes > 0)
      .sort((a, b) => b.spikes - a.spikes)
      .slice(0, 12);

    // Action histogram.
    const actionCounts: Record<string, number> = {};
    for (const e of audit) actionCounts[e.action] = (actionCounts[e.action] || 0) + 1;
    const topActions = Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([action, count]) => ({ action, count }));

    // Hourly activity histogram (UTC, 24 buckets).
    const hourly = Array.from({ length: 24 }, () => 0);
    for (const e of audit) {
      const h = new Date(e.createdAt).getUTCHours();
      if (Number.isFinite(h)) hourly[h] += 1;
    }

    // Weekday histogram (0=Sun).
    const weekdays = Array.from({ length: 7 }, () => 0);
    for (const e of audit) {
      const w = new Date(e.createdAt).getUTCDay();
      if (Number.isFinite(w)) weekdays[w] += 1;
    }

    // Dataset format breakdown.
    const formatCounts: Record<string, number> = { csv: 0, json: 0, text: 0 };
    let datasetBytes = 0;
    for (const d of datasets) {
      formatCounts[d.format] = (formatCounts[d.format] || 0) + 1;
      datasetBytes += d.size;
    }

    return NextResponse.json({
      totals: {
        projects: projects.length,
        runs: runs.length,
        notes: notes.length,
        comments: comments.length,
        datasets: datasets.length,
        events: audit.length,
        spikes: runs.reduce((a, r) => a + r.totalSpikes, 0),
        datasetBytes,
      },
      topTags,
      topProjects,
      topSpikes,
      topActions,
      hourly,
      weekdays,
      formatCounts,
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : 500 });
  }
}
