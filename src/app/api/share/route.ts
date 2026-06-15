export const runtime = "nodejs";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { find, insert, removeWhere, get } from "@/lib/server/store";
import { audit } from "@/lib/server/audit";
import type { ShareDoc, ProjectDoc } from "@/lib/server/docs";

export async function GET() {
  try {
    const user = await requireUser();
    const shares = await find<ShareDoc>("shares", { ownerId: user.id });
    return NextResponse.json({ shares });
  } catch (e) {
    const m = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    if (!body.projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });
    const project = await get<ProjectDoc>("projects", body.projectId);
    if (!project || project.ownerId !== user.id) {
      return NextResponse.json({ error: "project not found" }, { status: 404 });
    }
    const token = "cxs_" + crypto.randomBytes(18).toString("base64url");
    const share = await insert<ShareDoc>("shares", {
      ownerId: user.id,
      projectId: body.projectId,
      token,
      readonly: true,
      views: 0,
      expiresAt: body.expiresAt,
    });
    await audit(user.id, "share.create", "project", body.projectId, { token });
    return NextResponse.json({ share });
  } catch (e) {
    const m = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await removeWhere<ShareDoc>("shares", (s) => s.id === id && s.ownerId === user.id);
    await audit(user.id, "share.delete", "share", id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const m = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : 500 });
  }
}
