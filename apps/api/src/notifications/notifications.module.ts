import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PushService } from './push.service';
import { SmsService } from './sms.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [NotificationsService, PushService, SmsService],
  controllers: [NotificationsController],
  exports: [NotificationsService, PushService, SmsService],
})
export class NotificationsModule {}
