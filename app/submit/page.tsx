import type { Metadata } from "next";
import { Info } from "lucide-react";

import { SubmitForm } from "@/components/submit-form";

export const metadata: Metadata = {
  title: "Submit a skill",
  description:
    "Submit your AI coding-agent skill to SkillHub. Listings link to your source repo and show per-agent install commands. Curated — every submission is reviewed.",
  alternates: { canonical: "/submit" },
};

export default function SubmitPage() {
  return (
    <div className="hero-glow relative mx-auto max-w-2xl px-4 py-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-grid [mask-image:radial-gradient(ellipse_70%_100%_at_50%_0%,black,transparent)]"
        aria-hidden="true"
      />
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Contribute
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          Submit a skill
        </h1>
        <p className="mt-2 text-muted-foreground">
          Share a skill so others can discover and install it across agents.
          SkillHub only links to your repo and shows install instructions — it
          never hosts or runs your code.
        </p>
      </header>

      <div className="mb-6 flex items-start gap-2 rounded-xl border border-border bg-accent/40 px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          Submissions open a prefilled GitHub issue on the SkillHub repo. A
          maintainer reviews each one before it&apos;s listed — this keeps the
          directory curated rather than auto-filled with noise.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <SubmitForm />
      </div>
    </div>
  );
}
