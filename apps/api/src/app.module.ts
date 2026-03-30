import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MockDataStore } from './mock/mock-data.store';
import { RealtimeModule } from './realtime/realtime.module';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';
import { TablesModule } from './tables/tables.module';
import { AdminModule } from './admin/admin.module';

/** MockDataStore disponível globalmente sem precisar reimportar o módulo. */
@Global()
@Module({
  providers: [MockDataStore],
  exports: [MockDataStore],
})
class MockModule {}

@Module({
  imports: [
    MockModule,
    RealtimeModule,
    MenuModule,
    OrdersModule,
    TablesModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
