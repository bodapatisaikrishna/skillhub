/**
 * Central site configuration. Safe to import from both client and server —
 * contains no secrets. The canonical base URL can be overridden per-deploy via
 * NEXT_PUBLIC_SITE_URL; the submit target repo via NEXT_PUBLIC_SUBMIT_REPO.
 */
export const SITE = {
  name: "SkillHub",
  tagline: "The cross-agent directory for AI coding-agent skills.",
  description:
    "Discover, compare, and copy-install skills and rules for Claude Code, Cursor, Codex CLI, Gemini CLI, GitHub Copilot, Windsurf, and more. SkillHub links to source repos and shows per-agent install commands — it never hosts or runs skills.",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://skillhub.dev",
  /** owner/repo that submission issues are opened against (see /submit). */
  submitRepo: process.env.NEXT_PUBLIC_SUBMIT_REPO || "your-org/skillhub",
  /** The SkillHub project repo (header/footer "GitHub" link). */
  githubUrl: `https://github.com/${process.env.NEXT_PUBLIC_SUBMIT_REPO || "your-org/skillhub"}`,
} as const;
