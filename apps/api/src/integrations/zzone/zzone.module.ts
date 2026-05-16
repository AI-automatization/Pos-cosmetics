import { Module } from '@nestjs/common';
import { ZzoneOutboundService } from './zzone-outbound.service';
import { ZzoneInboundController } from './zzone-inbound.controller';
import { ZzoneInboundService } from './zzone-inbound.service';
import { ZzoneSyncListener } from './zzone-sync.listener';

@Module({
  controllers: [ZzoneInboundController],
  providers: [
    ZzoneOutboundService,
    ZzoneInboundService,
    ZzoneSyncListener,
  ],
  exports: [ZzoneOutboundService],
})
export class ZzoneModule {}
