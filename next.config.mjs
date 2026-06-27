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
  // The catalog (lib/data/seed.json) is a ~10k-entry generated file. Letting
  // `next build` type-check it makes TypeScript infer a 10k-element literal
  // type, which is prohibitively slow and can OOM the build. Types and lint are
  // verified separately via `npm run typecheck` / `npm run lint`, so it is safe
  // to skip those steps during the production build.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
