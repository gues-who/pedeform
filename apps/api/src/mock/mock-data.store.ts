import { Injectable } from '@nestjs/common';
import type {
  Order,
  OrderItem,
  OrderStatus,
  SharedMenuItem,
  TableReservation,
} from '@pedeform/shared';
import {
  MOCK_MENU_CATEGORIES,
  MOCK_MENU_ITEMS,
  MOCK_NEXT_ORDER_SEQUENCE,
  MOCK_SEED_ORDERS,
  MOCK_TABLES,
} from '@pedeform/shared';

let _orderId = MOCK_NEXT_ORDER_SEQUENCE;
let _reservationId = 1;

function nextOrderId() {
  return `order_${String(_orderId++).padStart(4, '0')}`;
}

function nextReservationId() {
  return `reservation_${String(_reservationId++).padStart(4, '0')}`;
}

@Injectable()
export class MockDataStore {
  readonly menuCategories = MOCK_MENU_CATEGORIES;
  menuItems: SharedMenuItem[] = structuredClone(MOCK_MENU_ITEMS);

  tables = structuredClone(MOCK_TABLES);
  reservations: TableReservation[] = [];

  orders: Order[] = structuredClone(MOCK_SEED_ORDERS);

  findTable(id: string) {
    return this.tables.find((t) => t.id === id);
  }

  findOrdersByMesa(mesaId: string) {
    return this.orders.filter((o) => o.mesaId === mesaId);
  }

  findOrder(id: string) {
    return this.orders.find((o) => o.id === id);
  }

  createOrder(mesaId: string, items: OrderItem[]): Order {
    const subtotalCents = items.reduce(
      (sum, i) => sum + i.unitPriceCents * i.quantity,
      0,
    );
    const now = new Date().toISOString();
    const order: Order = {
      id: nextOrderId(),
      mesaId,
      items,
      status: 'pending',
      subtotalCents,
      createdAt: now,
      updatedAt: now,
    };
    this.orders.push(order);

    const table = this.findTable(mesaId);
    if (table && table.status === 'livre') {
      table.status = 'em_atendimento';
      table.tempoMinutos = 0;
    }

    return order;
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
    const order = this.findOrder(orderId);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return order;
  }

  /** Fecha a conta da mesa: todos os pedidos não pagos passam a `paid`. */
  closeBillForMesa(mesaId: string): { orders: Order[]; totalCents: number } {
    const updated: Order[] = [];
    let totalCents = 0;
    for (const o of this.orders) {
      if (o.mesaId === mesaId && o.status !== 'paid') {
        totalCents += o.subtotalCents;
        o.status = 'paid';
        o.updatedAt = new Date().toISOString();
        updated.push(o);
      }
    }
    return { orders: updated, totalCents };
  }

  /** Subtotal em aberto na mesa (pedidos ainda não pagos). */
  openOrdersSubtotalForMesa(mesaId: string): number {
    return this.orders
      .filter((o) => o.mesaId === mesaId && o.status !== 'paid')
      .reduce((s, o) => s + o.subtotalCents, 0);
  }

  getKpis() {
    const occupied = this.tables.filter((t) => t.status !== 'livre');
    const activeOrders = this.orders.filter(
      (o) => o.status !== 'paid' && o.status !== 'served',
    );
    const paidOrders = this.orders.filter((o) => o.status === 'paid');
    const faturamento = paidOrders.reduce((s, o) => s + o.subtotalCents, 0);
    const ticketMedio =
      paidOrders.length > 0
        ? Math.round(faturamento / paidOrders.length)
        : 21500;
    const permanencias = occupied
      .map((t) => t.tempoMinutos ?? 0)
      .filter((m) => m > 0);
    const permanenciaMedia =
      permanencias.length > 0
        ? Math.round(
            permanencias.reduce((a, b) => a + b, 0) / permanencias.length,
          )
        : 58;

    return {
      mesasOcupadas: occupied.length,
      mesasTotal: this.tables.length,
      pedidosAtivos: activeOrders.length,
      ticketMedioCents: ticketMedio,
      faturamentoHojeCents: faturamento > 0 ? faturamento : 428900,
      permanenciaMediaMin: permanenciaMedia,
    };
  }

  getFinanceiroSeries() {
    const dom = this.getKpis().faturamentoHojeCents;
    return [
      { label: 'Seg', faturamentoCents: 312000 },
      { label: 'Ter', faturamentoCents: 289000 },
      { label: 'Qua', faturamentoCents: 356000 },
      { label: 'Qui', faturamentoCents: 401000 },
      { label: 'Sex', faturamentoCents: 498000 },
      { label: 'Sáb', faturamentoCents: 612000 },
      { label: 'Dom', faturamentoCents: dom },
    ];
  }

  addMenuItem(item: SharedMenuItem) {
    this.menuItems.unshift(item);
    return item;
  }

  updateMenuItem(id: string, patch: Partial<Omit<SharedMenuItem, 'id'>>) {
    const idx = this.menuItems.findIndex((item) => item.id === id);
    if (idx < 0) return null;
    const next = { ...this.menuItems[idx], ...patch };
    this.menuItems[idx] = next;
    return next;
  }

  deleteMenuItem(id: string) {
    const idx = this.menuItems.findIndex((item) => item.id === id);
    if (idx < 0) return null;
    const [removed] = this.menuItems.splice(idx, 1);
    return removed;
  }

  createReservation(input: {
    tableId: string;
    guestName: string;
    guests: number;
    reservedFor: string;
    notes?: string;
  }) {
    const reservation: TableReservation = {
      id: nextReservationId(),
      tableId: input.tableId,
      guestName: input.guestName,
      guests: input.guests,
      reservedFor: input.reservedFor,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };
    this.reservations.unshift(reservation);
    return reservation;
  }
}
