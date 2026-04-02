import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { IpBlockService } from './ip-block.service';

@Global()
@Module({
  providers: [CacheService, IpBlockService],
  exports: [CacheService, IpBlockService],
})
export class AppCacheModule {}
