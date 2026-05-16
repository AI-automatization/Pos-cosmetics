import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { ZzoneClientService } from './zzone-client.service';
import { ZzoneSyncListener } from './zzone-sync.listener';

@Module({
  controllers: [IntegrationsController],
  providers: [IntegrationsService, ZzoneClientService, ZzoneSyncListener],
  exports: [IntegrationsService, ZzoneClientService],
})
export class IntegrationsModule {}
