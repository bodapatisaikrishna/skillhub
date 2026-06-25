import { Suspense } from "react";
import type { Metadata } from "next";

import { getBrowseCards } from "@/lib/data";
import { BrowseClient } from "@/components/browse-client";

export const metadata: Metadata = {
  title: "Browse skills",
  description:
    "Filter cross-agent AI coding skills by category and agent, search by name or tag, and sort by stars or recency. Copy a per-agent install command in one click.",
  alternates: { canonical: "/browse" },
};

// Re-render hourly to pick up synced star counts / dates (see /api/sync).
export const revalidate = 3600;

export default async function BrowsePage() {
  const skills = await getBrowseCards();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Browse skills</h1>
        <p className="mt-2 text-muted-foreground">
          {skills.length} skills across {""}
          <span className="text-foreground">Claude Code, Cursor, Codex, Gemini, Copilot, Windsurf</span>{" "}
          and more. SkillHub links to source repos — it never hosts or runs code.
        </p>
      </header>

      {/* useSearchParams needs a Suspense boundary for static rendering. */}
      <Suspense fallback={<BrowseSkeleton />}>
        <BrowseClient skills={skills} />
      </Suspense>
    </div>
  );
}

/** Lightweight loading skeleton shown while the client grid hydrates. */
function BrowseSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-xl border border-border bg-muted/50"
          />
        ))}
      </div>
    </div>
  );
}
