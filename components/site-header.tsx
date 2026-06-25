import Link from "next/link";
import { Boxes } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { GithubIcon } from "@/components/icons";
import { SITE } from "@/lib/site";

/** Global site header: logo, primary nav, GitHub link, theme toggle. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Boxes className="size-4" aria-hidden="true" />
          </span>
          <span>
            Skill<span className="text-primary">Hub</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 sm:flex" aria-label="Main">
          <Button asChild variant="ghost" size="sm">
            <Link href="/browse">Browse</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/submit">Submit</Link>
          </Button>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="GitHub repository">
            <a href={SITE.githubUrl} target="_blank" rel="noopener noreferrer">
              <GithubIcon className="size-4" />
            </a>
          </Button>
          <ThemeToggle />
          <Button asChild size="sm" className="ml-1 hidden sm:inline-flex">
            <Link href="/submit">Submit a skill</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
