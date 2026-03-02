import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  // PrismaModule global bo'lgani uchun alohida import kerak emas
})
export class HealthModule {}
