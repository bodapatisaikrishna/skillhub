"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/** Hero search box. Submitting routes to /browse with the query pre-applied. */
export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
  }

  return (
    <form onSubmit={onSubmit} role="search" className="w-full max-w-xl">
      <div className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skills — e.g. testing, terraform, accessibility…"
          aria-label="Search skills"
          className="h-12 pl-10 pr-28 text-base shadow-sm"
        />
        <Button type="submit" className="absolute right-1.5 h-9">
          Search
        </Button>
      </div>
    </form>
  );
}
