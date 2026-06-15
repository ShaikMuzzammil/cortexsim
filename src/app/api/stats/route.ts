import { NextResponse } from "next/server";
import { find } from "@/lib/server/store";
import { requireUser } from "@/lib/server/auth";
import { stats as eventStats } from "@/lib/server/events";
import type { ProjectDoc, RunDoc, NoteDoc, DatasetDoc, CommentDoc } from "@/lib/server/docs";
import type { AuditEvent } from "@/lib/server/audit";

export const runtime = "nodejs";

export async function GET() {
  try {
    const u = await requireUser();
    const projects = await find<ProjectDoc>("projects", (p) => p.ownerId === u.id);
    const runs = await find<RunDoc>("runs", (r) => r.ownerId === u.id);
    const notes = await find<NoteDoc>("notes", (n) => n.ownerId === u.id);
    const datasets = await find<DatasetDoc>("datasets", (d) => d.ownerId === u.id);
    const comments = await find<CommentDoc>("comments", (c) => c.ownerId === u.id);
    const events = await find<AuditEvent>("audit", (a) => a.userId === u.id);

    // Build a 14-day time series of runs/notes by day.
    const days: Array<{ day: string; runs: number; notes: number; events: number }> = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ day: key, runs: 0, notes: 0, events: 0 });
    }
    const idxOf = (iso: string) => {
      const k = iso.slice(0, 10);
      for (let i = 0; i < days.length; i++) if (days[i].day === k) return i;
      return -1;
    };
    for (const r of runs) {
      const i = idxOf(r.createdAt);
      if (i >= 0) days[i].runs += 1;
    }
    for (const n of notes) {
      const i = idxOf(n.createdAt);
      if (i >= 0) days[i].notes += 1;
    }
    for (const e of events) {
      const i = idxOf(e.createdAt);
      if (i >= 0) days[i].events += 1;
    }

    const totalSpikes = runs.reduce((acc, r) => acc + (r.totalSpikes || 0), 0);
    const datasetBytes = datasets.reduce((acc, d) => acc + (d.size || 0), 0);

    return NextResponse.json({
      counts: {
        projects: projects.length,
        runs: runs.length,
        notes: notes.length,
        datasets: datasets.length,
        comments: comments.length,
      },
      totals: {
        spikes: totalSpikes,
        datasetBytes,
      },
      series: days,
      live: eventStats(),
      recentProjects: projects.slice(0, 5).map((p) => ({ id: p.id, name: p.name, updatedAt: p.updatedAt })),
      recentRuns: runs
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5)
        .map((r) => ({ id: r.id, projectId: r.projectId, label: r.label, createdAt: r.createdAt, totalSpikes: r.totalSpikes })),
    });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}
