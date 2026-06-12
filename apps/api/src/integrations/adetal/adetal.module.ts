import { Module } from '@nestjs/common';
import { AdetalController } from './adetal.controller';
import { AdetalOutboundService } from './adetal-outbound.service';
import { AdetalInboundService } from './adetal-inbound.service';
import { AdetalSyncListener } from './adetal-sync.listener';
import { AdetalOrderPollerService } from './adetal-order-poller.service';

@Module({
  controllers: [AdetalController],
  providers: [
    AdetalOutboundService,
    AdetalInboundService,
    AdetalSyncListener,
    AdetalOrderPollerService,
  ],
  exports: [AdetalOutboundService],
})
export class AdetalModule {}
