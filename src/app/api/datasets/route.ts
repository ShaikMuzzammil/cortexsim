import { NextResponse } from "next/server";
import { find, insert } from "@/lib/server/store";
import { requireUser } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import type { DatasetDoc } from "@/lib/server/docs";

export const runtime = "nodejs";

function countRows(format: string, data: string): number {
  if (format === "csv") return data.split(/\r?\n/).filter((l) => l.trim().length > 0).length;
  if (format === "json") {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.length : 1;
    } catch {
      return 0;
    }
  }
  return data.split(/\r?\n/).length;
}

export async function GET() {
  try {
    const u = await requireUser();
    const list = await find<DatasetDoc>("datasets", (d) => d.ownerId === u.id);
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    // Strip full data from list view.
    return NextResponse.json({
      datasets: list.map((d) => ({ ...d, data: "" })),
    });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}

export async function POST(req: Request) {
  try {
    const u = await requireUser();
    const body = await req.json();
    const name = String(body.name || "").trim();
    const data = String(body.data || "");
    const format = (body.format === "csv" || body.format === "json" ? body.format : "text") as DatasetDoc["format"];
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    if (!data) return NextResponse.json({ error: "Data required" }, { status: 400 });
    const size = data.length;
    const rows = countRows(format, data);
    const ds = await insert<Omit<DatasetDoc, "id" | "createdAt" | "updatedAt">>(
      "datasets",
      {
        ownerId: u.id,
        name,
        format,
        size,
        rows,
        preview: data.slice(0, 2000),
        data,
        tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      },
      "d",
    );
    await audit(u.id, "dataset.create", "dataset", ds.id, { name, format, rows });
    return NextResponse.json({ dataset: { ...ds, data: "" } }, { status: 201 });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}
