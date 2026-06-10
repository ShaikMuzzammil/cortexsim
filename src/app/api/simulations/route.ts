import { NextResponse } from "next/server";
import { getDb, isDbConfigured } from "@/lib/db/mongodb";
import type { SavedSimulation } from "@/types";

export const dynamic = "force-dynamic";

// GET /api/simulations -> list saved experiments (newest first).
export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ persistence: "client-only", simulations: [] });
  }
  try {
    const db = await getDb();
    if (!db) return NextResponse.json({ simulations: [] });
    const docs = await db
      .collection<SavedSimulation>("simulations")
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    return NextResponse.json({ persistence: "mongodb", simulations: docs });
  } catch (err) {
    return NextResponse.json(
      { error: "db_error", message: String(err) },
      { status: 500 },
    );
  }
}

// POST /api/simulations -> save a new experiment.
export async function POST(req: Request) {
  const body = (await req.json()) as Partial<SavedSimulation>;
  if (!body || !body.config || !body.name) {
    return NextResponse.json(
      { error: "bad_request", message: "name and config are required" },
      { status: 400 },
    );
  }
  const record: SavedSimulation = {
    name: body.name,
    config: body.config,
    notes: body.notes || "",
    metricsSnapshot: body.metricsSnapshot,
    createdAt: new Date().toISOString(),
  };
  if (!isDbConfigured()) {
    // No database configured: echo back so the client can store locally.
    return NextResponse.json({ persistence: "client-only", saved: record });
  }
  try {
    const db = await getDb();
    if (!db) return NextResponse.json({ saved: record });
    const result = await db.collection("simulations").insertOne(record);
    return NextResponse.json({
      persistence: "mongodb",
      saved: { ...record, _id: String(result.insertedId) },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "db_error", message: String(err) },
      { status: 500 },
    );
  }
}
