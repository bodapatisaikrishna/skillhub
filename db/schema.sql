-- SkillHub — Supabase/Postgres schema.
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE throughout.

-- ---------------------------------------------------------------------------
-- Table: one row per catalog entry, mirroring the Skill type in lib/data/types.ts.
-- ---------------------------------------------------------------------------
create table if not exists public.skills (
  slug             text primary key,
  name             text        not null,
  description      text        not null,
  long_description text,
  category         text        not null,
  repo_url         text        not null,
  author           text        not null,
  agents           text[]      not null default '{}',
  install          jsonb       not null default '{}'::jsonb,
  official         boolean     not null default false,
  tags             text[]      not null default '{}',
  stars            integer,
  last_updated     date,
  -- Generated full-text search vector over the human-readable fields. Weighted
  -- so name matches rank above description/tags/author.
  fts tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(tags, ' ')), 'C') ||
    setweight(to_tsvector('english', coalesce(author, '')), 'D')
  ) stored
);

-- ---------------------------------------------------------------------------
-- Indexes for the browse query (search + filters + sorts).
-- ---------------------------------------------------------------------------
create index if not exists skills_fts_idx       on public.skills using gin (fts);
create index if not exists skills_agents_idx     on public.skills using gin (agents);
create index if not exists skills_tags_idx       on public.skills using gin (tags);
create index if not exists skills_category_idx   on public.skills (category);
create index if not exists skills_stars_idx      on public.skills (stars desc nulls last);
create index if not exists skills_official_idx   on public.skills (official);
-- Trigram index lets ILIKE '%term%' stay fast as a substring fallback to FTS.
create extension if not exists pg_trgm;
create index if not exists skills_name_trgm_idx  on public.skills using gin (name gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Stats helper: single round-trip for the home hero (total + distinct authors).
-- ---------------------------------------------------------------------------
create or replace function public.skills_stats()
returns table (skills bigint, developers bigint)
language sql stable as $$
  select count(*)::bigint as skills,
         count(distinct author)::bigint as developers
  from public.skills;
$$;

-- ---------------------------------------------------------------------------
-- Category counts: one round-trip for the home category grid.
-- ---------------------------------------------------------------------------
create or replace function public.skills_category_counts()
returns table (category text, count bigint)
language sql stable as $$
  select category, count(*)::bigint as count
  from public.skills
  group by category;
$$;

-- ---------------------------------------------------------------------------
-- Batch star/date update used by the daily sync (/api/sync). Called with the
-- service-role key; security-invoker so anon (no UPDATE policy) cannot write.
-- ---------------------------------------------------------------------------
create or replace function public.update_skill_stars(updates jsonb)
returns void
language sql as $$
  update public.skills s
  set stars = u.stars,
      last_updated = u.last_updated
  from jsonb_to_recordset(updates)
       as u(slug text, stars integer, last_updated date)
  where s.slug = u.slug;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security: the catalog is public read-only. The anon key may SELECT;
-- writes go through the service-role key (which bypasses RLS).
-- ---------------------------------------------------------------------------
alter table public.skills enable row level security;

drop policy if exists "public read skills" on public.skills;
create policy "public read skills"
  on public.skills for select
  using (true);
