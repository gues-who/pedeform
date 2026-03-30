"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Order } from "@pedeform/shared";
import { fetchOrdersByMesa } from "@/lib/api-client";
import {
  createLocalOrder,
  getLocalOrders,
  updateLocalOrderStatus,
} from "@/lib/local-orders";
import { pickOrderForTracking } from "@/lib/order-utils";
import { connectSocket } from "@/lib/socket-client";

type SubmitState = "idle" | "submitting" | "success" | "error";

function upsertOrder(list: Order[], o: Order): Order[] {
  const i = list.findIndex((x) => x.id === o.id);
  if (i === -1) return [o, ...list];
  const next = [...list];
  next[i] = o;
  return next;
}

type MesaOrdersContextValue = {
  mesaId: string;
  /** Todos os pedidos da mesa (API). */
  allOrders: Order[];
  /** Pedido exibido em Acompanhar — último em aberto. */
  currentOrder: Order | null;
  ordersLoading: boolean;
  ordersError: string | null;
  refreshOrders: () => Promise<void>;
  upsertOrderLocal: (order: Order) => void;
  submitState: SubmitState;
  submitError: string | null;
  setSubmitState: (s: SubmitState) => void;
  setSubmitError: (e: string | null) => void;
};

const MesaOrdersContext = createContext<MesaOrdersContextValue | null>(null);

export function MesaOrdersProvider({
  mesaId,
  children,
}: {
  mesaId: string;
  children: ReactNode;
}) {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const upsertOrderLocal = useCallback((order: Order) => {
    setAllOrders((prev) => upsertOrder(prev, order));
  }, []);

  const refreshOrders = useCallback(async () => {
    try {
      const list = await fetchOrdersByMesa(mesaId);
      setAllOrders(list);
      setOrdersError(null);
    } catch {
      const local = getLocalOrders(mesaId);
      setAllOrders(local);
      // Em modo demo/offline, não bloquear a UI com erro.
      setOrdersError(null);
    } finally {
      setOrdersLoading(false);
    }
  }, [mesaId]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const currentOrder = useMemo(
    () => pickOrderForTracking(allOrders),
    [allOrders],
  );

  useEffect(() => {
    const socket = connectSocket();
    socket.emit("join-room", { room: `mesa:${mesaId}` });

    const handleOrderCreated = (order: Order) => {
      if (order.mesaId !== mesaId) return;
      setAllOrders((prev) => upsertOrder(prev, order));
      setSubmitState("success");
    };

    const handleOrderUpdated = (order: Order) => {
      if (order.mesaId !== mesaId) return;
      setAllOrders((prev) => upsertOrder(prev, order));
    };

    socket.on("order.created", handleOrderCreated);
    socket.on("order.updated", handleOrderUpdated);

    return () => {
      socket.off("order.created", handleOrderCreated);
      socket.off("order.updated", handleOrderUpdated);
      socket.emit("leave-room", { room: `mesa:${mesaId}` });
    };
  }, [mesaId]);

  const value = useMemo(
    () => ({
      mesaId,
      allOrders,
      currentOrder,
      ordersLoading,
      ordersError,
      refreshOrders,
      upsertOrderLocal,
      submitState,
      submitError,
      setSubmitState,
      setSubmitError,
    }),
    [
      mesaId,
      allOrders,
      currentOrder,
      ordersLoading,
      ordersError,
      refreshOrders,
      upsertOrderLocal,
      submitState,
      submitError,
    ],
  );

  return (
    <MesaOrdersContext.Provider value={value}>
      {children}
    </MesaOrdersContext.Provider>
  );
}

export function useMesaOrders() {
  const ctx = useContext(MesaOrdersContext);
  if (!ctx) {
    throw new Error(
      "useMesaOrders deve ser usado dentro de MesaOrdersProvider",
    );
  }
  return ctx;
}

export function useOrderSubmit(mesaId: string) {
  const { refreshOrders, setSubmitState, setSubmitError, upsertOrderLocal } =
    useMesaOrders();

  return useCallback(
    async (
      items: {
        menuItemId: string;
        name: string;
        unitPriceCents: number;
        quantity: number;
      }[],
    ) => {
      setSubmitState("submitting");
      setSubmitError(null);
      try {
        const { createOrder } = await import("@/lib/api-client");
        const created = await createOrder(mesaId, items);
        upsertOrderLocal(created);
        await refreshOrders();
        setSubmitState("success");
        return created;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro ao enviar pedido";
        const offline =
          msg.includes("Não foi possível conectar à API") ||
          msg.includes("Failed to fetch");
        if (offline) {
          const local = createLocalOrder(mesaId, items);
          upsertOrderLocal(local);
          // Simula progresso de cozinha no modo offline.
          const timeline = [
            { status: "preparing" as const, delay: 6000 },
            { status: "almost_ready" as const, delay: 14000 },
            { status: "served" as const, delay: 24000 },
          ];
          for (const t of timeline) {
            window.setTimeout(() => {
              const updated = updateLocalOrderStatus(mesaId, local.id, t.status);
              if (updated) upsertOrderLocal(updated);
            }, t.delay);
          }
          setSubmitState("success");
          setSubmitError(null);
          return local;
        }
        setSubmitError(msg);
        setSubmitState("error");
        throw err;
      }
    },
    [
      mesaId,
      refreshOrders,
      setSubmitState,
      setSubmitError,
      upsertOrderLocal,
    ],
  );
}
