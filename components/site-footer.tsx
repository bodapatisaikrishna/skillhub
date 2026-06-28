import Link from "next/link";
import { Boxes } from "lucide-react";

import { SITE } from "@/lib/site";

/** Global site footer with the directory-only disclaimer made explicit. */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Boxes className="size-3.5" aria-hidden="true" />
            </span>
            SkillHub
          </div>
          <p className="text-sm text-muted-foreground">
            A directory of AI coding-agent skills. SkillHub links to source
            repositories and shows install instructions — it does{" "}
            <strong className="font-medium text-foreground">not</strong> host or
            execute any skill code.
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
          <Link href="/browse" className="text-muted-foreground hover:text-foreground">
            Browse
          </Link>
          <Link href="/submit" className="text-muted-foreground hover:text-foreground">
            Submit a skill
          </Link>
          <a
            href={SITE.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href="https://agentskills.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            Agent Skills standard
          </a>
        </nav>
      </div>
      <div className="border-t border-border py-4">
        <p className="mx-auto max-w-6xl px-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} SkillHub. Not affiliated with the listed
          projects. All trademarks belong to their respective owners.
        </p>
      </div>
    </footer>
  );
}
