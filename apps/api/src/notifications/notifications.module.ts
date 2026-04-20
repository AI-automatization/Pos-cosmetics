import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { AlertsController } from './alerts.controller';
import { PushService } from './push.service';
import { TelegramNotifyService } from './telegram-notify.service';
import { EmailNotifyService } from './email-notify.service';
import { NotifyService } from './notify.service';
import { ShiftAlertListener } from './shift-alert.listener';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    NotificationsService,
    PushService,
    TelegramNotifyService,
    EmailNotifyService,
    NotifyService,
    ShiftAlertListener,
  ],
  controllers: [NotificationsController, AlertsController],
  exports: [
    NotificationsService,
    PushService,
    TelegramNotifyService,
    EmailNotifyService,
    NotifyService,
  ],
})
export class NotificationsModule {}
