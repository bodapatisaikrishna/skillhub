import Link from "next/link";
import { ArrowRight, Sparkles, Search, Copy, TerminalSquare } from "lucide-react";

import { getFeatured, getCategories, getStats } from "@/lib/data";
import { AGENTS, AGENT_LABELS } from "@/lib/data/types";
import { HomeSearch } from "@/components/home-search";
import { SkillCard } from "@/components/skill-card";
import { CategoryPill } from "@/components/category-pill";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons";
import { SITE } from "@/lib/site";

// Re-render hourly to reflect synced star counts in the Featured row.
export const revalidate = 3600;

const STEPS = [
  {
    icon: Search,
    title: "Find a skill",
    body: "Search 10,000 skills and rules across every major coding agent, filtered by category and tool.",
  },
  {
    icon: Copy,
    title: "Copy the install",
    body: "Each listing shows the exact per-agent install command or file to drop into your project.",
  },
  {
    icon: TerminalSquare,
    title: "Use it in your agent",
    body: "Run it in Claude Code, Cursor, Copilot, and more. SkillHub only links to the source repo.",
  },
];

export default async function HomePage() {
  const [featured, categories, stats] = await Promise.all([
    getFeatured(6),
    getCategories(),
    getStats(),
  ]);

  const statItems = [
    { label: "skills", value: stats.skills.toLocaleString() },
    { label: "developers", value: stats.developers.toLocaleString() },
    { label: "coding agents", value: String(stats.agents) },
    { label: "categories", value: String(stats.categories) },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="hero-glow relative flex flex-col items-center pt-16 pb-14 text-center sm:pt-24">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_60%_55%_at_50%_0%,black,transparent_75%)]"
          aria-hidden="true"
        />
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
          <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
          Cross-agent · works with {AGENTS.length} coding agents
        </span>
        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          The directory for{" "}
          <span className="text-gradient">AI coding-agent skills</span>
        </h1>
        <p className="mt-5 max-w-xl text-balance text-lg text-muted-foreground">
          Discover, compare, and copy-install skills and rules for Claude Code,
          Cursor, Codex, Gemini, Copilot, Windsurf and more — one command per
          agent.
        </p>

        <div className="mt-8 flex w-full flex-col items-center gap-3">
          <HomeSearch />
          <p className="text-xs text-muted-foreground">
            Links to source repos and shows install instructions. Never hosts or
            runs skill code.
          </p>
        </div>

        {/* Credibility stat row */}
        <dl className="mt-10 grid w-full max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-sm sm:grid-cols-4">
          {statItems.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-0.5 bg-card px-3 py-4"
            >
              <dt className="order-2 text-xs text-muted-foreground">
                {s.label}
              </dt>
              <dd className="order-1 font-mono text-2xl font-semibold tracking-tight">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* Agent filter chips */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {AGENTS.map((agent) => (
            <Link
              key={agent}
              href={`/browse?agents=${agent}`}
              className="rounded-full border border-border bg-card/70 px-3 py-1.5 text-sm text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {AGENT_LABELS[agent]}
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <step.icon className="size-4.5" aria-hidden="true" />
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-3 font-medium">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-10">
        <SectionHeader
          eyebrow="Explore"
          title="Browse by category"
          link={{ href: "/browse", label: "View all" }}
        />
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
        <SectionHeader
          eyebrow="Popular"
          title="Featured skills"
          link={{ href: "/browse?sort=stars", label: "Most popular" }}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((skill) => (
            <SkillCard key={skill.slug} skill={skill} />
          ))}
        </div>
      </section>

      {/* Submit CTA */}
      <section className="hero-glow relative my-14 overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-soft sm:p-14">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_70%_80%_at_50%_0%,black,transparent)]"
          aria-hidden="true"
        />
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Built a skill worth sharing?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Submit it to SkillHub. Listings are curated and link straight to your
          repo — no hosting, no lock-in.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-gradient-brand text-white hover:opacity-90"
          >
            <Link href="/submit">
              Submit your skill{" "}
              <ArrowRight className="size-4" aria-hidden="true" />
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
