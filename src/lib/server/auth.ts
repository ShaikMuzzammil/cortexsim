// Auth primitives for the API: password hashing (scrypt), HMAC-signed session
// tokens, and cookie helpers. No external deps \u2014 just node:crypto + the
// next/headers cookie store.

import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";
import { cookies, headers } from "next/headers";
import { find, get, insert, type BaseDoc } from "./store";

const SESSION_COOKIE = "cortexsim_sid";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const SECRET = process.env.CORTEXSIM_SECRET || "dev-secret-change-me";

export interface UserDoc extends BaseDoc {
  email: string;
  name: string;
  passwordHash: string;
  passwordSalt: string;
  role: "user" | "admin";
}

export interface ApiToken extends BaseDoc {
  userId: string;
  name: string;
  token: string;
  lastUsedAt?: string;
}

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  try {
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    if (candidate.length !== expected.length) return false;
    return timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function makeToken(userId: string): string {
  const body = JSON.stringify({ u: userId, e: Date.now() + TOKEN_TTL_MS });
  const b64 = Buffer.from(body).toString("base64url");
  return `${b64}.${sign(b64)}`;
}

export function readToken(token: string | undefined | null): { userId: string } | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (sign(body) !== sig) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (typeof parsed.u !== "string" || typeof parsed.e !== "number") return null;
    if (parsed.e < Date.now()) return null;
    return { userId: parsed.u };
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string): Promise<void> {
  const token = makeToken(userId);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie(): void {
  cookies().set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function currentUser(): Promise<UserDoc | null> {
  // Allow Authorization: Bearer <apiToken> as well as the cookie.
  const authz = headers().get("authorization") || "";
  if (authz.startsWith("Bearer ")) {
    const tok = authz.slice("Bearer ".length).trim();
    const found = await find<ApiToken>("tokens", (t) => t.token === tok);
    if (found[0]) return get<UserDoc>("users", found[0].userId);
  }
  const sid = cookies().get(SESSION_COOKIE)?.value;
  const parsed = readToken(sid);
  if (!parsed) return null;
  return get<UserDoc>("users", parsed.userId);
}

export async function requireUser(): Promise<UserDoc> {
  const u = await currentUser();
  if (!u) {
    const err = new Error("Unauthorized") as Error & { status?: number };
    err.status = 401;
    throw err;
  }
  return u;
}

export function publicUser(u: UserDoc): { id: string; email: string; name: string; role: string; createdAt: string } {
  return { id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt };
}

export async function createUser(email: string, name: string, password: string): Promise<UserDoc> {
  const existing = await find<UserDoc>("users", (u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing.length > 0) {
    const err = new Error("Email already registered") as Error & { status?: number };
    err.status = 409;
    throw err;
  }
  const { hash, salt } = hashPassword(password);
  const totalUsers = (await find<UserDoc>("users")).length;
  const u = await insert<Omit<UserDoc, "id" | "createdAt" | "updatedAt">>(
    "users",
    {
      email: email.toLowerCase(),
      name,
      passwordHash: hash,
      passwordSalt: salt,
      role: totalUsers === 0 ? "admin" : "user",
    },
    "u",
  );
  return u as UserDoc;
}
