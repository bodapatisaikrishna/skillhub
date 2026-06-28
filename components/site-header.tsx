"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { GithubIcon } from "@/components/icons";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/browse", label: "Browse" },
  { href: "/submit", label: "Submit" },
];

/** Global site header: logo, primary nav, GitHub link, theme toggle. */
export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-brand text-white shadow-soft">
            <Boxes className="size-4" aria-hidden="true" />
          </span>
          <span className="text-[0.95rem]">
            Skill<span className="text-gradient">Hub</span>
          </span>
        </Link>

        <nav
          className="ml-3 hidden items-center gap-1 sm:flex"
          aria-label="Main"
        >
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="GitHub repository"
          >
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
      {/* hairline brand glow under the bar */}
      <div
        className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden="true"
      />
    </header>
  );
}
