"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useMesaCart } from "@/contexts/mesa-cart-context";
import { useToast } from "@/contexts/toast-context";
import { formatBRL } from "@/data/mock-menu";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

const MIN_GUESTS = 1;
const MAX_GUESTS = 8;

function guestName(i: number) {
  return `Convidado ${i + 1}`;
}

export function ContaView() {
  const reduceMotion = useReducedMotion();
  const toast = useToast();
  const { lines, subtotalCents } = useMesaCart();

  const [guestCount, setGuestCount] = useState(2);
  const [weights, setWeights] = useState<number[]>([0.5, 0.5]);

  function changeGuestCount(n: number) {
    const next = Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, n));
    setGuestCount(next);
    setWeights(Array.from({ length: next }, () => 1 / next));
  }

  const totalWeight = useMemo(
    () => weights.reduce((a, b) => a + b, 0),
    [weights],
  );

  const shares = useMemo(() => {
    if (totalWeight === 0) return weights.map(() => 0);
    return weights.map((w) => (w / totalWeight) * subtotalCents);
  }, [weights, subtotalCents, totalWeight]);

  const serviceCents = Math.round(subtotalCents * 0.1);
  const grandTotal = subtotalCents + serviceCents;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Conta
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Divisão facilitada por convidado. Taxa de serviço 10%.
        </p>
      </div>

      {/* Resumo de itens */}
      <Card>
        <CardTitle>Itens</CardTitle>
        {lines.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Carrinho vazio — volte ao cardápio.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {lines.map((l) => (
              <li
                key={l.menuItemId}
                className="flex justify-between gap-2 text-zinc-800 dark:text-zinc-200"
              >
                <span>
                  {l.name} × {l.quantity}
                </span>
                <span className="tabular-nums">
                  {formatBRL(l.unitPriceCents * l.quantity)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 border-t border-zinc-200 pt-3 space-y-1 dark:border-zinc-800">
          <div className="flex justify-between text-sm font-medium text-zinc-900 dark:text-zinc-100">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatBRL(subtotalCents)}</span>
          </div>
          <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
            <span>Serviço (10%)</span>
            <span className="tabular-nums">{formatBRL(serviceCents)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-zinc-900 dark:text-zinc-50 pt-1 border-t border-zinc-100 dark:border-zinc-800 mt-1">
            <span>Total</span>
            <span className="tabular-nums">{formatBRL(grandTotal)}</span>
          </div>
        </div>
      </Card>

      {/* Número de convidados */}
      <Card>
        <CardTitle>Convidados</CardTitle>
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            aria-label="Remover convidado"
            disabled={guestCount <= MIN_GUESTS}
            onClick={() => changeGuestCount(guestCount - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-lg text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            −
          </button>
          <span className="min-w-[3ch] text-center text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {guestCount}
          </span>
          <button
            type="button"
            aria-label="Adicionar convidado"
            disabled={guestCount >= MAX_GUESTS}
            onClick={() => changeGuestCount(guestCount + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-lg text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            +
          </button>
          <span className="text-sm text-zinc-500">
            {formatBRL(Math.round(grandTotal / guestCount))} / pessoa (igual)
          </span>
        </div>
      </Card>

      {/* Divisão proporcional */}
      <Card>
        <CardTitle>Dividir proporcionalmente</CardTitle>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Arraste para ajustar o peso de cada convidado.
        </p>
        <ul className="mt-4 space-y-4">
          <AnimatePresence initial={false}>
            {Array.from({ length: guestCount }).map((_, i) => (
              <motion.li
                key={i}
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={{ delay: reduceMotion ? 0 : i * 0.04 }}
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
              >
                <span className="w-28 shrink-0 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {guestName(i)}
                </span>
                <div className="flex flex-1 items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round((weights[i] ?? 0) * 100)}
                    onChange={(e) => {
                      const v = Number(e.target.value) / 100;
                      setWeights((prev) => {
                        const next = [...prev];
                        while (next.length < guestCount) next.push(0);
                        next[i] = v;
                        return next.slice(0, guestCount);
                      });
                    }}
                    className="h-2 flex-1 accent-zinc-900 dark:accent-zinc-100"
                    aria-label={`Peso ${guestName(i)}`}
                  />
                  <span className="w-24 text-right text-sm tabular-nums text-zinc-700 dark:text-zinc-300">
                    {formatBRL(Math.round(shares[i] ?? 0))}
                  </span>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </Card>

      {/* Pagamento */}
      <Card className="space-y-4">
        <CardTitle>Pagamento</CardTitle>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Checkout via Stripe — Apple Pay, Google Pay e cartão. Integração
          pendente com back-end.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1"
            onClick={() =>
              toast("Stripe não integrado — ambiente de demonstração.", "warning")
            }
          >
            Pagar com 1 toque
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() =>
              toast("Stripe não integrado — ambiente de demonstração.", "warning")
            }
          >
            Informar cartão
          </Button>
        </div>
        <p className="text-xs text-zinc-400">
          Total a pagar:{" "}
          <strong className="text-zinc-700 dark:text-zinc-300">
            {formatBRL(grandTotal)}
          </strong>
        </p>
      </Card>
    </div>
  );
}
