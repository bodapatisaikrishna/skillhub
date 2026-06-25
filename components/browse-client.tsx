"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";

import type { Skill } from "@/lib/data/types";
import {
  applyFilters,
  parseFilters,
  serializeFilters,
  type Filters,
} from "@/lib/filters";
import { FilterBar } from "@/components/filter-bar";
import { SkillCard } from "@/components/skill-card";
import { Button } from "@/components/ui/button";

interface BrowseClientProps {
  skills: Skill[];
}

/**
 * Client-side browse experience: filtering/search/sort over the full catalog,
 * with filter state mirrored into the URL (searchParams) so views are
 * shareable. The full list is passed once from the server; filtering is local.
 */
export function BrowseClient({ skills }: BrowseClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Derive filter state from the URL so back/forward and shared links work.
  const filters = React.useMemo(
    () => parseFilters(searchParams),
    [searchParams],
  );

  // Push a new filter state into the URL (replace: no history spam per keystroke).
  const updateUrl = React.useCallback(
    (next: Filters) => {
      const qs = serializeFilters(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const onChange = React.useCallback(
    (patch: Partial<Filters>) => updateUrl({ ...filters, ...patch }),
    [filters, updateUrl],
  );

  const onClear = React.useCallback(
    () => router.replace(pathname, { scroll: false }),
    [router, pathname],
  );

  const results = React.useMemo(
    () => applyFilters(skills, filters),
    [skills, filters],
  );

  return (
    <div className="space-y-8">
      <FilterBar
        filters={filters}
        resultCount={results.length}
        onChange={onChange}
        onClear={onClear}
      />

      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((skill) => (
            <SkillCard key={skill.slug} skill={skill} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <SearchX
            className="mb-3 size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <h2 className="text-lg font-medium">No skills match your filters</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try removing a filter or searching for a broader term.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={onClear}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
