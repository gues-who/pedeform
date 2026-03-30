"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { admin, clienteRoot } from "@/lib/routes";

const nav = [
  { href: admin.root, label: "Visão geral", exact: true },
  { href: admin.operacao, label: "Operação", exact: false },
  { href: admin.pedidos, label: "Pedidos", exact: false },
  { href: admin.kds, label: "KDS — Cozinha", exact: false },
  { href: admin.financeiro, label: "Financeiro", exact: false },
  { href: admin.produtos, label: "Produtos", exact: false },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-950 md:flex-row">
      <aside className="border-b border-zinc-800 bg-zinc-950 text-zinc-100 md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-2 px-4 py-4 md:flex-col md:items-stretch md:gap-1">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
              Pedeform
            </p>
            <p className="text-sm font-semibold">Painel Admin</p>
          </div>
          <Link
            href={clienteRoot()}
            className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200 md:mt-3"
          >
            Switch mode: Cliente
          </Link>
        </div>

        <nav
          className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible md:px-2 md:pb-6"
          aria-label="Admin"
        >
          {nav.map(({ href, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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
