import { NextResponse } from "next/server";
import { find } from "@/lib/server/store";
import { publicUser, setSessionCookie, verifyPassword, type UserDoc } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    const users = await find<UserDoc>("users", (u) => u.email.toLowerCase() === email);
    const user = users[0];
    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    await setSessionCookie(user.id);
    await audit(user.id, "auth.login", "user", user.id);
    return NextResponse.json({ user: publicUser(user) });
  } catch (e) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
