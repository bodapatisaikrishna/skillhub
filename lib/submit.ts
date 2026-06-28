import { z } from "zod";

import { AGENTS, CATEGORIES, AGENT_LABELS } from "@/lib/data/types";

/**
 * Validation + GitHub-issue construction for skill submissions.
 *
 * v1 has no database: a validated submission is turned into a prefilled GitHub
 * issue link (see /api/submit and SITE.submitRepo). Submissions are reviewed
 * manually — curation is the point. This module is client- and server-safe.
 */

/** Client-safe check that a string is a github.com repo URL. */
export function isGitHubRepoUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (host !== "github.com" && host !== "www.github.com") return false;
    const parts = url.pathname.split("/").filter(Boolean);
    return parts.length >= 2;
  } catch {
    return false;
  }
}

export const submissionSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    description: z
      .string()
      .trim()
      .min(10, "Give a one-line description (10+ characters)")
      .max(160, "Keep the description under 160 characters"),
    repoUrl: z
      .string()
      .trim()
      .refine(isGitHubRepoUrl, "Enter a valid github.com repository URL"),
    author: z
      .string()
      .trim()
      .min(1, "Author (GitHub username or org) is required")
      .max(80),
    category: z.enum(CATEGORIES),
    agents: z
      .array(z.enum(AGENTS))
      .min(1, "Select at least one supported agent"),
    // One install command per agent. Partial here (only selected agents are
    // sent); presence for each *selected* agent is enforced in superRefine.
    install: z.partialRecord(z.enum(AGENTS), z.string().trim().min(1)),
  })
  .superRefine((data, ctx) => {
    for (const agent of data.agents) {
      const cmd = data.install[agent];
      if (!cmd || cmd.trim().length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["install", agent],
          message: `Add an install command for ${AGENT_LABELS[agent]}`,
        });
      }
    }
  });

export type Submission = z.infer<typeof submissionSchema>;

/** Render the issue body (markdown) from a validated submission. */
function buildIssueBody(s: Submission): string {
  const installLines = s.agents
    .map((agent) => `- **${AGENT_LABELS[agent]}**: \`${s.install[agent] ?? ""}\``)
    .join("\n");

  return [
    "### New skill submission",
    "",
    `**Name:** ${s.name}`,
    `**Repo:** ${s.repoUrl}`,
    `**Author:** ${s.author}`,
    `**Category:** ${s.category}`,
    `**Agents:** ${s.agents.map((a) => AGENT_LABELS[a]).join(", ")}`,
    "",
    `**Description:** ${s.description}`,
    "",
    "**Install commands:**",
    installLines,
    "",
    "---",
    "_Submitted via the SkillHub submission form. Listings are reviewed before being added._",
  ].join("\n");
}

/**
 * Build a prefilled "new issue" URL on the configured submit repo.
 * @param repo owner/repo (e.g. "your-org/skillhub")
 */
export function buildIssueUrl(repo: string, s: Submission): string {
  const params = new URLSearchParams({
    title: `[Skill] ${s.name}`,
    body: buildIssueBody(s),
    labels: "skill-submission",
  });
  return `https://github.com/${repo}/issues/new?${params.toString()}`;
}
