import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { SystemController } from './system.controller';

@Module({
  controllers: [HealthController, SystemController],
  // PrismaModule global bo'lgani uchun alohida import kerak emas
})
export class HealthModule {}
