import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import type { OrderItem, OrderStatus } from '@pedeform/shared';
import { OrdersService } from './orders.service';

interface CreateOrderDto {
  items: OrderItem[];
}

interface UpdateStatusDto {
  status: OrderStatus;
}

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('mesas/:mesaId/orders')
  getOrdersByMesa(@Param('mesaId') mesaId: string) {
    return this.ordersService.getOrdersByMesa(mesaId);
  }

  @Post('mesas/:mesaId/orders')
  createOrder(@Param('mesaId') mesaId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(mesaId, dto.items);
  }

  /** Fecha a conta (todos os pedidos em aberto → pagos). Stripe virá depois. */
  @Post('mesas/:mesaId/pay')
  closeBill(@Param('mesaId') mesaId: string) {
    return this.ordersService.closeBillForMesa(mesaId);
  }

  @Get('orders/:orderId')
  getOrder(@Param('orderId') orderId: string) {
    return this.ordersService.getOrder(orderId);
  }

  @Patch('orders/:orderId/status')
  updateStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.ordersService.updateStatus(orderId, dto.status);
  }
}
