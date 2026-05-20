import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CronService } from './cron.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { InventoryModule } from '../../inventory/inventory.module';

@Module({
  imports: [PrismaModule, EventEmitterModule, NotificationsModule, InventoryModule],
  providers: [CronService],
})
export class CronModule {}
