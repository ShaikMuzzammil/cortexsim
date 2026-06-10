import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "CortexSim GODMODE",
    version: "6.0.0",
    persistence: isDbConfigured() ? "mongodb" : "client-only",
    time: new Date().toISOString(),
  });
}
