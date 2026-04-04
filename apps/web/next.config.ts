import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import { loadEnvConfig } from "@next/env";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webAppDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(webAppDir, "../..");

/**
 * Merge manual: raiz do monorepo (só preenche chaves ainda indefinidas).
 */
function mergeEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const body = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;
    const eq = body.indexOf("=");
    if (eq === -1) continue;
    const key = body.slice(0, eq).trim();
    let val = body.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

mergeEnvFile(path.join(monorepoRoot, ".env.local"));
mergeEnvFile(path.join(monorepoRoot, ".env"));

/**
 * O Next pode inicializar `@next/env` antes do `next.config`; o cache global impede reler `apps/web/.env*`.
 * Carregamos explicitamente a pasta do app (caminho absoluto) com `forceReload` para `NEXT_PUBLIC_*` entrarem no bundle.
 */
const isDev = process.env.NODE_ENV !== "production";
loadEnvConfig(webAppDir, isDev, console, true);

const isGhPages = process.env.GITHUB_ACTIONS === "true";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development" || isGhPages,
  register: true,
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
  },
});

const nextConfig: NextConfig = {
  transpilePackages: ["@pedeform/shared"],
  async rewrites() {
    if (isGhPages) return [];
    const target = process.env.API_PROXY_TARGET ?? "http://127.0.0.1:3001";
    return [
      { source: "/api/:path*", destination: `${target}/v1/:path*` },
    ];
  },
  ...(isGhPages && {
    output: "export",
    basePath: "/pedeform",
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default withPWA(nextConfig);
