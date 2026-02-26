import { Global, Module } from '@nestjs/common';
import { AppLoggerService } from './logger.service';
import { RequestContextService } from './request-context.service';
import { ClientLogController } from './client-log.controller';

@Global()
@Module({
  controllers: [ClientLogController],
  providers: [AppLoggerService, RequestContextService],
  exports: [AppLoggerService, RequestContextService],
})
export class LoggerModule {}
