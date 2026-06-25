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
    <div className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Submit a skill</h1>
        <p className="mt-2 text-muted-foreground">
          Share a skill so others can discover and install it across agents.
          SkillHub only links to your repo and shows install instructions — it
          never hosts or runs your code.
        </p>
      </header>

      <div className="mb-6 flex items-start gap-2 rounded-lg border border-border bg-accent/40 px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          Submissions open a prefilled GitHub issue on the SkillHub repo. A
          maintainer reviews each one before it&apos;s listed — this keeps the
          directory curated rather than auto-filled with noise.
        </p>
      </div>

      <SubmitForm />
    </div>
  );
}
