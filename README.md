# SkillHub

A cross-agent directory for AI coding-agent skills. Discover, compare, and
copy-install skills and rules for **Claude Code, Cursor, Codex CLI, Gemini CLI,
GitHub Copilot, Windsurf, Aider, and Continue**.

> **SkillHub is a directory only.** It links to source repositories and shows
> per-agent install instructions. It never hosts, stores, or executes skill
> code. Always review a repo before installing anything from it.

## Tech stack

- **Next.js (App Router) + TypeScript** (strict, no `any`)
- **Tailwind CSS v4 + shadcn/ui** components
- **Local typed data layer** (JSON seed + types) behind a single data-access
  module — built so a Supabase (or KV) backend can be swapped in later by
  touching only that module
- **GitHub REST API** for live stars / last-updated, synced server-side on a
  daily cron (tokens never reach the client)
- Deployed on **Vercel**

## Local development

```bash
npm install
cp .env.example .env.local   # optional — the app runs without any env vars
npm run dev                  # http://localhost:3000
```

Useful scripts:

```bash
npm run build       # production build (also type-checks)
npm run start       # serve the production build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
```

## Environment variables

All are **optional** — the app degrades gracefully without them. See
[`.env.example`](.env.example).

| Variable | Scope | Purpose |
| --- | --- | --- |
| `GITHUB_TOKEN` | server only | Authenticates the GitHub sync to avoid the 60 req/hr unauthenticated limit. A fine-grained PAT with public-repo read is enough. Never exposed to the client. |
| `CRON_SECRET` | server only | If set, `/api/sync` requires `Authorization: Bearer <CRON_SECRET>`. Vercel Cron sends this automatically. |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical base URL for SEO/OG tags, sitemap, and robots. |
| `NEXT_PUBLIC_SUBMIT_REPO` | public | `owner/repo` that the submission form opens prefilled GitHub issues against. |

Secrets live only in `.env.local` (gitignored) and in your Vercel project
settings — never in the repo.

## Project structure

```
app/
  page.tsx              Home (hero, search, categories, featured)
  browse/page.tsx       Filterable/searchable/sortable grid (URL-driven state)
  skill/[slug]/page.tsx Skill detail + per-agent copy-install + SEO metadata
  submit/page.tsx       Submission form
  api/sync/route.ts     Daily GitHub metadata sync (cron)
  api/submit/route.ts   Validates a submission -> prefilled GitHub issue URL
  sitemap.ts, robots.ts, not-found.tsx
lib/
  data/
    types.ts            Skill / Agent / Category types + label constants
    seed.json           Catalog seed (real + clearly-tagged placeholder entries)
    index.ts            >>> the single data-access seam (swap to Supabase here)
    cache.ts            Live-metadata cache (stars / last-updated)
  github.ts             Server-only GitHub REST client (error-safe)
  filters.ts            Browse filter model + URL (de)serialization
  submit.ts             zod schema + GitHub-issue builder
  format.ts, site.ts    Display helpers + public site config
components/             SkillCard, FilterBar, CopyButton, AgentBadge, etc.
```

## Adding a new skill

Edit [`lib/data/seed.json`](lib/data/seed.json) and add an object matching the
`Skill` type in [`lib/data/types.ts`](lib/data/types.ts):

```jsonc
{
  "slug": "my-skill",                       // url-safe, unique
  "name": "My Skill",
  "description": "One-line summary.",
  "longDescription": "Optional longer copy for the detail page.",
  "category": "Coding",                     // one of the 6 categories
  "repoUrl": "https://github.com/owner/repo",
  "author": "owner",
  "agents": ["claude", "cursor"],           // agents it supports
  "install": {                              // one command per supported agent
    "claude": "Clone into .claude/skills/my-skill/.",
    "cursor": "Copy my-skill.mdc into .cursor/rules/."
  },
  "official": false,
  "tags": ["example"]
}
```

Leave `stars` and `lastUpdated` out — the daily sync fills them from GitHub.
The placeholder entries (tagged `"placeholder"`) are meant to be replaced with
real skills over time.

> The data layer is intentionally isolated. When the seed outgrows a JSON file,
> reimplement the functions in `lib/data/index.ts` (and `cache.ts`) against
> Supabase/Postgres — **no page or component changes required.**

## GitHub metadata sync

`/api/sync` iterates the seed repos, fetches `stargazers_count` and `pushed_at`,
writes a small cache, and revalidates the affected pages. Failures (404, rate
limit, network) are collected per-repo and never abort the run — pages always
render from the seed even if live data is missing.

[`vercel.json`](vercel.json) registers a daily cron at 06:00 UTC. To seed live
data immediately after a deploy, hit `https://<your-domain>/api/sync` once.

> **Production note:** the v1 cache is a JSON file in the OS temp dir. On a
> single persistent instance this works fully. On Vercel, `/tmp` is per-lambda
> and not shared between the cron and page-serving invocations, so the most
> reliable freshness comes from the build-time cache. Persistent live data is
> exactly what the deferred Supabase/KV swap (same data seam) provides.

## Submitting skills

The `/submit` form validates input with zod and opens a **prefilled GitHub
issue** on `NEXT_PUBLIC_SUBMIT_REPO`. There's no database in v1 — submissions
become issues that are **reviewed manually** before listing. Curation is the
moat; auto-listing everything with a `SKILL.md` would fill the site with noise.

## Deployment (Vercel)

1. Push to GitHub:
   ```bash
   git init && git add . && git commit -m "feat: SkillHub v1"
   gh repo create skillhub --public --source=. --push
   ```
2. Import the repo at [vercel.com](https://vercel.com) -> **New Project**
   (framework auto-detected as Next.js).
3. Add env vars (at minimum `GITHUB_TOKEN` and `NEXT_PUBLIC_SUBMIT_REPO`).
4. Deploy. Confirm the daily `/api/sync` cron under **Settings -> Cron Jobs**,
   then hit `/api/sync` once to seed live star counts.
5. (Optional) Add a custom domain under **Settings -> Domains**. Avoid clashing
   with `agentskills.io` (Anthropic's open Agent Skills standard).

## License & attribution

SkillHub is not affiliated with the listed projects; all trademarks belong to
their respective owners. Linked repositories retain their own licenses.
