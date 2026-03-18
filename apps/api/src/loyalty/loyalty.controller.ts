import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import {
  UpdateLoyaltyConfigDto,
  EarnPointsDto,
  RedeemPointsDto,
  AdjustPointsDto,
} from './dto/loyalty.dto';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Loyalty')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  // ─── CONFIG ───────────────────────────────────────────────────

  @Get('config')
  @ApiOperation({ summary: 'Tenant loyalty sozlamasini olish' })
  getConfig(@CurrentUser('tenantId') tenantId: string) {
    return this.loyaltyService.getConfig(tenantId);
  }

  @Patch('config')
  @ApiOperation({ summary: 'Loyalty sozlasini yangilash (ADMIN+)' })
  updateConfig(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpdateLoyaltyConfigDto,
  ) {
    return this.loyaltyService.updateConfig(tenantId, dto);
  }

  // ─── ACCOUNT ──────────────────────────────────────────────────

  @Get('accounts/:customerId')
  @ApiOperation({ summary: 'Xaridor loyalty hisobi va tranzaksiya tarixi' })
  @ApiParam({ name: 'customerId', type: String })
  getAccount(
    @CurrentUser('tenantId') tenantId: string,
    @Param('customerId', ParseUUIDPipe) customerId: string,
  ) {
    return this.loyaltyService.getAccount(tenantId, customerId);
  }

  // ─── EARN / REDEEM / ADJUST ───────────────────────────────────

  @Post('earn')
  @ApiOperation({
    summary: 'Balllarni qo\'lda berish (odatda sale.created orqali avtomatik)',
  })
  earnPoints(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: EarnPointsDto,
  ) {
    return this.loyaltyService.earnPoints(tenantId, dto);
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Ballarni yechish → chegirma miqdori qaytariladi' })
  redeemPoints(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: RedeemPointsDto,
  ) {
    return this.loyaltyService.redeemPoints(tenantId, dto);
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Ballarni qo\'lda tuzatish (ADMIN)' })
  adjustPoints(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: AdjustPointsDto,
  ) {
    return this.loyaltyService.adjustPoints(tenantId, dto);
  }
}
