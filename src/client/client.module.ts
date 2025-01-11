import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ClientController],
  providers: [ClientService],
  imports: [AuthModule],
})
export class ClientModule {}
