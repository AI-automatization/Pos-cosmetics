import { Module } from '@nestjs/common';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { PromoCodeController } from './promo-code.controller';
import { PromoCodeService } from './promo-code.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [PromotionsController, PromoCodeController],
  providers: [PromotionsService, PromoCodeService, PrismaService],
  exports: [PromotionsService, PromoCodeService],
})
export class PromotionsModule {}
