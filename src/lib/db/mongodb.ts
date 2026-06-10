import { MongoClient, type Db } from "mongodb";

// Cached MongoDB connection for serverless (Vercel) reuse across invocations.
// Persistence is fully optional: if MONGODB_URI is missing, callers fall back
// to in-browser storage and these helpers return null.

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "cortexsim";

interface GlobalWithMongo {
  _cortexMongo?: Promise<MongoClient>;
}
const globalForMongo = globalThis as unknown as GlobalWithMongo;

export function isDbConfigured(): boolean {
  return Boolean(uri && uri.length > 0);
}

async function getClient(): Promise<MongoClient | null> {
  if (!uri) return null;
  if (!globalForMongo._cortexMongo) {
    const client = new MongoClient(uri);
    globalForMongo._cortexMongo = client.connect();
  }
  return globalForMongo._cortexMongo;
}

export async function getDb(): Promise<Db | null> {
  const client = await getClient();
  if (!client) return null;
  return client.db(dbName);
}
