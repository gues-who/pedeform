"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ORDER_STATUS_LABEL } from "@pedeform/shared";
import { useMesaCart } from "@/contexts/mesa-cart-context";
import { useMesaOrders } from "@/contexts/mesa-orders-context";
import { useToast } from "@/contexts/toast-context";
import { formatBRL } from "@/data/mock-menu";
import Link from "next/link";
import { closeMesaBill } from "@/lib/api-client";
import { isOrderOpen } from "@/lib/order-utils";
import { mesaPedido } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const MIN_GUESTS = 1;
const MAX_GUESTS = 8;

function guestName(i: number) {
  return `Convidado ${i + 1}`;
}

export function ContaView({ mesaId }: { mesaId: string }) {
  const reduceMotion = useReducedMotion();
  const toast = useToast();
  const { lines, subtotalCents } = useMesaCart();
  const { allOrders, ordersLoading, refreshOrders } = useMesaOrders();

  const [guestCount, setGuestCount] = useState(2);
  const [weights, setWeights] = useState<number[]>(() => [0.5, 0.5]);
  const [paying, setPaying] = useState(false);

  const openOrders = useMemo(
    () => allOrders.filter(isOrderOpen),
    [allOrders],
  );

  const ordersSubtotalCents = useMemo(
    () => openOrders.reduce((s, o) => s + o.subtotalCents, 0),
    [openOrders],
  );

  /** Total da experiência: pedidos em aberto + rascunho do carrinho. */
  const billSubtotalCents = ordersSubtotalCents + subtotalCents;
  const serviceCents = Math.round(billSubtotalCents * 0.1);
  const grandTotal = billSubtotalCents + serviceCents;

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
    return weights.map((w) => (w / totalWeight) * grandTotal);
  }, [weights, grandTotal, totalWeight]);

  async function handlePay() {
    if (openOrders.length === 0) {
      toast("Não há pedidos enviados para pagar.", "warning");
      return;
    }
    setPaying(true);
    try {
      const res = await closeMesaBill(mesaId);
      await refreshOrders();
      toast(
        `Conta paga — ${formatBRL(res.totalPaidCents)}`,
        "success",
      );
      if (subtotalCents > 0) {
        toast("Ainda há itens no carrinho — envie ao pedido se quiser adicionar.", "info");
      }
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Não foi possível registrar o pagamento.";
      toast(msg, "error");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Conta
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Pedidos enviados à cozinha + rascunho no carrinho. Taxa de serviço
          10%.
        </p>
      </div>

      {ordersLoading && (
        <p className="flex items-center gap-2 text-sm text-zinc-500">
          <Spinner size="sm" /> Sincronizando pedidos…
        </p>
      )}

      {/* Pedidos enviados */}
      <Card>
        <CardTitle>Pedidos enviados</CardTitle>
        {openOrders.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Nenhum pedido em aberto.{" "}
            <Link
              href={mesaPedido(mesaId)}
              className="font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
            >
              Enviar da aba Pedido
            </Link>
          </p>
        ) : (
          <ul className="mt-3 space-y-3 text-sm">
            {openOrders.map((o) => (
              <li
                key={o.id}
                className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-zinc-500">{o.id}</span>
                  <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                    {ORDER_STATUS_LABEL[o.status]}
                  </span>
                </div>
                <ul className="mt-2 space-y-1 text-zinc-700 dark:text-zinc-300">
                  {o.items.map((it) => (
                    <li key={`${o.id}-${it.menuItemId}`} className="flex justify-between gap-2">
                      <span>
                        {it.name} × {it.quantity}
                      </span>
                      <span className="tabular-nums">
                        {formatBRL(it.unitPriceCents * it.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-right text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                  {formatBRL(o.subtotalCents)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Carrinho local */}
      <Card>
        <CardTitle>Carrinho (rascunho)</CardTitle>
        {lines.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Vazio — adicione itens no cardápio.
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
      </Card>

      <Card>
        <CardTitle>Resumo</CardTitle>
        <div className="mt-3 space-y-1 border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
            <span>Pedidos (em aberto)</span>
            <span className="tabular-nums">{formatBRL(ordersSubtotalCents)}</span>
          </div>
          <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
            <span>Carrinho</span>
            <span className="tabular-nums">{formatBRL(subtotalCents)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-zinc-900 dark:text-zinc-100">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatBRL(billSubtotalCents)}</span>
          </div>
          <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
            <span>Serviço (10%)</span>
            <span className="tabular-nums">{formatBRL(serviceCents)}</span>
          </div>
          <div className="flex justify-between border-t border-zinc-100 pt-2 text-base font-semibold text-zinc-900 dark:text-zinc-50 dark:border-zinc-800">
            <span>Total</span>
            <span className="tabular-nums">{formatBRL(grandTotal)}</span>
          </div>
        </div>
      </Card>

      {/* Convidados */}
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

      <Card>
        <CardTitle>Dividir proporcionalmente</CardTitle>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Ajuste o peso de cada convidado sobre o total geral.
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

      <Card className="space-y-4">
        <CardTitle>Pagamento</CardTitle>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Simula fechamento da conta no modo mock (Stripe depois). Só registra
          pedidos já enviados à cozinha.
        </p>
        <Button
          className="w-full gap-2 sm:max-w-sm"
          onClick={handlePay}
          disabled={paying || openOrders.length === 0}
        >
          {paying && <Spinner size="sm" />}
          {paying ? "Processando…" : "Pagar conta (demo)"}
        </Button>
        <p className="text-xs text-zinc-400">
          Total com taxa:{" "}
          <strong className="text-zinc-700 dark:text-zinc-300">
            {formatBRL(grandTotal)}
          </strong>
        </p>
      </Card>
    </div>
  );
}
