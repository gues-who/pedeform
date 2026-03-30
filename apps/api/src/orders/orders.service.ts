import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    if (!items?.length) {
      throw new BadRequestException('Envie ao menos um item no pedido.');
    }
    for (const it of items) {
      if (!it.menuItemId?.trim() || !it.name?.trim()) {
        throw new BadRequestException(
          'Cada item precisa de menuItemId e name.',
        );
      }
      if (it.quantity < 1 || !Number.isFinite(it.quantity)) {
        throw new BadRequestException('Quantidade inválida.');
      }
      if (it.unitPriceCents < 0 || !Number.isFinite(it.unitPriceCents)) {
        throw new BadRequestException('Preço inválido.');
      }
    }
    const table = this.store.findTable(mesaId);
    if (!table) {
      throw new BadRequestException(`Mesa ${mesaId} não encontrada.`);
    }

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

  /** Fecha conta: marca todos os pedidos em aberto da mesa como pagos. */
  closeBillForMesa(mesaId: string) {
    const { orders, totalCents } = this.store.closeBillForMesa(mesaId);
    if (orders.length === 0) {
      throw new BadRequestException('Não há pedidos em aberto para esta mesa.');
    }
    for (const order of orders) {
      this.realtime.emitToRoom(`mesa:${mesaId}`, 'order.updated', order);
      this.realtime.emitToRoom('admin', 'order.updated', order);
    }
    return { mesaId, orders, totalPaidCents: totalCents };
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
