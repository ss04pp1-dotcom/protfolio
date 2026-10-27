import type { NextConfig } from "next";

/**
 * Local dev + sandbox build: standard standalone Next.js server
 * (API routes in src/app/api run on node:sqlite).
 *
 * Cloudflare build (CI only, BUILD_EXPORT=1): static export to ./out
 * — the API layer is served by Cloudflare Pages Functions
 * (functions/api/**) backed by D1, so src/app/api is removed first.
 */
const isExport = process.env.BUILD_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(isExport
    ? { output: "export" as const, images: { unoptimized: true } }
    : { output: "standalone" as const }),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
