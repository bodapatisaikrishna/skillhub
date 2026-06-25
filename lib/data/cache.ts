import "server-only";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Live-metadata cache (stars + lastUpdated), keyed by skill slug.
 *
 * Two backends, chosen at runtime so the data seam never changes:
 *
 *  - **Vercel KV** (when KV_REST_API_URL + KV_REST_API_TOKEN are set). This is
 *    the production backend: the daily /api/sync cron writes here and every
 *    page lambda reads the same shared store. Uses the Upstash REST API over
 *    `fetch`, so there is no extra dependency.
 *  - **Temp file** (local dev / no KV configured). Persists to the OS temp dir,
 *    which is the only writable path in a Vercel bundle but is per-lambda there
 *    — hence KV in production.
 *
 * Only lib/data/index.ts reads from here, so swapping the backend (Supabase,
 * Redis, etc.) means changing only this file. Pages must render fine when the
 * cache is missing or stale, so every read degrades to an empty map.
 */

export interface LiveMeta {
  stars?: number;
  lastUpdated?: string;
}

export type LiveMetaMap = Record<string, LiveMeta>;

const KV_KEY = "skillhub:live-meta";
const CACHE_FILE = path.join(os.tmpdir(), "skillhub-live-cache.json");

function kvConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return { url: url.replace(/\/$/, ""), token };
  return null;
}

/** Whether the shared (Vercel KV) backend is active. */
export function isSharedCache(): boolean {
  return kvConfig() !== null;
}

function isLiveMetaMap(value: unknown): value is LiveMetaMap {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/** Read the live-metadata cache. Returns {} if absent or unreadable. */
export async function readLiveMeta(): Promise<LiveMetaMap> {
  const kv = kvConfig();
  if (kv) {
    try {
      const res = await fetch(`${kv.url}/get/${KV_KEY}`, {
        headers: { Authorization: `Bearer ${kv.token}` },
        cache: "no-store",
      });
      if (!res.ok) return {};
      // Upstash REST returns { result: <stored-string> | null }.
      const body: unknown = await res.json();
      const result =
        body && typeof body === "object" && "result" in body
          ? (body as { result: unknown }).result
          : null;
      if (typeof result !== "string" || result.length === 0) return {};
      const parsed: unknown = JSON.parse(result);
      return isLiveMetaMap(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  try {
    const raw = await fs.readFile(CACHE_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return isLiveMetaMap(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/** Persist the live-metadata cache. Used by /api/sync. Throws on KV failure. */
export async function writeLiveMeta(data: LiveMetaMap): Promise<void> {
  const kv = kvConfig();
  if (kv) {
    const res = await fetch(`${kv.url}/set/${KV_KEY}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kv.token}`,
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`KV write failed: ${res.status} ${res.statusText}`);
    }
    return;
  }

  await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2), "utf8");
}

export const LIVE_CACHE_PATH = CACHE_FILE;
