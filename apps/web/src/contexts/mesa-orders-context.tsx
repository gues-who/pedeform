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
import { connectSocket, disconnectSocket } from "@/lib/socket-client";

type SubmitState = "idle" | "submitting" | "success" | "error";

type MesaOrdersContextValue = {
  /** Pedido ativo mais recente enviado à cozinha. */
  currentOrder: Order | null;
  submitState: SubmitState;
  submitError: string | null;
  setCurrentOrder: (order: Order) => void;
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
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const socket = connectSocket();

    socket.emit("join-room", { room: `mesa:${mesaId}` });

    const handleOrderCreated = (order: Order) => {
      if (order.mesaId === mesaId) {
        setCurrentOrder(order);
        setSubmitState("success");
      }
    };

    const handleOrderUpdated = (order: Order) => {
      if (order.mesaId === mesaId) {
        setCurrentOrder(order);
      }
    };

    socket.on("order.created", handleOrderCreated);
    socket.on("order.updated", handleOrderUpdated);

    return () => {
      socket.off("order.created", handleOrderCreated);
      socket.off("order.updated", handleOrderUpdated);
      socket.emit("leave-room", { room: `mesa:${mesaId}` });
    };
  }, [mesaId]);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  const value = useMemo(
    () => ({
      currentOrder,
      submitState,
      submitError,
      setCurrentOrder,
      setSubmitState,
      setSubmitError,
    }),
    [currentOrder, submitState, submitError],
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
  const { setCurrentOrder, setSubmitState, setSubmitError } = useMesaOrders();

  return useCallback(
    async (items: { menuItemId: string; name: string; unitPriceCents: number; quantity: number }[]) => {
      setSubmitState("submitting");
      setSubmitError(null);
      try {
        const { createOrder } = await import("@/lib/api-client");
        const order = await createOrder(mesaId, items);
        setCurrentOrder(order);
        setSubmitState("success");
        return order;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro ao enviar pedido";
        setSubmitError(msg);
        setSubmitState("error");
        throw err;
      }
    },
    [mesaId, setCurrentOrder, setSubmitState, setSubmitError],
  );
}
