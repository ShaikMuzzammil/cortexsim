import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, isDbConfigured } from "@/lib/db/mongodb";

export const dynamic = "force-dynamic";

interface Ctx {
  params: { id: string };
}

// GET /api/simulations/:id -> fetch one saved experiment.
export async function GET(_req: Request, ctx: Ctx) {
  if (!isDbConfigured()) {
    return NextResponse.json({ persistence: "client-only", simulation: null });
  }
  try {
    const db = await getDb();
    if (!db) return NextResponse.json({ simulation: null });
    const doc = await db
      .collection("simulations")
      .findOne({ _id: new ObjectId(ctx.params.id) });
    return NextResponse.json({ simulation: doc });
  } catch (err) {
    return NextResponse.json(
      { error: "db_error", message: String(err) },
      { status: 500 },
    );
  }
}

// DELETE /api/simulations/:id -> remove a saved experiment.
export async function DELETE(_req: Request, ctx: Ctx) {
  if (!isDbConfigured()) {
    return NextResponse.json({ persistence: "client-only", deleted: false });
  }
  try {
    const db = await getDb();
    if (!db) return NextResponse.json({ deleted: false });
    await db
      .collection("simulations")
      .deleteOne({ _id: new ObjectId(ctx.params.id) });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json(
      { error: "db_error", message: String(err) },
      { status: 500 },
    );
  }
}
