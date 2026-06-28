import type { Metadata } from "next";

import { getBrowsePage, getCatalogCount } from "@/lib/data";
import { parseFilters, serializeFilters } from "@/lib/filters";
import { BrowseClient } from "@/components/browse-client";

export const metadata: Metadata = {
  title: "Browse skills",
  description:
    "Filter cross-agent AI coding skills by category and agent, search by name or tag, and sort by stars or recency. Copy a per-agent install command in one click.",
  alternates: { canonical: "/browse" },
};

// Filtering/pagination happen on the server from the URL, so the page is
// rendered per-request (only the current page of cards is sent to the client).
export const dynamic = "force-dynamic";

const PAGE_SIZE = 60;

interface BrowsePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const rawPage = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1;

  const cacheKey = `${serializeFilters(filters).toString()}|${rawPage}|${PAGE_SIZE}`;
  const { items, total } = await getBrowsePage(
    cacheKey,
    filters,
    rawPage,
    PAGE_SIZE,
  );

  const catalogCount = await getCatalogCount();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, rawPage), totalPages);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Catalog
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          Browse skills
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          <span className="font-medium text-foreground">
            {catalogCount.toLocaleString()}
          </span>{" "}
          skills across Claude Code, Cursor, Codex, Gemini, Copilot, Windsurf and
          more. SkillHub links to source repos — it never hosts or runs code.
        </p>
      </header>

      <BrowseClient
        items={items}
        total={total}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
