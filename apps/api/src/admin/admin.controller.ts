import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get('kpis')
  getKpis() {
    return this.adminService.getKpis();
  }

  @Get('tables')
  getTables() {
    return this.adminService.getTables();
  }

  @Get('financeiro')
  getFinanceiro() {
    return this.adminService.getFinanceiro();
  }
}
