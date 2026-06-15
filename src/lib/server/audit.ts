// Append-only audit log of meaningful actions taken by users. Also fans out
// each event to the SSE event bus AND to any registered outbound webhooks.

import { insert, find, type BaseDoc } from "./store";
import { publish } from "./events";
import { deliverWebhooks } from "./webhooks";

export interface AuditEvent extends BaseDoc {
  userId: string;
  action: string;
  target: string;
  targetId?: string;
  meta?: Record<string, unknown>;
}

export async function audit(
  userId: string,
  action: string,
  target: string,
  targetId?: string,
  meta?: Record<string, unknown>,
): Promise<AuditEvent> {
  const ev = await insert<Omit<AuditEvent, "id" | "createdAt" | "updatedAt">>(
    "audit",
    { userId, action, target, targetId, meta },
    "a",
  );
  const payload = { type: "audit", userId, action, target, targetId, at: ev.createdAt };
  publish(payload);
  // Fan out to outbound webhooks (best effort, fire and forget).
  if (action !== "webhook.test") {
    void deliverWebhooks(userId, { type: action, target, targetId, at: ev.createdAt, meta });
  }
  return ev as AuditEvent;
}

export async function recentAudit(userId: string, limit = 50): Promise<AuditEvent[]> {
  const all = await find<AuditEvent>("audit", (e) => e.userId === userId);
  return all.slice(0, limit);
}
