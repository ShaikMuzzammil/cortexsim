import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { recentAudit } from "@/lib/server/audit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const u = await requireUser();
    const url = new URL(req.url);
    const limit = Math.max(1, Math.min(500, Number(url.searchParams.get("limit") || "100")));
    const events = await recentAudit(u.id, limit);
    return NextResponse.json({ events });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}
