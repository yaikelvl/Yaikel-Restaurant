import { Module } from '@nestjs/common';
import { ClientModule } from './client/client.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { OrderModule } from './order/order.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [ClientModule, RestaurantModule, OrderModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
