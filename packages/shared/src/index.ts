/** Tipos e constantes de domínio compartilhados entre web e api. */
export const APP_NAME = "Pedeform";

// ─── Cardápio ───────────────────────────────────────────────────────────────

export type MenuCategoryId =
  | "entradas"
  | "principais"
  | "sobremesas"
  | "harmonizacoes";

export interface SharedMenuItem {
  id: string;
  category: MenuCategoryId;
  name: string;
  description: string;
  priceCents: number;
  sommelierNote?: string;
  imageGradient: string;
}

export interface SharedMenuCategory {
  id: MenuCategoryId;
  label: string;
}

// ─── Pedidos ─────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "preparing"
  | "almost_ready"
  | "served"
  | "paid";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pedido recebido",
  preparing: "Em preparo",
  almost_ready: "Quase pronto",
  served: "Servido à mesa",
  paid: "Pago",
};

export interface OrderItem {
  menuItemId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

export interface Order {
  id: string;
  mesaId: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotalCents: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Mesas ────────────────────────────────────────────────────────────────────

export type TableStatus =
  | "livre"
  | "em_atendimento"
  | "conta"
  | "alerta";

export interface Table {
  id: string;
  nome: string;
  convidados: number;
  status: TableStatus;
  tempoMinutos: number | null;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminKpis {
  mesasOcupadas: number;
  mesasTotal: number;
  pedidosAtivos: number;
  ticketMedioCents: number;
  faturamentoHojeCents: number;
  permanenciaMediaMin: number;
}

export interface FinanceiroDay {
  label: string;
  faturamentoCents: number;
}

// ─── WebSocket eventos ───────────────────────────────────────────────────────

export interface WsOrderCreated {
  event: "order.created";
  data: Order;
}

export interface WsOrderUpdated {
  event: "order.updated";
  data: Order;
}

export interface WsKdsItemReady {
  event: "kds.item.ready";
  data: { orderId: string; menuItemId: string };
}

export type WsEvent = WsOrderCreated | WsOrderUpdated | WsKdsItemReady;
