"use client";

import { useCallback, useEffect, useState } from "react";
import type { Order, Table, TableStatus } from "@pedeform/shared";
import { fetchAdminTables } from "@/lib/api-client";
import { connectSocket } from "@/lib/socket-client";
import { useToast } from "@/contexts/toast-context";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/skeleton";
import { mockMesas } from "@/data/mock-admin";

function statusTone(s: TableStatus): "neutral" | "success" | "warning" | "danger" {
  switch (s) {
    case "livre": return "neutral";
    case "em_atendimento": return "success";
    case "conta": return "warning";
    case "alerta": return "danger";
  }
}

function statusLabel(s: TableStatus) {
  switch (s) {
    case "livre": return "Livre";
    case "em_atendimento": return "Em atendimento";
    case "conta": return "Conta";
    case "alerta": return "Alerta";
  }
}

export function OperacaoView() {
  const toast = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchAdminTables();
      setTables(data);
      setIsLive(true);
    } catch {
      setTables(mockMesas);
      setIsLive(false);
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

    const handleOrderCreated = (order: Order) => {
      setTables((prev) =>
        prev.map((t) =>
          t.id === order.mesaId
            ? { ...t, status: "em_atendimento" as TableStatus }
            : t,
        ),
      );
      toast(`Novo pedido — Mesa ${order.mesaId}`, "info");
    };

    socket.on("order.created", handleOrderCreated);

    return () => {
      socket.off("order.created", handleOrderCreated);
      socket.emit("leave-room", { room: "admin" });
    };
  }, [toast]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl grid gap-3 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} lines={3} />)}
      </div>
    );
  }

  const occupied = tables.filter((t) => t.status !== "livre").length;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Operação
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {occupied} de {tables.length} mesas ocupadas.
          </p>
        </div>
        <Badge tone={isLive ? "success" : "warning"}>
          {isLive ? "Ao vivo" : "Mock"}
        </Badge>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {tables.map((m) => (
          <Card key={m.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{m.nome}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {m.convidados > 0 ? `${m.convidados} convidados` : "Sem ocupação"}
                </p>
              </div>
              <Badge tone={statusTone(m.status)}>{statusLabel(m.status)}</Badge>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 text-sm dark:border-zinc-800">
              <span className="text-zinc-500">Tempo na mesa</span>
              <span className="tabular-nums font-medium text-zinc-900 dark:text-zinc-100">
                {m.tempoMinutos !== null ? `${m.tempoMinutos} min` : "—"}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle>Próximos passos</CardTitle>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <li>Mapa do salão com arrastar mesas</li>
          <li>Alertas automáticos ao atingir limite de permanência</li>
          <li>
            WebSocket sala{" "}
            <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">admin</code> já ativo —
            pedidos atuais refletidos em tempo real
          </li>
        </ul>
      </Card>
    </div>
  );
}
