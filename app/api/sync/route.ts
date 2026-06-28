import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

import { getSyncTargets } from "@/lib/data";
import { getWriteClient } from "@/lib/data/supabase";
import { fetchRepoMeta, hasGitHubToken } from "@/lib/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Long-running on a full catalog; allow up to 5 min (Vercel cron).
export const maxDuration = 300;

/** Be polite to the API and avoid burst rate-limiting on the unauthenticated path. */
async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

interface StarUpdate {
  slug: string;
  stars: number;
  last_updated: string | null;
}

/**
 * Daily GitHub metadata sync (wired to a Vercel cron in vercel.json).
 *
 * Iterates the catalog repos, fetches stars + last-push, and writes them back to
 * the `skills` table via the service-role client (batched RPC). Failures are
 * collected per-repo and never abort the run — pages always render from the DB
 * even if this never fully succeeds.
 *
 * Optional auth: if CRON_SECRET is set, require a matching Bearer token (Vercel
 * Cron sends `Authorization: Bearer <CRON_SECRET>` automatically).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!hasGitHubToken()) {
    console.warn(
      "[sync] No GITHUB_TOKEN set — using unauthenticated GitHub API (60 req/hr). " +
        "Set GITHUB_TOKEN to avoid rate limits.",
    );
  }

  const targets = await getSyncTargets();
  const throttled = !hasGitHubToken();

  const updates: StarUpdate[] = [];
  let rateLimited = false;
  const failures: { slug: string; reason: string }[] = [];

  for (const { slug, repoUrl } of targets) {
    const result = await fetchRepoMeta(repoUrl);
    if (result.ok) {
      updates.push({
        slug,
        stars: result.meta.stars,
        last_updated: result.meta.lastUpdated?.slice(0, 10) ?? null,
      });
    } else {
      failures.push({ slug, reason: result.reason });
      if (result.reason === "rate-limited") {
        rateLimited = true;
        break; // stop hammering; persist what we have
      }
    }
    if (throttled) await sleep(150);
  }

  // Persist to Postgres in batches via the update_skill_stars RPC.
  let persisted = 0;
  try {
    const client = getWriteClient();
    const BATCH = 1000;
    for (let i = 0; i < updates.length; i += BATCH) {
      const chunk = updates.slice(i, i + BATCH);
      const { error } = await client.rpc("update_skill_stars", {
        updates: chunk,
      });
      if (error) throw new Error(error.message);
      persisted += chunk.length;
    }
  } catch (err) {
    console.error("[sync] Failed to persist to DB:", err);
    return NextResponse.json(
      { ok: false, error: "db-write-failed", updated: persisted, failures },
      { status: 500 },
    );
  }

  // Invalidate cached browse pages / stats so synced stars appear promptly.
  revalidateTag("skills");
  revalidatePath("/");
  revalidatePath("/browse");

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    total: targets.length,
    updated: persisted,
    rateLimited,
    authenticated: hasGitHubToken(),
    failures,
  });
}
