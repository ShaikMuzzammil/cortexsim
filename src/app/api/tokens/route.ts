import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { find, insert, remove, get } from "@/lib/server/store";
import { requireUser, type ApiToken } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";

export const runtime = "nodejs";

export async function GET() {
  try {
    const u = await requireUser();
    const list = await find<ApiToken>("tokens", (t) => t.userId === u.id);
    // Hide the secret middle of the token so it's not displayed in full again.
    return NextResponse.json({
      tokens: list.map((t) => ({ ...t, token: t.token.slice(0, 8) + "\u2026" + t.token.slice(-4) })),
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
    const name = String(body.name || "Untitled token").trim();
    const token = "cx_" + randomBytes(24).toString("hex");
    const created = await insert<Omit<ApiToken, "id" | "createdAt" | "updatedAt">>(
      "tokens",
      { userId: u.id, name, token },
      "t",
    );
    await audit(u.id, "token.create", "token", created.id, { name });
    // Return the plaintext token ONCE so it can be copied.
    return NextResponse.json({ token: created }, { status: 201 });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const u = await requireUser();
    const url = new URL(req.url);
    const id = url.searchParams.get("id") || "";
    const t = await get<ApiToken>("tokens", id);
    if (!t || t.userId !== u.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await remove("tokens", id);
    await audit(u.id, "token.delete", "token", id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json({ error: err.message || "failed" }, { status: err.status || 500 });
  }
}
