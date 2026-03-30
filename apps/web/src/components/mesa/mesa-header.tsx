"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { admin, mesaAcompanhar, mesaConta, mesaMenu, mesaPedido } from "@/lib/routes";

export function MesaHeader({
  mesaId,
  label,
}: {
  mesaId: string;
  label?: string;
}) {
  const pathname = usePathname();
  const tab = [
    { path: mesaMenu(mesaId), label: "Cardápio" },
    { path: mesaPedido(mesaId), label: "Pedido" },
    { path: mesaConta(mesaId), label: "Conta" },
    { path: mesaAcompanhar(mesaId), label: "Acompanhar" },
  ].find((t) => pathname === t.path);

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-zinc-50/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-500">
            Sessão
          </p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {label ?? `Mesa ${mesaId}`}
          </p>
          {tab && (
            <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Aba atual: {tab.label}
            </p>
          )}
        </div>
        <Link
          href={admin.root}
          className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Switch mode: Admin
        </Link>
      </div>
    </header>
  );
}
