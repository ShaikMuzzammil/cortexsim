// File-backed JSON collection store. Persists each collection to a JSON file
// under .cortexsim-db at the project root so the whole app keeps working in
// development without a MongoDB instance. The interface intentionally mirrors
// a tiny subset of a NoSQL document store: find, get, insert, update, remove.
//
// All writes go through a per-collection mutex (in-memory) to avoid concurrent
// write loss. This is fine for a single Node process. In production you'd swap
// the implementation for Mongo via the same surface area.

import { promises as fs } from "node:fs";
import path from "node:path";

const DB_DIR = path.join(process.cwd(), ".cortexsim-db");
const locks = new Map<string, Promise<void>>();

async function ensureDir(): Promise<void> {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
  } catch {}
}

function file(collection: string): string {
  return path.join(DB_DIR, `${collection}.json`);
}

async function readAll<T>(collection: string): Promise<T[]> {
  await ensureDir();
  try {
    const raw = await fs.readFile(file(collection), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function writeAll<T>(collection: string, docs: T[]): Promise<void> {
  await ensureDir();
  await fs.writeFile(file(collection), JSON.stringify(docs, null, 2), "utf8");
}

async function withLock<T>(collection: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(collection) || Promise.resolve();
  let release: () => void = () => {};
  const next = new Promise<void>((r) => (release = r));
  locks.set(collection, prev.then(() => next));
  await prev;
  try {
    return await fn();
  } finally {
    release();
  }
}

export interface BaseDoc {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export function newId(prefix = ""): string {
  const r = Math.random().toString(36).slice(2, 10);
  const t = Date.now().toString(36);
  return prefix ? `${prefix}_${t}${r}` : `${t}${r}`;
}

export async function find<T extends BaseDoc>(
  collection: string,
  where?: (doc: T) => boolean,
): Promise<T[]> {
  const docs = await readAll<T>(collection);
  return where ? docs.filter(where) : docs;
}

export async function get<T extends BaseDoc>(
  collection: string,
  id: string,
): Promise<T | null> {
  const docs = await readAll<T>(collection);
  return docs.find((d) => d.id === id) || null;
}

export async function insert<T extends Omit<BaseDoc, "id" | "createdAt" | "updatedAt">>(
  collection: string,
  data: T,
  idPrefix?: string,
): Promise<T & BaseDoc> {
  return withLock(collection, async () => {
    const docs = await readAll<T & BaseDoc>(collection);
    const now = new Date().toISOString();
    const doc: T & BaseDoc = {
      ...(data as object),
      id: newId(idPrefix),
      createdAt: now,
      updatedAt: now,
    } as T & BaseDoc;
    docs.unshift(doc);
    await writeAll(collection, docs);
    return doc;
  });
}

export async function update<T extends BaseDoc>(
  collection: string,
  id: string,
  patch: Partial<T>,
): Promise<(T & BaseDoc) | null> {
  return withLock(collection, async () => {
    const docs = await readAll<T & BaseDoc>(collection);
    const idx = docs.findIndex((d) => d.id === id);
    if (idx < 0) return null;
    const merged: T & BaseDoc = {
      ...docs[idx],
      ...patch,
      id: docs[idx].id,
      createdAt: docs[idx].createdAt,
      updatedAt: new Date().toISOString(),
    } as T & BaseDoc;
    docs[idx] = merged;
    await writeAll(collection, docs);
    return merged;
  });
}

export async function remove(collection: string, id: string): Promise<boolean> {
  return withLock(collection, async () => {
    const docs = await readAll<BaseDoc>(collection);
    const next = docs.filter((d) => d.id !== id);
    if (next.length === docs.length) return false;
    await writeAll(collection, next);
    return true;
  });
}

export async function removeWhere<T extends BaseDoc>(
  collection: string,
  where: (doc: T) => boolean,
): Promise<number> {
  return withLock(collection, async () => {
    const docs = await readAll<T>(collection);
    const keep = docs.filter((d) => !where(d));
    const dropped = docs.length - keep.length;
    if (dropped > 0) await writeAll(collection, keep);
    return dropped;
  });
}

export async function count(collection: string, where?: (doc: BaseDoc) => boolean): Promise<number> {
  const docs = await readAll<BaseDoc>(collection);
  return where ? docs.filter(where).length : docs.length;
}

export async function loadAllCollections(): Promise<Record<string, BaseDoc[]>> {
  await ensureDir();
  const entries = await fs.readdir(DB_DIR).catch(() => [] as string[]);
  const out: Record<string, BaseDoc[]> = {};
  for (const name of entries) {
    if (!name.endsWith(".json")) continue;
    const col = name.replace(/\.json$/, "");
    out[col] = await readAll<BaseDoc>(col);
  }
  return out;
}
