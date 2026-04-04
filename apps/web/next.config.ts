import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webAppDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(webAppDir, "../..");

/**
 * `loadEnvConfig` de `@next/env` pode usar cache global e ser influenciado pelo `cwd`.
 * Além disso, o Next carrega `./apps/web/.env*` por padrão.
 *
 * Aqui fazemos um merge manual estrito apenas de arquivos na raiz do monorepo, 
 * para garantir que NEXT_PUBLIC_FIREBASE_* estejam disponíveis se estiverem na raiz ou em apps/web/.
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
    // Não sobrescreve se já existir (mantém prioridade de .env.local da pasta apps/web)
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

// Carregar da raiz do monorepo se existirem
mergeEnvFile(path.join(monorepoRoot, ".env.local"));
mergeEnvFile(path.join(monorepoRoot, ".env"));

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
