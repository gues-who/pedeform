import { Injectable, NotFoundException } from '@nestjs/common';
import { MockDataStore } from '../mock/mock-data.store';

@Injectable()
export class TablesService {
  constructor(private readonly store: MockDataStore) {}

  getTables() {
    return this.store.tables;
  }

  getTable(id: string) {
    const table = this.store.findTable(id);
    if (!table) throw new NotFoundException(`Mesa ${id} não encontrada`);
    return table;
  }
}
