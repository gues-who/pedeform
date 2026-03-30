/** Tipos de domínio compartilhados — importados por mock.ts sem ciclo com index. */

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
  /** Caminho em /public (ex.: /menu/entradas/e1.png). */
  imageUrl?: string;
  imageGradient: string;
}

export interface SharedMenuCategory {
  id: MenuCategoryId;
  label: string;
}

export type OrderStatus =
  | "pending"
  | "preparing"
  | "almost_ready"
  | "served"
  | "paid";

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
