import { Injectable } from '@nestjs/common';
import type {
  Order,
  OrderItem,
  OrderStatus,
  SharedMenuCategory,
  SharedMenuItem,
  Table,
} from '@pedeform/shared';

let _orderId = 1;
function nextOrderId() {
  return `order_${String(_orderId++).padStart(4, '0')}`;
}

@Injectable()
export class MockDataStore {
  readonly menuCategories: SharedMenuCategory[] = [
    { id: 'entradas', label: 'Entradas' },
    { id: 'principais', label: 'Principais' },
    { id: 'sobremesas', label: 'Sobremesas' },
    { id: 'harmonizacoes', label: 'Harmonizações' },
  ];

  readonly menuItems: SharedMenuItem[] = [
    {
      id: 'e1',
      category: 'entradas',
      name: 'Carpaccio de wagyu',
      description: 'Azeite de trufa negra, rúcula e lascas de parmesão.',
      priceCents: 8900,
      sommelierNote: 'Pinot Noir leve — notas terrosas equilibram a gordura.',
      imageGradient: 'from-amber-900/40 to-stone-900',
    },
    {
      id: 'e2',
      category: 'entradas',
      name: 'Ostra gratinada',
      description: 'Manteiga cítrica e ervas finas.',
      priceCents: 6200,
      sommelierNote: 'Champagne brut — acidez limpa com o mar.',
      imageGradient: 'from-teal-900/50 to-zinc-900',
    },
    {
      id: 'e3',
      category: 'entradas',
      name: 'Tartar de atum',
      description: 'Abacate, gergelim torrado e gengibre marinado.',
      priceCents: 7400,
      sommelierNote: 'Sake ginjo — umami e frescor em sintonia.',
      imageGradient: 'from-rose-900/40 to-zinc-900',
    },
    {
      id: 'p1',
      category: 'principais',
      name: 'Filé ao molho bordelaise',
      description: 'Batata confit e legumes glaceados.',
      priceCents: 18900,
      sommelierNote: 'Bordeaux de corpo médio realça o molho de vinho tinto.',
      imageGradient: 'from-red-950/60 to-neutral-950',
    },
    {
      id: 'p2',
      category: 'principais',
      name: 'Peixe do dia',
      description: 'Ervas do quintal e limão siciliano.',
      priceCents: 14200,
      sommelierNote: 'Branco mineral da costa — textura e salinidade.',
      imageGradient: 'from-sky-900/40 to-zinc-950',
    },
    {
      id: 'p3',
      category: 'principais',
      name: 'Risoto de trufa negra',
      description: 'Parmesão envelhecido 36 meses e lâminas de trufa.',
      priceCents: 16500,
      sommelierNote: 'Barolo jovem — taninos firmes com a terra do fungo.',
      imageGradient: 'from-yellow-950/50 to-zinc-950',
    },
    {
      id: 's1',
      category: 'sobremesas',
      name: 'Soufflé de chocolate',
      description: 'Ganache 70% e sorvete de baunilha de Madagascar.',
      priceCents: 4800,
      sommelierNote: 'Porto tawny — doçura e cacau em harmonia.',
      imageGradient: 'from-amber-950/50 to-stone-950',
    },
    {
      id: 's2',
      category: 'sobremesas',
      name: 'Crème brûlée de lavanda',
      description: 'Caramelo crocante e flor de lavanda provençal.',
      priceCents: 3900,
      sommelierNote: 'Sauternes — mel e floral prolongados.',
      imageGradient: 'from-purple-950/40 to-zinc-950',
    },
    {
      id: 'h1',
      category: 'harmonizacoes',
      name: 'Seleção do sommelier (taça)',
      description: 'Rótulo sazonal escolhido para acompanhar seu prato principal.',
      priceCents: 4500,
      imageGradient: 'from-violet-950/50 to-zinc-950',
    },
    {
      id: 'h2',
      category: 'harmonizacoes',
      name: 'Espumante de boas-vindas',
      description: 'Brut rosé da Serra Gaúcha servido na chegada.',
      priceCents: 3200,
      sommelierNote: 'Perfeito antes de qualquer entrada.',
      imageGradient: 'from-pink-950/40 to-zinc-950',
    },
  ];

  tables: Table[] = [
    { id: '1', nome: 'Mesa 1', convidados: 2, status: 'em_atendimento', tempoMinutos: 42 },
    { id: '2', nome: 'Mesa 2', convidados: 4, status: 'conta', tempoMinutos: 78 },
    { id: '3', nome: 'Mesa 3', convidados: 2, status: 'alerta', tempoMinutos: 105 },
    { id: '4', nome: 'Mesa 4', convidados: 6, status: 'em_atendimento', tempoMinutos: 28 },
    { id: '5', nome: 'Mesa 5', convidados: 0, status: 'livre', tempoMinutos: null },
    { id: '6', nome: 'Mesa 6', convidados: 3, status: 'em_atendimento', tempoMinutos: 15 },
    { id: '7', nome: 'Mesa 7', convidados: 0, status: 'livre', tempoMinutos: null },
    { id: '8', nome: 'Mesa 8', convidados: 0, status: 'livre', tempoMinutos: null },
    { id: 'vip', nome: 'Mesa VIP', convidados: 2, status: 'em_atendimento', tempoMinutos: 55 },
    { id: 'demo', nome: 'Mesa Demo', convidados: 2, status: 'em_atendimento', tempoMinutos: 0 },
  ];

  orders: Order[] = [];

  findTable(id: string): Table | undefined {
    return this.tables.find((t) => t.id === id);
  }

  findOrdersByMesa(mesaId: string): Order[] {
    return this.orders.filter((o) => o.mesaId === mesaId);
  }

  findOrder(id: string): Order | undefined {
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
        : 18750;
    const permanencias = occupied
      .map((t) => t.tempoMinutos ?? 0)
      .filter((m) => m > 0);
    const permanenciaMedia =
      permanencias.length > 0
        ? Math.round(permanencias.reduce((a, b) => a + b, 0) / permanencias.length)
        : 94;

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
    return [
      { label: 'Seg', faturamentoCents: 312000 },
      { label: 'Ter', faturamentoCents: 289000 },
      { label: 'Qua', faturamentoCents: 356000 },
      { label: 'Qui', faturamentoCents: 401000 },
      { label: 'Sex', faturamentoCents: 498000 },
      { label: 'Sáb', faturamentoCents: 612000 },
      { label: 'Dom', faturamentoCents: this.getKpis().faturamentoHojeCents },
    ];
  }
}
