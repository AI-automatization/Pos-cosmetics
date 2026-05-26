import { Module } from '@nestjs/common';
import { ZzoneOutboundService } from './zzone-outbound.service';
import { ZzoneInboundController } from './zzone-inbound.controller';
import { ZzoneInboundService } from './zzone-inbound.service';
import { ZzoneSyncListener } from './zzone-sync.listener';
import { ZzoneWebhookService } from './zzone-webhook.service';
import { ZzoneWebhookListener } from './zzone-webhook.listener';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

@Module({
  controllers: [ZzoneInboundController, VehicleController],
  providers: [
    ZzoneOutboundService,
    ZzoneInboundService,
    ZzoneSyncListener,
    ZzoneWebhookService,
    ZzoneWebhookListener,
    VehicleService,
  ],
  exports: [ZzoneOutboundService, ZzoneWebhookService, VehicleService],
})
export class ZzoneModule {}
