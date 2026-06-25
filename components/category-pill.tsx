import Link from "next/link";
import {
  Braces,
  FlaskConical,
  Server,
  BarChart3,
  Palette,
  FileText,
  type LucideIcon,
} from "lucide-react";

import type { Category } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICON: Record<Category, LucideIcon> = {
  Coding: Braces,
  "Testing/QA": FlaskConical,
  DevOps: Server,
  "Data/Analytics": BarChart3,
  "Design/Frontend": Palette,
  "Writing/Docs": FileText,
};

interface CategoryPillProps {
  category: Category;
  count?: number;
  /** Render as a link to the filtered browse view. */
  href?: string;
  className?: string;
}

/** A category chip with icon and optional count; links into /browse when given href. */
export function CategoryPill({
  category,
  count,
  href,
  className,
}: CategoryPillProps) {
  const Icon = CATEGORY_ICON[category];
  const content = (
    <>
      <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-medium">{category}</span>
        {typeof count === "number" && (
          <span className="text-xs text-muted-foreground">
            {count} {count === 1 ? "skill" : "skills"}
          </span>
        )}
      </span>
    </>
  );

  const base =
    "group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (href) {
    return (
      <Link href={href} className={cn(base, className)}>
        {content}
      </Link>
    );
  }
  return <div className={cn(base, className)}>{content}</div>;
}
