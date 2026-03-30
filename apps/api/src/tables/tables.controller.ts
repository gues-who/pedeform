import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TablesService } from './tables.service';

interface ReserveTableDto {
  guestName: string;
  guests: number;
  reservedFor: string;
  notes?: string;
}

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  getTables() {
    return this.tablesService.getTables();
  }

  @Get('reservations')
  getReservations() {
    return this.tablesService.listReservations();
  }

  @Get(':id')
  getTable(@Param('id') id: string) {
    return this.tablesService.getTable(id);
  }

  @Post(':id/reserve')
  reserveTable(@Param('id') id: string, @Body() dto: ReserveTableDto) {
    return this.tablesService.reserveTable(id, dto);
  }
}
