"use client";

import * as React from "react";
import { Check, ExternalLink, Loader2, AlertCircle } from "lucide-react";

import {
  AGENTS,
  AGENT_LABELS,
  CATEGORIES,
  type Agent,
  type Category,
} from "@/lib/data/types";
import { submissionSchema } from "@/lib/submit";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type Errors = Record<string, string>;
type Status = "idle" | "submitting" | "success" | "error";

/** Per-agent placeholder hints mirroring the seed's install conventions. */
const INSTALL_HINTS: Partial<Record<Agent, string>> = {
  claude: "Clone into .claude/skills/<name>/  (or a /plugin command)",
  cursor: "Copy the rule file into .cursor/rules/",
  codex: "Place AGENTS.md in your project root",
  gemini: "Place GEMINI.md in your project root",
  copilot: "Append to .github/copilot-instructions.md",
  windsurf: "Append rules to .windsurfrules",
  aider: "Add to CONVENTIONS.md and pass with --read",
  continue: "Add a rules file under .continue/rules/",
};

export function SubmitForm() {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [repoUrl, setRepoUrl] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [category, setCategory] = React.useState<Category | "">("");
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [install, setInstall] = React.useState<Partial<Record<Agent, string>>>({});

  const [errors, setErrors] = React.useState<Errors>({});
  const [status, setStatus] = React.useState<Status>("idle");
  const [issueUrl, setIssueUrl] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  function toggleAgent(agent: Agent) {
    setAgents((prev) =>
      prev.includes(agent) ? prev.filter((a) => a !== agent) : [...prev, agent],
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const payload = {
      name,
      description,
      repoUrl,
      author,
      category,
      agents,
      // Only send install commands for currently-selected agents.
      install: Object.fromEntries(
        agents.map((a) => [a, install[a] ?? ""]),
      ),
    };

    const result = submissionSchema.safeParse(payload);
    if (!result.success) {
      const next: Errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setStatus("submitting");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setFormError("Something went wrong validating your submission. Please try again.");
        return;
      }
      setIssueUrl(data.issueUrl as string);
      setStatus("success");
      // Open the prefilled GitHub issue in a new tab.
      window.open(data.issueUrl, "_blank", "noopener,noreferrer");
    } catch {
      setStatus("error");
      setFormError("Network error — please try again.");
    }
  }

  if (status === "success" && issueUrl) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent">
          <Check className="size-6 text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold">Almost there!</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          We&apos;ve prepared a prefilled GitHub issue. If it didn&apos;t open
          automatically, use the button below. A maintainer reviews each
          submission before it&apos;s listed.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <a href={issueUrl} target="_blank" rel="noopener noreferrer">
              <GithubIcon className="size-4" /> Open the GitHub issue
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setStatus("idle");
              setIssueUrl(null);
            }}
          >
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <Field label="Skill name" htmlFor="name" error={errors.name}>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Test Architect"
          aria-invalid={!!errors.name}
        />
      </Field>

      <Field
        label="One-line description"
        htmlFor="description"
        error={errors.description}
      >
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this skill help an agent do?"
          aria-invalid={!!errors.description}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="GitHub repo URL" htmlFor="repoUrl" error={errors.repoUrl}>
          <Input
            id="repoUrl"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            aria-invalid={!!errors.repoUrl}
          />
        </Field>
        <Field
          label="Author (GitHub user/org)"
          htmlFor="author"
          error={errors.author}
        >
          <Input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="e.g. anthropics"
            aria-invalid={!!errors.author}
          />
        </Field>
      </div>

      <Field label="Category" htmlFor="category" error={errors.category}>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          aria-invalid={!!errors.category}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="" disabled>
            Select a category…
          </option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      {/* Agents + per-agent install commands */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Supported agents</legend>
        {errors.agents && <FieldError message={errors.agents} />}
        <div className="flex flex-wrap gap-2">
          {AGENTS.map((agent) => {
            const active = agents.includes(agent);
            return (
              <button
                key={agent}
                type="button"
                aria-pressed={active}
                onClick={() => toggleAgent(agent)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40",
                )}
              >
                {active && <Check className="size-3.5" aria-hidden="true" />}
                {AGENT_LABELS[agent]}
              </button>
            );
          })}
        </div>

        {agents.length > 0 && (
          <div className="space-y-3 rounded-lg border border-border bg-card/50 p-4">
            <p className="text-xs text-muted-foreground">
              Add the install command or instruction for each selected agent.
            </p>
            {agents.map((agent) => {
              const key = `install.${agent}`;
              return (
                <Field
                  key={agent}
                  label={`${AGENT_LABELS[agent]} install`}
                  htmlFor={key}
                  error={errors[key]}
                >
                  <Textarea
                    id={key}
                    value={install[agent] ?? ""}
                    onChange={(e) =>
                      setInstall((prev) => ({ ...prev, [agent]: e.target.value }))
                    }
                    placeholder={INSTALL_HINTS[agent]}
                    aria-invalid={!!errors[key]}
                    rows={2}
                  />
                </Field>
              );
            })}
          </div>
        )}
      </fieldset>

      {formError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="size-4" aria-hidden="true" />
          {formError}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" && (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          )}
          Continue to GitHub
        </Button>
        <p className="text-xs text-muted-foreground">
          Opens a prefilled GitHub issue — no account data is stored.
        </p>
      </div>
    </form>
  );
}

/** Labeled field wrapper with inline error messaging. */
function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <FieldError message={error} />}
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1 text-xs text-destructive" role="alert">
      <AlertCircle className="size-3.5" aria-hidden="true" />
      {message}
    </p>
  );
}
