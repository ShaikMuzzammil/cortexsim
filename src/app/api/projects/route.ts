import { NextResponse } from "next/server";
import { find, insert } from "@/lib/server/store";
import { requireUser } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import { DEFAULTS } from "@/lib/engine/models";
import type { ProjectDoc } from "@/lib/server/docs";
import type { SimConfig } from "@/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const u = await requireUser();
    const list = await find<ProjectDoc>("projects", (p) => p.ownerId === u.id);
    list.sort((a, b) => (a.starred === b.starred ? b.updatedAt.localeCompare(a.updatedAt) : a.starred ? -1 : 1));
    return NextResponse.json({ projects: list });
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
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const project = await insert<Omit<ProjectDoc, "id" | "createdAt" | "updatedAt">>(
      "projects",
      {
        ownerId: u.id,
        name,
        description: String(body.description || ""),
        tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
        icon: body.icon ? String(body.icon) : undefined,
        starred: false,
        config: { ...DEFAULTS, ...(body.config || {}) } as SimConfig,
      },
      "p",
    );
    await audit(u.id, "project.create", "project", project.id, { name });
    return NextResponse.json({ project }, { status: 201 });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}
