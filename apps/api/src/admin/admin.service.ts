import { Injectable } from '@nestjs/common';
import type { OrderStatus } from '@pedeform/shared';
import { MockDataStore } from '../mock/mock-data.store';

@Injectable()
export class AdminService {
  constructor(private readonly store: MockDataStore) {}

  getOverview() {
    return {
      kpis: this.store.getKpis(),
      tables: this.store.tables,
      financeiro: this.store.getFinanceiroSeries(),
    };
  }

  getKpis() {
    return this.store.getKpis();
  }

  getTables() {
    return this.store.tables;
  }

  getFinanceiro() {
    return {
      kpis: this.store.getKpis(),
      series: this.store.getFinanceiroSeries(),
    };
  }

  getOrders(status?: string) {
    const all = this.store.orders;
    if (!status) return all;
    const statuses = status.split(',').map((s) => s.trim()) as OrderStatus[];
    return all.filter((o) => statuses.includes(o.status));
  }
}
