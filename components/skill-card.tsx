import Link from "next/link";
import { Star, BadgeCheck } from "lucide-react";

import type { BrowseCard } from "@/lib/data/types";
import { AgentBadge } from "@/components/agent-badge";
import { Badge } from "@/components/ui/badge";
import { formatStars } from "@/lib/format";
import { cn } from "@/lib/utils";

interface SkillCardProps {
  /** Accepts a full Skill or the trimmed BrowseCard (Skill is assignable). */
  skill: BrowseCard;
  className?: string;
}

/** A linked summary card for a single skill, used in grids and featured rows. */
export function SkillCard({ skill, className }: SkillCardProps) {
  const maxAgents = 4;
  const shownAgents = skill.agents.slice(0, maxAgents);
  const extraAgents = skill.agents.length - shownAgents.length;

  return (
    <Link
      href={`/skill/${skill.slug}`}
      className={cn(
        "group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="truncate font-semibold tracking-tight group-hover:text-primary">
            {skill.name}
          </h3>
          {skill.official && (
            <BadgeCheck
              className="size-4 shrink-0 text-primary"
              aria-label="Official"
            />
          )}
        </div>
        {typeof skill.stars === "number" && (
          <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5" aria-hidden="true" />
            {formatStars(skill.stars)}
          </span>
        )}
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
        {skill.description}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge variant="outline" className="text-xs">
          {skill.category}
        </Badge>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
        {shownAgents.map((agent) => (
          <AgentBadge key={agent} agent={agent} />
        ))}
        {extraAgents > 0 && (
          <span className="text-xs text-muted-foreground">
            +{extraAgents} more
          </span>
        )}
      </div>
    </Link>
  );
}
