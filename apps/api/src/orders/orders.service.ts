import { Injectable, NotFoundException } from '@nestjs/common';
import type { OrderItem, OrderStatus } from '@pedeform/shared';
import { MockDataStore } from '../mock/mock-data.store';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private readonly store: MockDataStore,
    private readonly realtime: RealtimeGateway,
  ) {}

  getOrdersByMesa(mesaId: string) {
    return this.store.findOrdersByMesa(mesaId);
  }

  getOrder(orderId: string) {
    const order = this.store.findOrder(orderId);
    if (!order) throw new NotFoundException(`Pedido ${orderId} não encontrado`);
    return order;
  }

  createOrder(mesaId: string, items: OrderItem[]) {
    const order = this.store.createOrder(mesaId, items);
    this.realtime.emitToRoom(`mesa:${mesaId}`, 'order.created', order);
    this.realtime.emitToRoom('admin', 'order.created', order);
    this.scheduleKitchenProgression(order.id, mesaId);
    return order;
  }

  updateStatus(orderId: string, status: OrderStatus) {
    const order = this.store.updateOrderStatus(orderId, status);
    if (!order) throw new NotFoundException(`Pedido ${orderId} não encontrado`);
    this.realtime.emitToRoom(`mesa:${order.mesaId}`, 'order.updated', order);
    this.realtime.emitToRoom('admin', 'order.updated', order);
    return order;
  }

  /** Simula a progressão automática de status da cozinha. */
  private scheduleKitchenProgression(orderId: string, mesaId: string) {
    const steps: { status: OrderStatus; delayMs: number }[] = [
      { status: 'preparing', delayMs: 6_000 },
      { status: 'almost_ready', delayMs: 16_000 },
      { status: 'served', delayMs: 26_000 },
    ];

    for (const { status, delayMs } of steps) {
      setTimeout(() => {
        const updated = this.store.updateOrderStatus(orderId, status);
        if (updated) {
          this.realtime.emitToRoom(`mesa:${mesaId}`, 'order.updated', updated);
          this.realtime.emitToRoom('admin', 'order.updated', updated);
        }
      }, delayMs);
    }
  }
}
