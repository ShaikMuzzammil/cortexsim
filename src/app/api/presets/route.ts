import { NextResponse } from "next/server";
import { PRESETS } from "@/lib/presets";

export const dynamic = "force-dynamic";

// Returns the built-in regime presets. A real backend could merge user presets
// from the database here.
export async function GET() {
  return NextResponse.json({ presets: PRESETS });
}
