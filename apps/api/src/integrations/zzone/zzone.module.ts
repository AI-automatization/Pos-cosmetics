import { Module } from '@nestjs/common';
import { ZzoneOutboundService } from './zzone-outbound.service';
import { ZzoneInboundController } from './zzone-inbound.controller';
import { ZzoneInboundService } from './zzone-inbound.service';
import { ZzoneSyncListener } from './zzone-sync.listener';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

@Module({
  controllers: [ZzoneInboundController, VehicleController],
  providers: [
    ZzoneOutboundService,
    ZzoneInboundService,
    ZzoneSyncListener,
    VehicleService,
  ],
  exports: [ZzoneOutboundService, VehicleService],
})
export class ZzoneModule {}
