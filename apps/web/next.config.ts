import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// Quando rodando no GitHub Actions, gera export estático para o GitHub Pages.
const isGhPages = process.env.GITHUB_ACTIONS === "true";

const withPWA = withPWAInit({
  dest: "public",
  // Desabilitar PWA no export estático e em desenvolvimento
  disable: process.env.NODE_ENV === "development" || isGhPages,
  register: true,
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
  },
});

const nextConfig: NextConfig = {
  transpilePackages: ["@pedeform/shared"],

  /**
   * Em dev e `next start`, o browser chama a API pelo mesmo host (`/api/...`),
   * evitando CORS e "Failed to fetch" ao usar localhost:3000 → localhost:3001.
   * No export estático (GitHub Pages) não há servidor Next — use NEXT_PUBLIC_API_URL.
   */
  async rewrites() {
    if (isGhPages) return [];
    const target = process.env.API_PROXY_TARGET ?? "http://127.0.0.1:3001";
    return [
      { source: "/api/:path*", destination: `${target}/v1/:path*` },
    ];
  },

  // Static export apenas no CI/GitHub Pages
  ...(isGhPages && {
    output: "export",
    basePath: "/pedeform",
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default withPWA(nextConfig);
