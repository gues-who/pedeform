import type { OrderStatus } from "./domain";

/** Tipos e constantes de domínio compartilhados entre web e api. */
export * from "./domain";
export * from "./mock";

export const APP_NAME = "Pedeform";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pedido recebido",
  preparing: "Em preparo",
  almost_ready: "Quase pronto",
  served: "Servido à mesa",
  paid: "Pago",
};
