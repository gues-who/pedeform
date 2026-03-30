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

  // Static export apenas no CI/GitHub Pages
  ...(isGhPages && {
    output: "export",
    basePath: "/pedeform",
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default withPWA(nextConfig);
