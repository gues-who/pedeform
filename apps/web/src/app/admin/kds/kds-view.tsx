"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Order, OrderStatus } from "@pedeform/shared";
import { ORDER_STATUS_LABEL } from "@pedeform/shared";
import { fetchAdminOrders, updateOrderStatus } from "@/lib/api-client";
import { connectSocket } from "@/lib/socket-client";
import { useToast } from "@/contexts/toast-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { SkeletonCard } from "@/components/ui/skeleton";
import { formatBRL } from "@/data/mock-menu";

const KDS_STATUSES: OrderStatus[] = ["pending", "preparing", "almost_ready"];

const STATUS_TONE: Record<OrderStatus, "neutral" | "warning" | "success" | "danger"> = {
  pending: "warning",
  preparing: "info" as never,
  almost_ready: "success",
  served: "neutral",
  paid: "neutral",
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "preparing",
  preparing: "almost_ready",
  almost_ready: "served",
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: "Iniciar preparo",
  preparing: "Marcar pronto",
  almost_ready: "Confirmar servido",
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  return `${Math.floor(diff / 3600)}h`;
}

export function KdsView() {
  const reduceMotion = useReducedMotion();
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    try {
      const data = await fetchAdminOrders("pending,preparing,almost_ready");
      setOrders(data);
    } catch {
      toast("Erro ao carregar pedidos", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const socket = connectSocket();
    socket.emit("join-room", { room: "admin" });

    const handleCreated = (order: Order) => {
      if (KDS_STATUSES.includes(order.status)) {
        setOrders((prev) => {
          const exists = prev.find((o) => o.id === order.id);
          return exists ? prev : [order, ...prev];
        });
        toast(`Novo pedido — Mesa ${order.mesaId}`, "info");
      }
    };

    const handleUpdated = (order: Order) => {
      if (KDS_STATUSES.includes(order.status)) {
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? order : o)),
        );
      } else {
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
      }
    };

    socket.on("order.created", handleCreated);
    socket.on("order.updated", handleUpdated);

    return () => {
      socket.off("order.created", handleCreated);
      socket.off("order.updated", handleUpdated);
      socket.emit("leave-room", { room: "admin" });
    };
  }, [toast]);

  async function advance(orderId: string, next: OrderStatus) {
    setAdvancing((p) => ({ ...p, [orderId]: true }));
    try {
      const updated = await updateOrderStatus(orderId, next);
      if (KDS_STATUSES.includes(updated.status)) {
        setOrders((prev) =>
          prev.map((o) => (o.id === updated.id ? updated : o)),
        );
      } else {
        setOrders((prev) => prev.filter((o) => o.id !== updated.id));
        toast(`Pedido ${orderId} marcado como ${ORDER_STATUS_LABEL[next]}`, "success");
      }
    } catch {
      toast("Erro ao atualizar pedido", "error");
    } finally {
      setAdvancing((p) => ({ ...p, [orderId]: false }));
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} lines={4} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            KDS — Cozinha
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Fila de pedidos em tempo real · namespace{" "}
            <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">
              /realtime
            </code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="success">Ao vivo</Badge>
          <Badge tone={orders.length > 0 ? "warning" : "neutral"}>
            {orders.length} ativo{orders.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </header>

      {orders.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-4xl">🍽</p>
          <p className="mt-3 font-medium text-zinc-700 dark:text-zinc-300">
            Nenhum pedido ativo
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Novos pedidos aparecerão aqui automaticamente.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {orders
              .sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime(),
              )
              .map((order) => {
                const next = NEXT_STATUS[order.status];
                const isAdvancing = advancing[order.id];

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={
                      reduceMotion ? false : { opacity: 0, scale: 0.97 }
                    }
                    animate={{ opacity: 1, scale: 1 }}
                    exit={
                      reduceMotion
                        ? undefined
                        : { opacity: 0, scale: 0.95, y: -8 }
                    }
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                  >
                    <Card className="flex h-full flex-col gap-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                            Mesa {order.mesaId}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {order.id} · há {timeAgo(order.createdAt)}
                          </p>
                        </div>
                        <Badge tone={STATUS_TONE[order.status]}>
                          {ORDER_STATUS_LABEL[order.status]}
                        </Badge>
                      </div>

                      <ul className="flex-1 space-y-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                        {order.items.map((item) => (
                          <li
                            key={item.menuItemId}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-zinc-800 dark:text-zinc-200">
                              {item.name}
                            </span>
                            <span className="tabular-nums text-zinc-500">
                              × {item.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                        <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                          {formatBRL(order.subtotalCents)}
                        </span>
                        {next && (
                          <Button
                            size="sm"
                            onClick={() => advance(order.id, next)}
                            disabled={isAdvancing}
                            className="gap-2"
                          >
                            {isAdvancing ? (
                              <Spinner size="sm" />
                            ) : null}
                            {NEXT_LABEL[order.status]}
                          </Button>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
