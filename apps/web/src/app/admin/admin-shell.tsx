"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { admin, mesaRoot } from "@/lib/routes";

const nav = [
  { href: admin.root, label: "Visão geral" },
  { href: admin.operacao, label: "Operação" },
  { href: admin.financeiro, label: "Financeiro" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-950 md:flex-row">
      <aside className="border-b border-zinc-800 bg-zinc-950 text-zinc-100 md:w-56 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-2 px-4 py-4 md:flex-col md:items-stretch">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
              Pedeform
            </p>
            <p className="text-sm font-semibold">Admin</p>
          </div>
          <Link
            href={mesaRoot("demo")}
            className="text-xs text-zinc-500 hover:text-zinc-300 md:mt-2"
          >
            Ver app mesa (demo)
          </Link>
        </div>
        <nav className="flex gap-1 px-2 pb-3 md:flex-col md:px-2 md:pb-6" aria-label="Admin">
          {nav.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="admin-nav"
                    className="absolute inset-0 -z-10 rounded-lg bg-zinc-800"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
