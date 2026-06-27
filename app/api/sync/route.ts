import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

import { getSyncTargets } from "@/lib/data";
import {
  readLiveMeta,
  writeLiveMeta,
  isSharedCache,
  type LiveMetaMap,
} from "@/lib/data/cache";
import { fetchRepoMeta, hasGitHubToken } from "@/lib/github";

// Uses the filesystem (cache write) → Node runtime, never statically cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Be polite to the API and avoid burst rate-limiting on the unauthenticated path. */
async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Daily GitHub metadata sync (wired to a Vercel cron in vercel.json).
 *
 * Iterates the seed repos, fetches stars + last-push, and writes the live cache.
 * Failures are collected per-repo and never abort the run — pages always render
 * from the seed even if this never succeeds.
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

  // Start from the existing cache so a partial run never drops good data.
  const cache: LiveMetaMap = { ...(await readLiveMeta()) };

  let updated = 0;
  let rateLimited = false;
  const failures: { slug: string; reason: string }[] = [];

  for (const { slug, repoUrl } of targets) {
    const result = await fetchRepoMeta(repoUrl);
    if (result.ok) {
      cache[slug] = {
        stars: result.meta.stars,
        lastUpdated: result.meta.lastUpdated,
      };
      updated += 1;
    } else {
      failures.push({ slug, reason: result.reason });
      if (result.reason === "rate-limited") {
        rateLimited = true;
        // No point hammering once rate-limited — stop early, keep what we have.
        break;
      }
    }
    if (throttled) await sleep(150);
  }

  try {
    await writeLiveMeta(cache);
  } catch (err) {
    console.error("[sync] Failed to persist live cache:", err);
    return NextResponse.json(
      { ok: false, error: "cache-write-failed", updated, failures },
      { status: 500 },
    );
  }

  // Invalidate the cached data layer (live-meta read + per-query browse pages)
  // so the freshly synced stars/dates appear on the next render.
  revalidateTag("live-meta");
  revalidateTag("skills");

  // Refresh statically-rendered pages so they pick up the new metadata.
  revalidatePath("/");
  revalidatePath("/browse");
  for (const { slug } of targets) revalidatePath(`/skill/${slug}`);

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    total: targets.length,
    updated,
    rateLimited,
    authenticated: hasGitHubToken(),
    // true → Vercel KV (shared across lambdas); false → local temp file only.
    sharedCache: isSharedCache(),
    failures,
  });
}
