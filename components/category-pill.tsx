import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Category } from "@/lib/data/types";
import { CATEGORY_ACCENT } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface CategoryPillProps {
  category: Category;
  count?: number;
  /** Render as a link to the filtered browse view. */
  href?: string;
  className?: string;
}

/** A category card with a colored icon tile and optional count; links into /browse. */
export function CategoryPill({
  category,
  count,
  href,
  className,
}: CategoryPillProps) {
  const accent = CATEGORY_ACCENT[category];
  const Icon = accent.icon;

  const content = (
    <>
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
          accent.tile,
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="font-medium">{category}</span>
        {typeof count === "number" && (
          <span className="text-sm text-muted-foreground">
            {count.toLocaleString()} {count === 1 ? "skill" : "skills"}
          </span>
        )}
      </span>
      <ArrowRight
        className="ml-auto size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
        aria-hidden="true"
      />
    </>
  );

  const base =
    "card-hover group flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (href) {
    return (
      <Link href={href} className={cn(base, className)}>
        {content}
      </Link>
    );
  }
  return <div className={cn(base, className)}>{content}</div>;
}
