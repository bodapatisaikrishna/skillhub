import "server-only";
import seed from "./seed.json";
import { readLiveMeta } from "./cache";
import { CATEGORIES, type BrowseCard, type Category, type Skill } from "./types";

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
function withLiveMeta(skill: Skill, live: Awaited<ReturnType<typeof readLiveMeta>>): Skill {
  const meta = live[skill.slug];
  if (!meta) return skill;
  return {
    ...skill,
    stars: meta.stars ?? skill.stars,
    lastUpdated: meta.lastUpdated ?? skill.lastUpdated,
  };
}

/** All skills, hydrated with live metadata where available. */
export async function getAllSkills(): Promise<Skill[]> {
  const live = await readLiveMeta();
  return SEED.map((skill) => withLiveMeta(skill, live));
}

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
  const live = await readLiveMeta();
  return withLiveMeta(skill, live);
}

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

/** Category list with a live count of skills in each. */
export async function getCategories(): Promise<{ category: Category; count: number }[]> {
  const all = await getAllSkills();
  return CATEGORIES.map((category) => ({
    category,
    count: all.filter((s) => s.category === category).length,
  }));
}
