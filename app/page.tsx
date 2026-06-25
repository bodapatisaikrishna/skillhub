import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { getFeatured, getCategories } from "@/lib/data";
import { AGENTS, AGENT_LABELS } from "@/lib/data/types";
import { HomeSearch } from "@/components/home-search";
import { SkillCard } from "@/components/skill-card";
import { CategoryPill } from "@/components/category-pill";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons";
import { SITE } from "@/lib/site";

// Re-render hourly to reflect synced star counts in the Featured row.
export const revalidate = 3600;

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getFeatured(6),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="flex flex-col items-center pt-16 pb-12 text-center sm:pt-24">
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
          Cross-agent · works with {AGENTS.length} coding agents
        </span>
        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          The cross-agent directory for{" "}
          <span className="text-primary">AI coding-agent skills</span>
        </h1>
        <p className="mt-4 max-w-xl text-balance text-lg text-muted-foreground">
          Discover, compare, and copy-install skills and rules for Claude Code,
          Cursor, Codex, Gemini, Copilot, Windsurf and more — one command per
          agent.
        </p>

        <div className="mt-8 flex w-full flex-col items-center gap-3">
          <HomeSearch />
          <p className="text-xs text-muted-foreground">
            SkillHub links to source repos and shows install instructions. It
            never hosts or runs skill code.
          </p>
        </div>

        {/* Agent filter chips */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {AGENTS.map((agent) => (
            <Link
              key={agent}
              href={`/browse?agents=${agent}`}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {AGENT_LABELS[agent]}
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-10">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Browse by category
          </h2>
          <Link
            href="/browse"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ category, count }) => (
            <CategoryPill
              key={category}
              category={category}
              count={count}
              href={`/browse?category=${encodeURIComponent(category)}`}
            />
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="py-10">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Featured skills</h2>
          <Link
            href="/browse?sort=stars"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Most popular <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((skill) => (
            <SkillCard key={skill.slug} skill={skill} />
          ))}
        </div>
      </section>

      {/* Submit CTA */}
      <section className="my-12 rounded-2xl border border-border bg-accent/40 p-8 text-center sm:p-12">
        <h2 className="text-2xl font-semibold tracking-tight">
          Built a skill worth sharing?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Submit it to SkillHub. Listings are curated and link straight to your
          repo — no hosting, no lock-in.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/submit">
              Submit your skill <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={SITE.githubUrl} target="_blank" rel="noopener noreferrer">
              <GithubIcon className="size-4" /> Star on GitHub
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
