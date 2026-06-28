import "server-only";

/**
 * Minimal, server-only GitHub REST client used by the daily sync (/api/sync)
 * to refresh star counts and last-push dates.
 *
 * Hard rules:
 *  - Runs only on the server. The token is read from env and never exposed.
 *  - Degrades gracefully: every failure (404, rate limit, network) resolves to
 *    a typed result instead of throwing, so a bad repo never breaks the sync or
 *    a page render.
 */

export interface RepoMeta {
  stars: number;
  /** ISO date string from GitHub `pushed_at`. */
  lastUpdated: string;
}

export type RepoFetchResult =
  | { ok: true; meta: RepoMeta }
  | { ok: false; reason: "not-found" | "rate-limited" | "bad-url" | "error"; status?: number };

/** Parse `owner` and `repo` from a GitHub URL. Returns null if not parseable. */
export function parseRepo(repoUrl: string): { owner: string; repo: string } | null {
  try {
    const url = new URL(repoUrl);
    if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
      return null;
    }
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, "");
    if (!owner || !repo) return null;
    return { owner, repo };
  } catch {
    return null;
  }
}

/** True when a GITHUB_TOKEN is configured (used to warn about rate limits). */
export function hasGitHubToken(): boolean {
  return Boolean(process.env.GITHUB_TOKEN);
}

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "skillhub-sync",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * Fetch star count and last-push date for a single repo. Never throws.
 */
export async function fetchRepoMeta(repoUrl: string): Promise<RepoFetchResult> {
  const parsed = parseRepo(repoUrl);
  if (!parsed) return { ok: false, reason: "bad-url" };

  const endpoint = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`;

  try {
    const res = await fetch(endpoint, {
      headers: buildHeaders(),
      // The sync controls freshness; don't let fetch cache stale metadata.
      cache: "no-store",
    });

    if (res.status === 404) return { ok: false, reason: "not-found", status: 404 };

    // GitHub signals rate limiting with 403/429 and a zero remaining header.
    if (res.status === 403 || res.status === 429) {
      const remaining = res.headers.get("x-ratelimit-remaining");
      if (remaining === "0" || res.status === 429) {
        return { ok: false, reason: "rate-limited", status: res.status };
      }
      return { ok: false, reason: "error", status: res.status };
    }

    if (!res.ok) return { ok: false, reason: "error", status: res.status };

    const data: unknown = await res.json();
    if (
      data &&
      typeof data === "object" &&
      "stargazers_count" in data &&
      "pushed_at" in data
    ) {
      const rec = data as { stargazers_count: number; pushed_at: string };
      return {
        ok: true,
        meta: { stars: rec.stargazers_count, lastUpdated: rec.pushed_at },
      };
    }
    return { ok: false, reason: "error", status: res.status };
  } catch {
    // Network failure, DNS, abort, etc.
    return { ok: false, reason: "error" };
  }
}
