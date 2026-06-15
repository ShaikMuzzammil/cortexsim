import { NextResponse } from "next/server";
import { createUser, publicUser, setSessionCookie } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim();
    const name = String(body.name || "").trim() || email.split("@")[0] || "User";
    const password = String(body.password || "");
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    const user = await createUser(email, name, password);
    await setSessionCookie(user.id);
    await audit(user.id, "auth.signup", "user", user.id);
    return NextResponse.json({ user: publicUser(user) }, { status: 201 });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json(
      { error: err.message || "Signup failed" },
      { status: err.status || 500 },
    );
  }
}
