"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import type { MenuCategoryId, SharedMenuCategory, SharedMenuItem } from "@pedeform/shared";
import {
  MENU_CATEGORIES as FALLBACK_CATEGORIES,
  MENU_ITEMS as FALLBACK_ITEMS,
  formatBRL,
  resolveMenuItemImageUrl,
} from "@/data/mock-menu";
import { useMesaCart } from "@/contexts/mesa-cart-context";
import { fetchMenuCategories, fetchMenuItems } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

function withDetectedBasePath(path: string) {
  if (!path.startsWith("/")) return path;
  if (typeof window === "undefined") return path;
  if (window.location.pathname.startsWith("/pedeform/")) {
    return `/pedeform${path}`;
  }
  return path;
}

export function MenuView() {
  const reduceMotion = useReducedMotion();
  const [categories, setCategories] =
    useState<SharedMenuCategory[]>(FALLBACK_CATEGORIES);
  const [catalog, setCatalog] = useState<SharedMenuItem[]>(FALLBACK_ITEMS);
  const [failedImages, setFailedImages] = useState<Record<string, true>>({});
  const [loading, setLoading] = useState(true);

  const [cat, setCat] = useState<MenuCategoryId>("entradas");
  const { addLine } = useMesaCart();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, items] = await Promise.all([
          fetchMenuCategories(),
          fetchMenuItems(),
        ]);
        if (!cancelled && cats.length && items.length) {
          setCategories(cats);
          setCatalog(items);
          setCat((prev) =>
            cats.some((c) => c.id === prev) ? prev : cats[0]!.id,
          );
        }
      } catch {
        /* fallback local já aplicado */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(
    () => catalog.filter((i) => i.category === cat),
    [catalog, cat],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Spinner size="sm" />
          Carregando cardápio…
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Cardápio
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Toque para adicionar ao pedido.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
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
        {items.map((item, index) => {
          const resolvedImage = resolveMenuItemImageUrl(item);
          const imageSrc = resolvedImage ? withDetectedBasePath(resolvedImage) : undefined;
          return (
            <motion.li
            key={item.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
            className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="relative aspect-[21/9] w-full overflow-hidden">
              {imageSrc && !failedImages[item.id] ? (
                <Image
                  src={imageSrc}
                  alt={item.name}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 640px"
                  className="object-cover"
                  onError={() =>
                    setFailedImages((prev) => {
                      if (prev[item.id]) return prev;
                      return { ...prev, [item.id]: true };
                    })
                  }
                />
              ) : (
                <div
                  className={`h-full w-full bg-gradient-to-br ${item.imageGradient}`}
                  aria-hidden
                />
              )}
            </div>
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
          );
        })}
      </ul>

      <p className="pb-4 text-center text-xs text-zinc-500">
        Imagens ilustrativas · Cardápio sazonal sujeito a disponibilidade
      </p>
    </div>
  );
}
