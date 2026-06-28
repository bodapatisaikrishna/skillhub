import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  BadgeCheck,
  Star,
  Clock,
  User,
  ExternalLink,
  Info,
} from "lucide-react";

import { getPrerenderSlugs, getSkillBySlug } from "@/lib/data";
import { AGENT_LABELS } from "@/lib/data/types";
import { CATEGORY_ACCENT } from "@/lib/categories";
import { formatStars, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AgentBadge } from "@/components/agent-badge";
import { InstallSection } from "@/components/install-section";
import { GithubIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

// Re-render hourly so synced metadata appears even between on-demand
// revalidations triggered by /api/sync.
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Pre-render the top subset at build; the rest render on first request (ISR)
// and are cached. Keeps build time flat as the catalog grows to thousands.
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getPrerenderSlugs(200);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);
  if (!skill) {
    return { title: "Skill not found" };
  }

  const agentList = skill.agents.map((a) => AGENT_LABELS[a]).join(", ");
  const description = `${skill.description} Works with ${agentList}. View install commands on SkillHub.`;
  const url = `${SITE.url}/skill/${skill.slug}`;

  return {
    title: skill.name,
    description,
    alternates: { canonical: `/skill/${skill.slug}` },
    openGraph: {
      type: "article",
      title: `${skill.name} · ${SITE.name}`,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: `${skill.name} · ${SITE.name}`,
      description,
    },
  };
}

export default async function SkillPage({ params }: PageProps) {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);
  if (!skill) notFound();

  const lastUpdated = formatDate(skill.lastUpdated);
  const accent = CATEGORY_ACCENT[skill.category];

  return (
    <div className="hero-glow relative mx-auto max-w-3xl px-4 py-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-grid [mask-image:radial-gradient(ellipse_70%_100%_at_50%_0%,black,transparent)]"
        aria-hidden="true"
      />
      <Link
        href="/browse"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to browse
      </Link>

      {/* Header */}
      <header className="mt-6">
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
            accent.chip,
          )}
        >
          {skill.category}
        </span>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {skill.name}
          </h1>
          {skill.official && (
            <Badge className="gap-1">
              <BadgeCheck className="size-3.5" aria-hidden="true" /> Official
            </Badge>
          )}
        </div>
        <p className="mt-3 text-lg text-muted-foreground">
          {skill.description}
        </p>

        {/* Meta row */}
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground">
            <User className="size-3.5" aria-hidden="true" />
            {skill.author}
          </span>
          {typeof skill.stars === "number" && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground">
              <Star className="size-3.5" aria-hidden="true" />
              {formatStars(skill.stars)} stars
            </span>
          )}
          {lastUpdated && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground">
              <Clock className="size-3.5" aria-hidden="true" />
              Updated {lastUpdated}
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            asChild
            className="bg-gradient-brand text-white hover:opacity-90"
          >
            <a href={skill.repoUrl} target="_blank" rel="noopener noreferrer">
              <GithubIcon className="size-4" /> View on GitHub
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </header>

      {/* Long description */}
      {skill.longDescription && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">About</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            {skill.longDescription}
          </p>
        </section>
      )}

      {/* Supported agents */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Works with</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {skill.agents.map((agent) => (
            <AgentBadge key={agent} agent={agent} />
          ))}
        </div>
      </section>

      {/* Install */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Install</h2>
        </div>
        <p className="mt-1 mb-4 flex items-start gap-1.5 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          SkillHub shows these commands and links to the source — it never runs
          them or hosts the skill. Always review a repo before installing.
        </p>
        <InstallSection install={skill.install} />
      </section>

      {/* Tags */}
      {skill.tags.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">Tags</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {skill.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
