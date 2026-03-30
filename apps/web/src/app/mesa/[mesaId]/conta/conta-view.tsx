"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useMesaCart } from "@/contexts/mesa-cart-context";
import { formatBRL } from "@/data/mock-menu";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

const GUESTS = ["Convidado 1", "Convidado 2", "Convidado 3"] as const;

export function ContaView() {
  const reduceMotion = useReducedMotion();
  const { lines, subtotalCents } = useMesaCart();
  const [weights, setWeights] = useState<number[]>(() =>
    GUESTS.map(() => 1 / GUESTS.length),
  );

  const totalWeight = useMemo(
    () => weights.reduce((a, b) => a + b, 0),
    [weights],
  );

  const shares = useMemo(() => {
    if (totalWeight === 0) {
      return GUESTS.map(() => 0);
    }
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
          Divisão facilitada por convidado. Taxa de serviço ilustrativa (10%).
        </p>
      </div>

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
        <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <div className="flex justify-between text-sm font-medium text-zinc-900 dark:text-zinc-100">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatBRL(subtotalCents)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
            <span>Serviço (10%)</span>
            <span className="tabular-nums">{formatBRL(serviceCents)}</span>
          </div>
          <div className="mt-3 flex justify-between text-base font-semibold text-zinc-900 dark:text-zinc-50">
            <span>Total</span>
            <span className="tabular-nums">{formatBRL(grandTotal)}</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Dividir entre convidados</CardTitle>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Ajuste o peso relativo de cada um; o total da conta é distribuído
          proporcionalmente.
        </p>
        <ul className="mt-4 space-y-4">
          {GUESTS.map((name, i) => (
            <motion.li
              key={name}
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : i * 0.05 }}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {name}
              </span>
              <div className="flex flex-1 items-center gap-3 sm:max-w-xs">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(weights[i]! * 100)}
                  onChange={(e) => {
                    const v = Number(e.target.value) / 100;
                    setWeights((prev) => {
                      const next = [...prev];
                      next[i] = v;
                      return next;
                    });
                  }}
                  className="h-2 flex-1 accent-zinc-900 dark:accent-zinc-100"
                  aria-label={`Peso ${name}`}
                />
                <span className="w-24 text-right text-sm tabular-nums text-zinc-700 dark:text-zinc-300">
                  {formatBRL(Math.round(shares[i] ?? 0))}
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-3">
        <CardTitle>Pagamento</CardTitle>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Checkout com Stripe (Apple Pay / Google Pay / cartão). Integração
          pendente no back-end.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" type="button" disabled>
            Pagar com 1 toque (Stripe)
          </Button>
          <Button variant="secondary" className="flex-1" type="button" disabled>
            Cartão manual
          </Button>
        </div>
      </Card>
    </div>
  );
}
