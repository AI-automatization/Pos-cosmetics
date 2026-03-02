import { Module } from '@nestjs/common';
import { NasiyaService } from './nasiya.service';
import { NasiyaController } from './nasiya.controller';

@Module({
  controllers: [NasiyaController],
  providers: [NasiyaService],
  exports: [NasiyaService],
})
export class NasiyaModule {}
