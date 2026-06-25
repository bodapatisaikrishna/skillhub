import { AGENTS, CATEGORIES, type Agent, type Category, type BrowseCard } from "@/lib/data/types";

/**
 * Browse-page filter state and the URL (searchParams) serialization for it.
 * Kept framework-agnostic and client-safe so both the server page and the
 * client grid can parse/derive shareable links from the same source of truth.
 */

export type SortKey = "relevance" | "stars" | "updated" | "name";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "stars", label: "Most stars" },
  { value: "updated", label: "Recently updated" },
  { value: "name", label: "Name (A–Z)" },
];

export interface Filters {
  q: string;
  categories: Category[];
  agents: Agent[];
  sort: SortKey;
}

export const EMPTY_FILTERS: Filters = {
  q: "",
  categories: [],
  agents: [],
  sort: "relevance",
};

const CATEGORY_SET = new Set<string>(CATEGORIES);
const AGENT_SET = new Set<string>(AGENTS);

/** A loose shape covering both Next's searchParams and URLSearchParams. */
type ParamsLike =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

function readParam(params: ParamsLike, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const v = params[key];
  return Array.isArray(v) ? v[0] : v;
}

/** Parse filter state from URL search params, ignoring unknown values. */
export function parseFilters(params: ParamsLike): Filters {
  const q = (readParam(params, "q") ?? "").trim();

  const categories = (readParam(params, "category") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is Category => CATEGORY_SET.has(s));

  const agents = (readParam(params, "agents") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is Agent => AGENT_SET.has(s));

  const sortRaw = readParam(params, "sort");
  const sort: SortKey =
    sortRaw === "stars" || sortRaw === "updated" || sortRaw === "name"
      ? sortRaw
      : "relevance";

  return { q, categories, agents, sort };
}

/** Serialize filters back to a URLSearchParams (omitting defaults/empties). */
export function serializeFilters(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.categories.length) params.set("category", filters.categories.join(","));
  if (filters.agents.length) params.set("agents", filters.agents.join(","));
  if (filters.sort !== "relevance") params.set("sort", filters.sort);
  return params;
}

/** True when no filters are active (used to short-circuit work / show all). */
export function isEmptyFilters(f: Filters): boolean {
  return !f.q && !f.categories.length && !f.agents.length && f.sort === "relevance";
}

/** Apply filters + sort to a list of skills (pure; used client-side). */
export function applyFilters<T extends BrowseCard>(skills: T[], f: Filters): T[] {
  const q = f.q.toLowerCase();

  const filtered = skills.filter((s) => {
    if (f.categories.length && !f.categories.includes(s.category)) return false;
    if (f.agents.length && !f.agents.some((a) => s.agents.includes(a))) return false;
    if (q) {
      const haystack = `${s.name} ${s.description} ${s.tags.join(" ")} ${s.author}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  switch (f.sort) {
    case "stars":
      sorted.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
      break;
    case "updated":
      sorted.sort(
        (a, b) =>
          new Date(b.lastUpdated ?? 0).getTime() -
          new Date(a.lastUpdated ?? 0).getTime(),
      );
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "relevance":
    default:
      // Official first, then by stars (live) — matches the home "featured" feel.
      sorted.sort((a, b) => {
        if (a.official !== b.official) return a.official ? -1 : 1;
        return (b.stars ?? 0) - (a.stars ?? 0);
      });
  }
  return sorted;
}
