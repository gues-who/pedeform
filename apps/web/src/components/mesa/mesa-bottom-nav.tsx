"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useMesaCart } from "@/contexts/mesa-cart-context";
import {
  mesaAcompanhar,
  mesaConta,
  mesaMenu,
  mesaPedido,
} from "@/lib/routes";

const links = [
  { href: (id: string) => mesaMenu(id), label: "Cardápio", showCount: false },
  { href: (id: string) => mesaPedido(id), label: "Pedido", showCount: true },
  { href: (id: string) => mesaConta(id), label: "Conta", showCount: false },
  { href: (id: string) => mesaAcompanhar(id), label: "Acompanhar", showCount: false },
] as const;

export function MesaBottomNav({ mesaId }: { mesaId: string }) {
  const pathname = usePathname();
  const { itemCount } = useMesaCart();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200/90 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90"
      aria-label="Navegação da mesa"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-1 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        {links.map(({ href, label, showCount }) => {
          const path = href(mesaId);
          const active = pathname === path;
          return (
            <li key={path} className="flex-1">
              <Link
                href={path}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center rounded-xl py-2 text-xs font-medium transition-colors ${
                  active
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="mesa-nav-pill"
                    className="absolute inset-0 -z-10 rounded-xl bg-zinc-100 dark:bg-zinc-800"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1 px-1">
                  {label}
                  {showCount && itemCount > 0 && (
                    <span className="min-w-[1.1rem] rounded-full bg-zinc-900 px-1 text-center text-[10px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </span>
                {active && (
                  <span className="relative z-10 mt-1 h-1 w-6 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
