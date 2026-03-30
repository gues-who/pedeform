"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ORDER_STATUS_LABEL } from "@pedeform/shared";
import { useMesaCart } from "@/contexts/mesa-cart-context";
import { useMesaOrders, useOrderSubmit } from "@/contexts/mesa-orders-context";
import { sortOrdersByActivity } from "@/lib/order-utils";
import { useToast } from "@/contexts/toast-context";
import { formatBRL } from "@/data/mock-menu";
import { mesaAcompanhar } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export function PedidoView({ mesaId }: { mesaId: string }) {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const { lines, setQuantity, removeLine, subtotalCents, itemCount, clear } =
    useMesaCart();
  const { submitState, submitError, allOrders, ordersLoading } = useMesaOrders();
  const recentOrders = sortOrdersByActivity(allOrders).slice(0, 5);
  const submitOrder = useOrderSubmit(mesaId);
  const toast = useToast();

  const isSubmitting = submitState === "submitting";

  async function handleEnviar() {
    if (lines.length === 0) return;
    try {
      await submitOrder(lines);
      toast("Pedido enviado! Ele já aparece em Conta e Acompanhar.", "success");
      clear();
      router.push(mesaAcompanhar(mesaId));
    } catch {
      // erro tratado pelo context
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Seu pedido
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Revise os itens antes de enviar à cozinha.
        </p>
      </div>

      {recentOrders.length > 0 && (
        <Card className="border-zinc-200/80 dark:border-zinc-800">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Pedidos recentes (mesa)
          </p>
          {ordersLoading ? (
            <p className="mt-2 text-sm text-zinc-500">Carregando…</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {recentOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900/80"
                >
                  <span className="font-mono text-xs text-zinc-500">{o.id}</span>
                  <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">
                    {ORDER_STATUS_LABEL[o.status]}
                  </span>
                  <span className="w-full text-right text-xs tabular-nums text-zinc-600 dark:text-zinc-400 sm:w-auto">
                    {formatBRL(o.subtotalCents)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {lines.length === 0 ? (
        <Card className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Nenhum item ainda. Abra o cardápio para adicionar pratos.
        </Card>
      ) : (
        <ul className="space-y-3">
          {lines.map((line, i) => (
            <motion.li
              key={line.menuItemId}
              initial={reduceMotion ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduceMotion ? 0 : i * 0.03 }}
            >
              <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {line.name}
                  </p>
                  <p className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                    {formatBRL(line.unitPriceCents)} × {line.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-full border border-zinc-200 dark:border-zinc-700">
                    <button
                      type="button"
                      aria-label="Diminuir"
                      className="px-3 py-1.5 text-lg leading-none text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      onClick={() =>
                        setQuantity(line.menuItemId, line.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span className="min-w-[2ch] text-center text-sm font-medium tabular-nums">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Aumentar"
                      className="px-3 py-1.5 text-lg leading-none text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      onClick={() =>
                        setQuantity(line.menuItemId, line.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-red-600 underline-offset-2 hover:underline dark:text-red-400"
                    onClick={() => removeLine(line.menuItemId)}
                  >
                    Remover
                  </button>
                </div>
              </Card>
            </motion.li>
          ))}
        </ul>
      )}

      {lines.length > 0 && (
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Subtotal
            </p>
            <p className="text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {formatBRL(subtotalCents)}
            </p>
            <p className="text-xs text-zinc-500">{itemCount} itens</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            {submitError && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {submitError}
              </p>
            )}
            <Button
              type="button"
              onClick={handleEnviar}
              disabled={isSubmitting}
              className="w-full gap-2 sm:w-auto"
            >
              {isSubmitting && <Spinner size="sm" />}
              {isSubmitting ? "Enviando…" : "Enviar à cozinha"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
