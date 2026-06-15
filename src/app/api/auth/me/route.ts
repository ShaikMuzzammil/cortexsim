import { NextResponse } from "next/server";
import { currentUser, publicUser } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function GET() {
  const u = await currentUser();
  if (!u) return NextResponse.json({ user: null });
  return NextResponse.json({ user: publicUser(u) });
}
