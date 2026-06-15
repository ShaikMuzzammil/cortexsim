export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { find, insert, removeWhere } from "@/lib/server/store";
import { audit } from "@/lib/server/audit";
import { generateWebhookSecret } from "@/lib/server/webhooks";
import type { WebhookDoc } from "@/lib/server/docs";

function mask(secret: string): string {
  return secret.slice(0, 12) + "\u2026" + secret.slice(-4);
}

export async function GET() {
  try {
    const user = await requireUser();
    const hooks = await find<WebhookDoc>("webhooks", { ownerId: user.id });
    return NextResponse.json({
      webhooks: hooks.map((h) => ({ ...h, secret: mask(h.secret) })),
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }
    if (!/^https?:\/\//.test(body.url)) {
      return NextResponse.json({ error: "url must start with http(s)://" }, { status: 400 });
    }
    const events = Array.isArray(body.events) && body.events.length ? body.events : ["*"];
    const secret = generateWebhookSecret();
    const hook = await insert<WebhookDoc>("webhooks", {
      ownerId: user.id,
      url: body.url,
      name: body.name || "Webhook",
      events,
      secret,
      active: true,
      failures: 0,
    });
    await audit(user.id, "webhook.create", "webhook", hook.id, { url: hook.url });
    return NextResponse.json({ webhook: hook });
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
    await removeWhere<WebhookDoc>("webhooks", (h) => h.id === id && h.ownerId === user.id);
    await audit(user.id, "webhook.delete", "webhook", id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const m = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : 500 });
  }
}
