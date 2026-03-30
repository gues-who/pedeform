"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Order, OrderStatus } from "@pedeform/shared";
import { ORDER_STATUS_LABEL } from "@pedeform/shared";
import { fetchAdminOrders } from "@/lib/api-client";
import { connectSocket } from "@/lib/socket-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { mockAdminOrders } from "@/data/mock-admin";
import { formatBRL } from "@/data/mock-menu";

const STATUS_OPTIONS: Array<{ value: "all" | OrderStatus; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pedido recebido" },
  { value: "preparing", label: "Em preparo" },
  { value: "almost_ready", label: "Quase pronto" },
  { value: "served", label: "Servido" },
  { value: "paid", label: "Pago" },
];

const STATUS_TONE: Record<OrderStatus, "neutral" | "warning" | "success" | "danger"> = {
  pending: "warning",
  preparing: "neutral",
  almost_ready: "success",
  served: "neutral",
  paid: "success",
};

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

export function PedidosView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [mesaFilter, setMesaFilter] = useState("all");

  const load = useCallback(async () => {
    try {
      const data = await fetchAdminOrders();
      setOrders(data);
    } catch {
      setOrders(mockAdminOrders);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const socket = connectSocket();
    socket.emit("join-room", { room: "admin" });

    const onCreated = (order: Order) => {
      setOrders((prev) => {
        const alreadyExists = prev.some((o) => o.id === order.id);
        if (alreadyExists) return prev;
        return [order, ...prev];
      });
    };

    const onUpdated = (order: Order) => {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    };

    socket.on("order.created", onCreated);
    socket.on("order.updated", onUpdated);

    return () => {
      socket.off("order.created", onCreated);
      socket.off("order.updated", onUpdated);
      socket.emit("leave-room", { room: "admin" });
    };
  }, []);

  const mesaOptions = useMemo(() => {
    const ids = [...new Set(orders.map((order) => order.mesaId))];
    return ["all", ...ids.sort((a, b) => a.localeCompare(b))];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => statusFilter === "all" || order.status === statusFilter)
      .filter((order) => mesaFilter === "all" || order.mesaId === mesaFilter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [mesaFilter, orders, statusFilter]);

  const totalFiltered = filteredOrders.reduce((sum, order) => sum + order.subtotalCents, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Pedidos de mesa
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Fluxo completo dos pedidos feitos pelo cliente e recebidos pela operação.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="success">Mock ativo</Badge>
          <Badge tone={filteredOrders.length > 0 ? "neutral" : "warning"}>
            {filteredOrders.length} pedido{filteredOrders.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </header>

      <Card>
        <CardTitle>Filtros</CardTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="text-sm text-zinc-600 dark:text-zinc-300">
            Status
            <select
              className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-400 transition focus:ring dark:border-zinc-700 dark:bg-zinc-900"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | OrderStatus)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-zinc-600 dark:text-zinc-300">
            Mesa
            <select
              className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-400 transition focus:ring dark:border-zinc-700 dark:bg-zinc-900"
              value={mesaFilter}
              onChange={(e) => setMesaFilter(e.target.value)}
            >
              {mesaOptions.map((mesaId) => (
                <option key={mesaId} value={mesaId}>
                  {mesaId === "all" ? "Todas as mesas" : `Mesa ${mesaId}`}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Total filtrado</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {formatBRL(totalFiltered)}
            </p>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card>
          <p className="text-sm text-zinc-500">Carregando pedidos...</p>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card className="py-10 text-center">
          <p className="text-sm text-zinc-500">Nenhum pedido para os filtros aplicados.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="flex h-full flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Mesa {order.mesaId}
                  </p>
                  <p className="text-xs text-zinc-500">{order.id}</p>
                </div>
                <Badge tone={STATUS_TONE[order.status]}>
                  {ORDER_STATUS_LABEL[order.status]}
                </Badge>
              </div>

              <ul className="flex-1 space-y-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                {order.items.map((item) => (
                  <li key={`${order.id}-${item.menuItemId}`} className="flex justify-between text-sm">
                    <span className="text-zinc-800 dark:text-zinc-200">{item.name}</span>
                    <span className="tabular-nums text-zinc-500">x {item.quantity}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800">
                <p>Criado: {fmtDateTime(order.createdAt)}</p>
                <p className="mt-1">Atualizado: {fmtDateTime(order.updatedAt)}</p>
              </div>

              <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <p className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {formatBRL(order.subtotalCents)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
