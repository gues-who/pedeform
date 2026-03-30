"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MENU_CATEGORIES, MENU_ITEMS, formatBRL, type MenuCategoryId } from "@/data/mock-menu";
import { useMesaCart } from "@/contexts/mesa-cart-context";
import { Button } from "@/components/ui/button";

export function MenuView() {
  const reduceMotion = useReducedMotion();
  const [cat, setCat] = useState<MenuCategoryId>("entradas");
  const { addLine } = useMesaCart();

  const items = useMemo(
    () => MENU_ITEMS.filter((i) => i.category === cat),
    [cat],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Cardápio
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Toque para adicionar ao pedido. Harmonizações do sommelier quando
          disponíveis.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MENU_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(c.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              cat === c.id
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-200/80 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <ul className="space-y-4">
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
            className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div
              className={`relative aspect-[21/9] w-full bg-gradient-to-br ${item.imageGradient}`}
              aria-hidden
            />
            <div className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-medium text-zinc-900 dark:text-zinc-100">
                    {item.name}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.description}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {formatBRL(item.priceCents)}
                </p>
              </div>
              {item.sommelierNote && (
                <div className="rounded-xl bg-zinc-100/80 px-3 py-2 dark:bg-zinc-900/80">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    Sommelier
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">
                    {item.sommelierNote}
                  </p>
                </div>
              )}
              <Button
                className="w-full sm:w-auto"
                onClick={() =>
                  addLine({
                    menuItemId: item.id,
                    name: item.name,
                    unitPriceCents: item.priceCents,
                    quantity: 1,
                  })
                }
              >
                Adicionar ao pedido
              </Button>
            </div>
          </motion.li>
        ))}
      </ul>

      <p className="pb-4 text-center text-xs text-zinc-500">
        Imagens ilustrativas · Cardápio sazonal sujeito a disponibilidade
      </p>
    </div>
  );
}
