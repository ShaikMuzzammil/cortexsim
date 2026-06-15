export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { get } from "@/lib/server/store";
import { deliverWebhooks } from "@/lib/server/webhooks";
import { audit } from "@/lib/server/audit";
import type { WebhookDoc } from "@/lib/server/docs";

export async function POST(_: NextRequest, ctx: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const hook = await get<WebhookDoc>("webhooks", ctx.params.id);
    if (!hook || hook.ownerId !== user.id) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    await deliverWebhooks(user.id, { type: "webhook.test", message: "Hello from CortexSim", hookId: hook.id });
    await audit(user.id, "webhook.test", "webhook", hook.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const m = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : 500 });
  }
}
