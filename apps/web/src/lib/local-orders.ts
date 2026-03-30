"use client";

import type { Order, OrderItem, OrderStatus } from "@pedeform/shared";

const KEY_PREFIX = "pedeform.local.orders.";

function keyForMesa(mesaId: string) {
  return `${KEY_PREFIX}${mesaId}`;
}

export function getLocalOrders(mesaId: string): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(keyForMesa(mesaId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalOrders(mesaId: string, orders: Order[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(keyForMesa(mesaId), JSON.stringify(orders));
}

function nextLocalOrderId() {
  return `local_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

export function createLocalOrder(mesaId: string, items: OrderItem[]): Order {
  const subtotalCents = items.reduce(
    (sum, i) => sum + i.unitPriceCents * i.quantity,
    0,
  );
  const now = new Date().toISOString();
  const order: Order = {
    id: nextLocalOrderId(),
    mesaId,
    items,
    status: "pending",
    subtotalCents,
    createdAt: now,
    updatedAt: now,
  };
  const current = getLocalOrders(mesaId);
  saveLocalOrders(mesaId, [order, ...current]);
  return order;
}

export function updateLocalOrderStatus(
  mesaId: string,
  orderId: string,
  status: OrderStatus,
): Order | null {
  const current = getLocalOrders(mesaId);
  let updated: Order | null = null;
  const next = current.map((o) => {
    if (o.id !== orderId) return o;
    updated = {
      ...o,
      status,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  saveLocalOrders(mesaId, next);
  return updated;
}

export function closeLocalMesaBill(mesaId: string): {
  mesaId: string;
  orders: Order[];
  totalPaidCents: number;
} {
  const current = getLocalOrders(mesaId);
  const paidOrders: Order[] = [];
  let total = 0;
  const next = current.map((o) => {
    if (o.status === "paid") return o;
    total += o.subtotalCents;
    const updated = {
      ...o,
      status: "paid" as const,
      updatedAt: new Date().toISOString(),
    };
    paidOrders.push(updated);
    return updated;
  });
  saveLocalOrders(mesaId, next);
  return { mesaId, orders: paidOrders, totalPaidCents: total };
}
