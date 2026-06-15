import { NextResponse } from "next/server";
import { clearSessionCookie, currentUser } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";

export const runtime = "nodejs";

export async function POST() {
  const u = await currentUser();
  clearSessionCookie();
  if (u) await audit(u.id, "auth.logout", "user", u.id);
  return NextResponse.json({ ok: true });
}
