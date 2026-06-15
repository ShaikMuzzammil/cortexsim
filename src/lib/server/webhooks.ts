import crypto from "crypto";
import { find, update } from "./store";
import type { WebhookDoc } from "./docs";

export async function deliverWebhooks(
  userId: string,
  event: { type: string; [key: string]: unknown },
): Promise<void> {
  const hooks = await find<WebhookDoc>("webhooks", { ownerId: userId });
  for (const hook of hooks) {
    if (!hook.active) continue;
    if (hook.events.length && !hook.events.includes("*") && !hook.events.includes(event.type)) continue;
    void postOne(hook, event);
  }
}

async function postOne(hook: WebhookDoc, event: object): Promise<void> {
  const body = JSON.stringify({ id: crypto.randomUUID(), deliveredAt: new Date().toISOString(), event });
  const sig = crypto.createHmac("sha256", hook.secret).update(body).digest("hex");
  try {
    const res = await fetch(hook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CortexSim-Signature": "sha256=" + sig,
        "X-CortexSim-Hook-Id": hook.id,
        "User-Agent": "CortexSim-Webhook/1.0",
      },
      body,
    });
    await update<WebhookDoc>("webhooks", hook.id, {
      lastStatus: res.status,
      lastDeliveryAt: new Date().toISOString(),
      failures: res.ok ? 0 : (hook.failures || 0) + 1,
    });
  } catch {
    await update<WebhookDoc>("webhooks", hook.id, {
      lastStatus: 0,
      lastDeliveryAt: new Date().toISOString(),
      failures: (hook.failures || 0) + 1,
    });
  }
}

export function generateWebhookSecret(): string {
  return "whsec_" + crypto.randomBytes(24).toString("hex");
}
