import { Module } from '@nestjs/common';
import { RealestateService } from './realestate.service';
import { RealestateController } from './realestate.controller';

@Module({
  controllers: [RealestateController],
  providers: [RealestateService],
  exports: [RealestateService],
})
export class RealestateModule {}
