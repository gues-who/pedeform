"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { OrderStatus } from "@pedeform/shared";
import { ORDER_STATUS_LABEL } from "@pedeform/shared";
import { useMesaOrders } from "@/contexts/mesa-orders-context";
import { mesaConta, mesaPedido } from "@/lib/routes";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const STEPS: { status: OrderStatus; detail: string }[] = [
  { status: "pending", detail: "Confirmado pelo salão" },
  { status: "preparing", detail: "Cozinha trabalhando nos seus pratos" },
  { status: "almost_ready", detail: "Montagem e harmonização final" },
  { status: "served", detail: "Servido à mesa" },
];

const STATUS_ORDER: OrderStatus[] = [
  "pending",
  "preparing",
  "almost_ready",
  "served",
  "paid",
];

function stepDone(currentStatus: OrderStatus, stepStatus: OrderStatus) {
  if (currentStatus === "paid") return true;
  return (
    STATUS_ORDER.indexOf(currentStatus) >= STATUS_ORDER.indexOf(stepStatus)
  );
}

export function AcompanharView({ mesaId }: { mesaId: string }) {
  const reduceMotion = useReducedMotion();
  const { currentOrder, ordersLoading, ordersError } = useMesaOrders();

  if (ordersLoading && !currentOrder) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Spinner size="sm" />
        Carregando pedidos…
      </div>
    );
  }

  if (ordersError && !currentOrder) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Acompanhar
        </h1>
        <Card className="text-sm text-amber-800 dark:text-amber-200">
          {ordersError}
        </Card>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Acompanhar
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Nenhum pedido ativo no momento.
          </p>
        </div>
        <Card className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Adicione itens no cardápio e envie à cozinha para acompanhar aqui.
          <div className="mt-4">
            <Link
              href={mesaPedido(mesaId)}
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Ir para o pedido
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const isPaid = currentOrder.status === "paid";
  const isLive =
    !isPaid &&
    currentOrder.status !== "served";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Acompanhar
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Pedido{" "}
            <code className="rounded bg-zinc-200 px-1 text-[11px] dark:bg-zinc-800">
              {currentOrder.id}
            </code>
          </p>
        </div>
        {isPaid ? (
          <Badge tone="success">Pago</Badge>
        ) : isLive ? (
          <Badge tone="success">Ao vivo</Badge>
        ) : (
          <Badge tone="warning">Aguardando pagamento</Badge>
        )}
      </div>

      <Card>
        <ol className="relative space-y-6">
          {STEPS.map((step, index) => {
            const done = stepDone(currentOrder.status, step.status);
            const isCurrent =
              !isPaid && currentOrder.status === step.status;

            return (
              <li key={step.status} className="relative flex gap-4 pl-1">
                {index < STEPS.length - 1 && (
                  <span
                    className="absolute bottom-[-1.35rem] left-[1.15rem] top-10 w-px bg-zinc-200 dark:bg-zinc-800"
                    aria-hidden
                  />
                )}
                <motion.div
                  key={`${step.status}-${done}`}
                  initial={reduceMotion ? false : { scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    done
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                        ? "border-2 border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                        : "border-2 border-zinc-300 text-zinc-400 dark:border-zinc-600"
                  }`}
                >
                  {done ? "✓" : index + 1}
                </motion.div>
                <div>
                  <p
                    className={`font-medium ${done || isCurrent ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600"}`}
                  >
                    {ORDER_STATUS_LABEL[step.status]}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {step.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {isPaid && (
          <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {ORDER_STATUS_LABEL.paid} — obrigado pela visita.
            </p>
            <Link
              href={mesaConta(mesaId)}
              className="mt-2 inline-block text-sm text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
            >
              Ver conta →
            </Link>
          </div>
        )}

        {!isPaid && currentOrder.status === "served" && (
          <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Pronto para fechar? Vá à aba Conta para pagar.
            </p>
            <Link
              href={mesaConta(mesaId)}
              className="mt-2 inline-flex rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Ir para a conta
            </Link>
          </div>
        )}
      </Card>

      <p className="text-center text-xs text-zinc-500">
        Atualização automática do status do pedido.
      </p>
    </div>
  );
}
