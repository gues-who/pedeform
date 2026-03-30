import { Injectable } from '@nestjs/common';
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
}
