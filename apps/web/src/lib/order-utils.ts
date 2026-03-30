import type { Order } from "@pedeform/shared";

/** Pedidos ainda não quitados (inclui rascunho de cozinha até pago). */
export function isOrderOpen(o: Order): boolean {
  return o.status !== "paid";
}

/**
 * Pedido exibido em Acompanhar: prioriza o último em aberto;
 * se todos estiverem pagos, mostra o último pedido (histórico).
 */
export function pickOrderForTracking(orders: Order[]): Order | null {
  if (orders.length === 0) return null;
  const open = orders.filter(isOrderOpen);
  const pool = open.length > 0 ? open : orders;
  return [...pool].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0]!;
}

export function sortOrdersByActivity(orders: Order[]): Order[] {
  return [...orders].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}
