import { Controller, Get, Param } from '@nestjs/common';
import { TablesService } from './tables.service';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  getTables() {
    return this.tablesService.getTables();
  }

  @Get(':id')
  getTable(@Param('id') id: string) {
    return this.tablesService.getTable(id);
  }
}
