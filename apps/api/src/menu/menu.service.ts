import { Injectable } from '@nestjs/common';
import { MockDataStore } from '../mock/mock-data.store';

@Injectable()
export class MenuService {
  constructor(private readonly store: MockDataStore) {}

  getCategories() {
    return this.store.menuCategories;
  }

  getItems(category?: string) {
    if (category) {
      return this.store.menuItems.filter((i) => i.category === category);
    }
    return this.store.menuItems;
  }
}
