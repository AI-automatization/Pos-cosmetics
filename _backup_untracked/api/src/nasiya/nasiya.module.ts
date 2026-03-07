import { Module } from '@nestjs/common';
import { NasiyaController } from './nasiya.controller';
import { NasiyaService } from './nasiya.service';

@Module({
  controllers: [NasiyaController],
  providers: [NasiyaService],
})
export class NasiyaModule {}
