import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportController, AdminSupportController } from './support.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SupportController, AdminSupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
