/**
 * Core domain types for SkillHub.
 *
 * SkillHub is a *directory only* — it links to source repos and shows install
 * instructions. It never hosts or executes skills. These types describe catalog
 * metadata, not runnable artifacts.
 */

/** AI coding agents a skill can target. */
export type Agent =
  | "claude"
  | "cursor"
  | "codex"
  | "gemini"
  | "copilot"
  | "windsurf"
  | "aider"
  | "continue";

/** Top-level catalog categories. */
export type Category =
  | "Coding"
  | "AI/ML"
  | "Security"
  | "Testing/QA"
  | "DevOps"
  | "Data/Analytics"
  | "Design/Frontend"
  | "Mobile"
  | "Writing/Docs"
  | "Business";

/**
 * A single catalog entry: a GitHub repo or folder containing a SKILL.md / rules
 * file. `stars` and `lastUpdated` are hydrated server-side from the GitHub API
 * (see lib/github.ts) and are intentionally absent from the seed.
 */
export interface Skill {
  /** url-safe unique id used in routes (/skill/[slug]). */
  slug: string;
  name: string;
  /** One-line summary shown in cards and meta descriptions. */
  description: string;
  longDescription?: string;
  category: Category;
  /** Canonical GitHub URL of the source repo. */
  repoUrl: string;
  /** GitHub username or org that owns the repo. */
  author: string;
  /** Which agents this skill works with. */
  agents: Agent[];
  /** Per-agent install command or instruction. At least one entry. */
  install: Partial<Record<Agent, string>>;
  /** true for Anthropic / first-party skills. */
  official: boolean;
  tags: string[];

  // --- live fields, hydrated from the GitHub API; optional in the seed ---
  /** Stargazer count from GitHub. */
  stars?: number;
  /** ISO date string of the last push (GitHub `pushed_at`). */
  lastUpdated?: string;
}

/**
 * The trimmed projection sent to the browse grid. Omits the heavy fields
 * (`install`, `longDescription`, `repoUrl`) so the full catalog can be shipped
 * to the client for instant filtering even at large catalog sizes. Keeps every
 * field the card renders and the client-side filter/sort/search reads.
 */
export type BrowseCard = Pick<
  Skill,
  | "slug"
  | "name"
  | "description"
  | "category"
  | "agents"
  | "author"
  | "official"
  | "tags"
  | "stars"
  | "lastUpdated"
>;

/** The full set of agents, in display order. */
export const AGENTS: readonly Agent[] = [
  "claude",
  "cursor",
  "codex",
  "gemini",
  "copilot",
  "windsurf",
  "aider",
  "continue",
] as const;

/** The full set of categories, in display order. */
export const CATEGORIES: readonly Category[] = [
  "Coding",
  "AI/ML",
  "Security",
  "Testing/QA",
  "DevOps",
  "Data/Analytics",
  "Design/Frontend",
  "Mobile",
  "Writing/Docs",
  "Business",
] as const;

/** Human-friendly labels for each agent. */
export const AGENT_LABELS: Record<Agent, string> = {
  claude: "Claude Code",
  cursor: "Cursor",
  codex: "Codex CLI",
  gemini: "Gemini CLI",
  copilot: "GitHub Copilot",
  windsurf: "Windsurf",
  aider: "Aider",
  continue: "Continue",
};
