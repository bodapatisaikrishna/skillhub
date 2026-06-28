import "server-only";
import { unstable_cache } from "next/cache";

import { getReadClient, hasSupabase } from "./supabase";
import {
  AGENTS,
  CATEGORIES,
  type BrowseCard,
  type Category,
  type Skill,
} from "./types";
import { type Filters } from "@/lib/filters";

/**
 * The single data-access seam for SkillHub, backed by Supabase (Postgres).
 *
 * Every page/component reads through these functions — never the table
 * directly. Reads use the anon (RLS public-read) client; the daily sync writes
 * via the service-role client (see app/api/sync). Hot, repeated reads are
 * wrapped in unstable_cache (tag "skills") so popular queries serve from
 * Vercel's Data Cache and the DB isn't hit on every request.
 */

/** Columns needed for the browse grid / cards. */
const CARD_COLS =
  "slug,name,description,category,agents,author,official,tags,stars,last_updated";

interface SkillRow {
  slug: string;
  name: string;
  description: string;
  long_description: string | null;
  category: string;
  repo_url: string;
  author: string;
  agents: string[];
  install: Record<string, string>;
  official: boolean;
  tags: string[];
  stars: number | null;
  last_updated: string | null;
}

type CardRow = Omit<SkillRow, "long_description" | "repo_url" | "install">;

function rowToSkill(r: SkillRow): Skill {
  return {
    slug: r.slug,
    name: r.name,
    description: r.description,
    longDescription: r.long_description ?? undefined,
    category: r.category as Category,
    repoUrl: r.repo_url,
    author: r.author,
    agents: r.agents as Skill["agents"],
    install: r.install as Skill["install"],
    official: r.official,
    tags: r.tags,
    stars: r.stars ?? undefined,
    lastUpdated: r.last_updated ?? undefined,
  };
}

function rowToCard(r: CardRow): BrowseCard {
  return {
    slug: r.slug,
    name: r.name,
    description: r.description,
    category: r.category as Category,
    agents: r.agents as BrowseCard["agents"],
    author: r.author,
    official: r.official,
    tags: r.tags,
    stars: r.stars ?? undefined,
    lastUpdated: r.last_updated ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Browse: filtered + sorted + paginated, cached per query.
// ---------------------------------------------------------------------------

export interface BrowsePageResult {
  items: BrowseCard[];
  total: number;
}

export const getBrowsePage = unstable_cache(
  async (
    _cacheKey: string,
    filters: Filters,
    page: number,
    pageSize: number,
  ): Promise<BrowsePageResult> => {
    void _cacheKey; // only differentiates cache entries
    if (!hasSupabase()) return { items: [], total: 0 };
    const client = getReadClient();

    // Filter methods return the same builder, so reassignment is safe here.
    let filtered = client.from("skills").select(CARD_COLS, { count: "exact" });
    if (filters.categories.length) {
      filtered = filtered.in("category", filters.categories);
    }
    if (filters.agents.length) {
      filtered = filtered.overlaps("agents", filters.agents);
    }
    if (filters.q) {
      filtered = filtered.textSearch("fts", filters.q, {
        type: "websearch",
        config: "english",
      });
    }

    // Ordering returns a transform builder — apply it as a single expression
    // (not reassigned back onto `filtered`) to keep the types clean.
    const ordered =
      filters.sort === "stars"
        ? filtered.order("stars", { ascending: false, nullsFirst: false })
        : filters.sort === "updated"
          ? filtered.order("last_updated", {
              ascending: false,
              nullsFirst: false,
            })
          : filters.sort === "name"
            ? filtered.order("name", { ascending: true })
            : filtered
                .order("official", { ascending: false })
                .order("stars", { ascending: false, nullsFirst: false });

    const from = Math.max(0, (page - 1) * pageSize);
    const { data, count, error } = await ordered
      .range(from, from + pageSize - 1)
      .returns<CardRow[]>();
    if (error) {
      console.error("[data] getBrowsePage:", error.message);
      return { items: [], total: 0 };
    }
    return { items: (data ?? []).map(rowToCard), total: count ?? 0 };
  },
  ["browse-page"],
  { revalidate: 120, tags: ["skills"] },
);

// ---------------------------------------------------------------------------
// Single skill.
// ---------------------------------------------------------------------------

export async function getSkillBySlug(slug: string): Promise<Skill | null> {
  if (!hasSupabase()) return null;
  const client = getReadClient();
  const { data, error } = await client
    .from("skills")
    .select("*")
    .eq("slug", slug)
    .limit(1)
    .returns<SkillRow[]>();
  if (error) {
    console.error("[data] getSkillBySlug:", error.message);
    return null;
  }
  const row = data?.[0];
  return row ? rowToSkill(row) : null;
}

// ---------------------------------------------------------------------------
// Home: featured, category counts, headline stats.
// ---------------------------------------------------------------------------

export const getFeatured = unstable_cache(
  async (limit = 6): Promise<BrowseCard[]> => {
    if (!hasSupabase()) return [];
    const client = getReadClient();
    const { data, error } = await client
      .from("skills")
      .select(CARD_COLS)
      .order("official", { ascending: false })
      .order("stars", { ascending: false, nullsFirst: false })
      .limit(limit)
      .returns<CardRow[]>();
    if (error) {
      console.error("[data] getFeatured:", error.message);
      return [];
    }
    return (data ?? []).map(rowToCard);
  },
  ["featured"],
  { revalidate: 300, tags: ["skills"] },
);

export const getCategories = unstable_cache(
  async (): Promise<{ category: Category; count: number }[]> => {
    if (!hasSupabase()) {
      return CATEGORIES.map((category) => ({ category, count: 0 }));
    }
    const client = getReadClient();
    const { data, error } = await client.rpc("skills_category_counts");
    if (error) {
      console.error("[data] getCategories:", error.message);
      return CATEGORIES.map((category) => ({ category, count: 0 }));
    }
    const rows = (data ?? []) as { category: string; count: number }[];
    const counts = new Map<string, number>(
      rows.map((r) => [r.category, Number(r.count)]),
    );
    return CATEGORIES.map((category) => ({
      category,
      count: counts.get(category) ?? 0,
    }));
  },
  ["category-counts"],
  { revalidate: 300, tags: ["skills"] },
);

export const getStats = unstable_cache(
  async (): Promise<{
    skills: number;
    developers: number;
    agents: number;
    categories: number;
  }> => {
    if (!hasSupabase()) {
      return {
        skills: 0,
        developers: 0,
        agents: AGENTS.length,
        categories: CATEGORIES.length,
      };
    }
    const client = getReadClient();
    const { data, error } = await client.rpc("skills_stats");
    const rows = (data ?? []) as { skills: number; developers: number }[];
    const row = rows[0];
    if (error) console.error("[data] getStats:", error.message);
    return {
      skills: Number(row?.skills ?? 0),
      developers: Number(row?.developers ?? 0),
      agents: AGENTS.length,
      categories: CATEGORIES.length,
    };
  },
  ["stats"],
  { revalidate: 300, tags: ["skills"] },
);

export const getCatalogCount = unstable_cache(
  async (): Promise<number> => {
    if (!hasSupabase()) return 0;
    const client = getReadClient();
    const { count, error } = await client
      .from("skills")
      .select("slug", { count: "exact", head: true });
    if (error) {
      console.error("[data] getCatalogCount:", error.message);
      return 0;
    }
    return count ?? 0;
  },
  ["catalog-count"],
  { revalidate: 300, tags: ["skills"] },
);

// ---------------------------------------------------------------------------
// Build-time / sitemap helpers (resilient: never throw a build).
// ---------------------------------------------------------------------------

/** Top slugs to statically pre-render; the rest render on-demand (ISR). */
export async function getPrerenderSlugs(limit = 200): Promise<string[]> {
  if (!hasSupabase()) return [];
  try {
    const client = getReadClient();
    const { data, error } = await client
      .from("skills")
      .select("slug")
      .order("official", { ascending: false })
      .order("stars", { ascending: false, nullsFirst: false })
      .limit(limit)
      .returns<{ slug: string }[]>();
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.slug);
  } catch (err) {
    console.error("[data] getPrerenderSlugs (falling back to on-demand):", err);
    return [];
  }
}

/** Every slug — for the sitemap. Paginated to fetch all rows past PostgREST caps. */
export async function getAllSlugs(): Promise<string[]> {
  if (!hasSupabase()) return [];
  try {
    const client = getReadClient();
    const out: string[] = [];
    const size = 1000;
    for (let start = 0; ; start += size) {
      const { data, error } = await client
        .from("skills")
        .select("slug")
        .order("slug", { ascending: true })
        .range(start, start + size - 1)
        .returns<{ slug: string }[]>();
      if (error) throw new Error(error.message);
      const batch = data ?? [];
      out.push(...batch.map((r) => r.slug));
      if (batch.length < size) break;
    }
    return out;
  } catch (err) {
    console.error("[data] getAllSlugs:", err);
    return [];
  }
}

/** (slug, repoUrl) pairs for the GitHub sync to iterate over. */
export async function getSyncTargets(): Promise<
  { slug: string; repoUrl: string }[]
> {
  if (!hasSupabase()) return [];
  const client = getReadClient();
  const out: { slug: string; repoUrl: string }[] = [];
  const size = 1000;
  for (let start = 0; ; start += size) {
    const { data, error } = await client
      .from("skills")
      .select("slug,repo_url")
      .order("slug", { ascending: true })
      .range(start, start + size - 1)
      .returns<{ slug: string; repo_url: string }[]>();
    if (error) {
      console.error("[data] getSyncTargets:", error.message);
      break;
    }
    const batch = data ?? [];
    out.push(...batch.map((r) => ({ slug: r.slug, repoUrl: r.repo_url })));
    if (batch.length < size) break;
  }
  return out;
}
