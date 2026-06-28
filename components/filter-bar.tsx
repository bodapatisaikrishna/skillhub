"use client";

import { Search, X, Check } from "lucide-react";

import {
  AGENTS,
  AGENT_LABELS,
  CATEGORIES,
  type Agent,
  type Category,
} from "@/lib/data/types";
import { SORT_OPTIONS, type Filters, type SortKey } from "@/lib/filters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  filters: Filters;
  resultCount: number;
  onChange: (next: Partial<Filters>) => void;
  onClear: () => void;
}

/** Toggle a value in an array (used for multi-select category/agent chips). */
function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

/** Filter controls for the browse grid. Stateless — the parent owns state. */
export function FilterBar({
  filters,
  resultCount,
  onChange,
  onClear,
}: FilterBarProps) {
  const hasActive =
    !!filters.q ||
    filters.categories.length > 0 ||
    filters.agents.length > 0 ||
    filters.sort !== "relevance";

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card/60 p-4 shadow-sm sm:p-5">
      {/* Search + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            placeholder="Search by name, description, tag, or author…"
            aria-label="Search skills"
            className="h-10 pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-muted-foreground">
            Sort
          </label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortKey })}
            className="h-10 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category filter */}
      <fieldset>
        <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Category
        </legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category: Category) => {
            const active = filters.categories.includes(category);
            return (
              <button
                key={category}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  onChange({ categories: toggle(filters.categories, category) })
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40",
                )}
              >
                {active && <Check className="size-3.5" aria-hidden="true" />}
                {category}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Agent filter */}
      <fieldset>
        <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Agent
        </legend>
        <div className="flex flex-wrap gap-2">
          {AGENTS.map((agent: Agent) => {
            const active = filters.agents.includes(agent);
            return (
              <button
                key={agent}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ agents: toggle(filters.agents, agent) })}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40",
                )}
              >
                {active && <Check className="size-3.5" aria-hidden="true" />}
                {AGENT_LABELS[agent]}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Result count + clear */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <p aria-live="polite">
          <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-sm font-medium text-accent-foreground">
            {resultCount.toLocaleString()}{" "}
            {resultCount === 1 ? "skill" : "skills"}
          </span>
        </p>
        {hasActive && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="size-4" aria-hidden="true" /> Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
