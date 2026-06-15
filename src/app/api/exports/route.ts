export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { exportManifest, EXPORT_GROUPS } from "@/lib/export/formats";

// Public manifest describing every export format the studio can produce.
export async function GET() {
  return NextResponse.json({
    groups: EXPORT_GROUPS,
    formats: exportManifest(),
    count: exportManifest().length,
  });
}
