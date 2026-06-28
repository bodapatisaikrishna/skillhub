/**
 * One-time (re-runnable) loader: pushes lib/data/seed.json into the Supabase
 * `skills` table. Idempotent — upserts on the `slug` primary key.
 *
 * Usage:
 *   1. Create the table by running db/schema.sql in the Supabase SQL editor.
 *   2. Put SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.
 *   3. npm run seed:db
 *
 * The service-role key bypasses RLS and must never be committed or shipped to
 * the client — it lives only in .env.local (gitignored) / Vercel server env.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_PATH = join(__dirname, "..", "lib", "data", "seed.json");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local.",
  );
  process.exit(1);
}

const client = createClient(url, key, { auth: { persistSession: false } });

const skills = JSON.parse(readFileSync(SEED_PATH, "utf8"));
console.log(`Seeding ${skills.length} skills into Supabase…`);

const rows = skills.map((e) => ({
  slug: e.slug,
  name: e.name,
  description: e.description,
  long_description: e.longDescription ?? null,
  category: e.category,
  repo_url: e.repoUrl,
  author: e.author,
  agents: e.agents ?? [],
  install: e.install ?? {},
  official: Boolean(e.official),
  tags: e.tags ?? [],
  stars: typeof e.stars === "number" ? e.stars : null,
  last_updated:
    typeof e.lastUpdated === "string" ? e.lastUpdated.slice(0, 10) : null,
}));

const BATCH = 500;
let done = 0;
for (let i = 0; i < rows.length; i += BATCH) {
  const chunk = rows.slice(i, i + BATCH);
  const { error } = await client
    .from("skills")
    .upsert(chunk, { onConflict: "slug" });
  if (error) {
    console.error(`\nBatch at row ${i} failed:`, error.message);
    process.exit(1);
  }
  done += chunk.length;
  process.stdout.write(`\r  upserted ${done}/${rows.length}`);
}

const { count } = await client
  .from("skills")
  .select("slug", { count: "exact", head: true });
console.log(`\nDone. Table now has ${count} rows.`);
