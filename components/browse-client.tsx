"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchX, ChevronLeft, ChevronRight } from "lucide-react";

import type { BrowseCard } from "@/lib/data/types";
import {
  parseFilters,
  serializeFilters,
  type Filters,
} from "@/lib/filters";
import { FilterBar } from "@/components/filter-bar";
import { SkillCard } from "@/components/skill-card";
import { Button } from "@/components/ui/button";

interface BrowseClientProps {
  /** The current page of results (already filtered + sliced on the server). */
  items: BrowseCard[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Browse UI. Filtering, sorting and pagination all happen on the server from
 * the URL — this component only renders the current page and pushes filter
 * changes into the URL (search debounced; chips/sort/paging immediate).
 */
export function BrowseClient({
  items,
  total,
  page,
  totalPages,
}: BrowseClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = React.useMemo(
    () => parseFilters(searchParams),
    [searchParams],
  );

  /** Navigate with a new filter set (always returns to page 1). */
  const pushFilters = React.useCallback(
    (next: Filters) => {
      const qs = serializeFilters(next).toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  // Local search text, derived against the URL so an external change (Clear,
  // back/forward) resets it without a setState-in-effect.
  const [typed, setTyped] = React.useState({ base: filters.q, val: filters.q });
  const q = typed.base === filters.q ? typed.val : filters.q;
  const setQ = React.useCallback(
    (val: string) => setTyped({ base: filters.q, val }),
    [filters.q],
  );

  // Debounce the search query into the URL (router.push, not setState).
  React.useEffect(() => {
    if (q === filters.q) return;
    const t = setTimeout(() => pushFilters({ ...filters, q }), 300);
    return () => clearTimeout(t);
  }, [q, filters, pushFilters]);

  const onChange = React.useCallback(
    (patch: Partial<Filters>) => {
      if ("q" in patch && Object.keys(patch).length === 1) {
        setQ(patch.q ?? "");
        return;
      }
      pushFilters({ ...filters, q, ...patch });
    },
    [filters, q, pushFilters, setQ],
  );

  const onClear = React.useCallback(
    () => router.push(pathname, { scroll: false }),
    [router, pathname],
  );

  const pageHref = React.useCallback(
    (p: number) => {
      const params = serializeFilters(filters);
      if (p > 1) params.set("page", String(p));
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [filters, pathname],
  );

  return (
    <div className="space-y-8">
      <FilterBar
        filters={{ ...filters, q }}
        resultCount={total}
        onChange={onChange}
        onClear={onClear}
      />

      {items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((skill) => (
              <SkillCard key={skill.slug} skill={skill} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              className="flex items-center justify-center gap-3 pt-4"
              aria-label="Pagination"
            >
              <Button
                asChild={page > 1}
                variant="outline"
                size="sm"
                disabled={page <= 1}
                className="rounded-full"
              >
                {page > 1 ? (
                  <Link href={pageHref(page - 1)}>
                    <ChevronLeft className="size-4" aria-hidden="true" /> Prev
                  </Link>
                ) : (
                  <span>
                    <ChevronLeft className="size-4" aria-hidden="true" /> Prev
                  </span>
                )}
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page.toLocaleString()} of {totalPages.toLocaleString()}
              </span>
              <Button
                asChild={page < totalPages}
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                className="rounded-full"
              >
                {page < totalPages ? (
                  <Link href={pageHref(page + 1)}>
                    Next <ChevronRight className="size-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <span>
                    Next <ChevronRight className="size-4" aria-hidden="true" />
                  </span>
                )}
              </Button>
            </nav>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
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
