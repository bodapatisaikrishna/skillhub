import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root to this project. A stray package-lock.json in the
  // home directory otherwise makes Next infer the wrong root.
  turbopack: {
    root: __dirname,
  },
  // Type-check + lint run during the production build again: the catalog now
  // lives in Supabase (lib/data/seed.json is no longer imported), so there is no
  // 10k-element JSON literal to blow up `tsc`.
};

export default nextConfig;
