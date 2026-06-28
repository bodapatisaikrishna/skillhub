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
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Press "/" anywhere (outside a field) to jump into search.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/") return;
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (typing) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
  }

  return (
    <form onSubmit={onSubmit} role="search" className="w-full max-w-xl">
      <div className="group relative flex items-center">
        <Search
          className="pointer-events-none absolute left-4 size-4.5 text-muted-foreground transition-colors group-focus-within:text-primary"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 10,000 skills — testing, terraform, accessibility…"
          aria-label="Search skills"
          className="h-12 rounded-xl pl-11 pr-32 text-base shadow-soft transition-shadow focus-visible:shadow-lg"
        />
        <kbd className="pointer-events-none absolute right-28 hidden h-6 select-none items-center rounded border border-border bg-muted px-1.5 font-mono text-[11px] text-muted-foreground sm:inline-flex">
          /
        </kbd>
        <Button
          type="submit"
          className="absolute right-1.5 h-10 rounded-lg bg-gradient-brand text-white hover:opacity-90"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
