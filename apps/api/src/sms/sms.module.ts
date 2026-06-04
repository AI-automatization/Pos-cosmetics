import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsCampaignService } from './sms-campaign.service';
import { SmsController } from './sms.controller';
import { PlayMobileProvider } from './providers/playmobile.provider';
import { SMS_GATEWAY } from './interfaces/sms-gateway.interface';

@Module({
  providers: [
    { provide: SMS_GATEWAY, useClass: PlayMobileProvider },
    SmsService,
    SmsCampaignService,
  ],
  controllers: [SmsController],
  exports: [SmsService, SmsCampaignService],
})
export class SmsModule {}
