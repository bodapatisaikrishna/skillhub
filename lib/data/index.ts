import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import seed from "./seed.json";
import { getLiveMeta, type LiveMetaMap } from "./cache";
import { CATEGORIES, type BrowseCard, type Category, type Skill } from "./types";
import { applyFilters, type Filters } from "@/lib/filters";

/**
 * The single data-access seam for SkillHub.
 *
 * Every page and component reads skills through these functions — never by
 * importing seed.json directly. Today the source is a local JSON seed merged
 * with a live-metadata cache; swapping in Supabase later means changing only
 * this file (and lib/data/cache.ts), not any callers.
 */

const SEED = seed as Skill[];

/** Merge live stars/lastUpdated from the sync cache onto a seed entry. */
function withLiveMeta(skill: Skill, live: LiveMetaMap): Skill {
  const meta = live[skill.slug];
  if (!meta) return skill;
  return {
    ...skill,
    stars: meta.stars ?? skill.stars,
    lastUpdated: meta.lastUpdated ?? skill.lastUpdated,
  };
}

/** Trim a full Skill down to the browse-card projection. */
function toCard(s: Skill): BrowseCard {
  return {
    slug: s.slug,
    name: s.name,
    description: s.description,
    category: s.category,
    agents: s.agents,
    author: s.author,
    official: s.official,
    tags: s.tags,
    stars: s.stars,
    lastUpdated: s.lastUpdated,
  };
}

/** Total catalog size — cheap (no live-meta needed); for headers/stats. */
export function getCatalogCount(): number {
  return SEED.length;
}

/**
 * All skills, hydrated with live metadata. Wrapped in React `cache()` so the
 * 10k merge runs at most once per request even when several helpers
 * (getFeatured/getCategories/getStats) ask for it. Live-meta itself is cached
 * in getLiveMeta, so there is no per-request KV round-trip.
 */
export const getAllSkills = cache(async (): Promise<Skill[]> => {
  const live = await getLiveMeta();
  return SEED.map((skill) => withLiveMeta(skill, live));
});

/**
 * Trimmed catalog projection for the browse grid. Drops the heavy per-skill
 * fields (install/longDescription/repoUrl) so the whole catalog can ship to the
 * client for instant filtering without a multi-MB payload at large sizes.
 */
export async function getBrowseCards(): Promise<BrowseCard[]> {
  const all = await getAllSkills();
  return all.map((s) => ({
    slug: s.slug,
    name: s.name,
    description: s.description,
    category: s.category,
    agents: s.agents,
    author: s.author,
    official: s.official,
    tags: s.tags,
    stars: s.stars,
    lastUpdated: s.lastUpdated,
  }));
}

/**
 * Slugs to statically pre-render at build time: official + most-starred first,
 * capped so build time stays flat as the catalog grows into the thousands. The
 * rest render on-demand (ISR) on first visit and are then cached.
 */
export async function getPrerenderSlugs(limit = 200): Promise<string[]> {
  const all = await getAllSkills();
  return [...all]
    .sort((a, b) => {
      if (a.official !== b.official) return a.official ? -1 : 1;
      return (b.stars ?? 0) - (a.stars ?? 0);
    })
    .slice(0, limit)
    .map((s) => s.slug);
}

/** A single skill by slug, or null if not found. */
export async function getSkillBySlug(slug: string): Promise<Skill | null> {
  const skill = SEED.find((s) => s.slug === slug);
  if (!skill) return null;
  const live = await getLiveMeta();
  return withLiveMeta(skill, live);
}

export interface BrowsePageResult {
  items: BrowseCard[];
  total: number;
}

/**
 * One filtered + paginated page of the browse grid, cached per query in
 * Vercel's Data Cache. Popular queries (default list, common category/agent
 * filters, first pages) are re-served from cache with no recompute under load.
 * The result is small (≤ pageSize cards + a count). Page is clamped to range so
 * out-of-bounds requests return the last page's slice. Cache entries are
 * invalidated by revalidateTag("skills") after the daily sync.
 *
 * @param _cacheKey normalized "filters|page|pageSize" string; only differentiates
 *   cache entries (the real inputs follow).
 */
export const getBrowsePage = unstable_cache(
  async (
    _cacheKey: string,
    filters: Filters,
    page: number,
    pageSize: number,
  ): Promise<BrowsePageResult> => {
    void _cacheKey; // only used to differentiate cache entries
    const all = await getAllSkills();
    const results = applyFilters(all, filters);
    const total = results.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const p = Math.min(Math.max(1, page), totalPages);
    const items = results.slice((p - 1) * pageSize, p * pageSize).map(toCard);
    return { items, total };
  },
  ["browse-page"],
  { revalidate: 300, tags: ["skills"] },
);

/** All known slugs — used for static params and the sitemap. */
export async function getAllSlugs(): Promise<string[]> {
  return SEED.map((s) => s.slug);
}

/** (slug, repoUrl) pairs for the GitHub sync to iterate over. */
export async function getSyncTargets(): Promise<{ slug: string; repoUrl: string }[]> {
  return SEED.map((s) => ({ slug: s.slug, repoUrl: s.repoUrl }));
}

/**
 * Featured skills for the home page. Official skills first, then by stars
 * (live, when present), capped to `limit`.
 */
export async function getFeatured(limit = 6): Promise<Skill[]> {
  const all = await getAllSkills();
  return [...all]
    .sort((a, b) => {
      if (a.official !== b.official) return a.official ? -1 : 1;
      return (b.stars ?? 0) - (a.stars ?? 0);
    })
    .slice(0, limit);
}

/** Headline catalog stats for the home hero (skills / developers / agents / categories). */
export async function getStats(): Promise<{
  skills: number;
  developers: number;
  agents: number;
  categories: number;
}> {
  const all = await getAllSkills();
  const developers = new Set(all.map((s) => s.author)).size;
  const agents = new Set(all.flatMap((s) => s.agents)).size;
  return {
    skills: all.length,
    developers,
    agents,
    categories: CATEGORIES.length,
  };
}

/** Category list with a live count of skills in each. */
export async function getCategories(): Promise<{ category: Category; count: number }[]> {
  const all = await getAllSkills();
  return CATEGORIES.map((category) => ({
    category,
    count: all.filter((s) => s.category === category).length,
  }));
}
