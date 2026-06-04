import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import {
  UpdateLoyaltyConfigDto,
  EarnPointsDto,
  RedeemPointsDto,
  AdjustPointsDto,
} from './dto/loyalty.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Loyalty')
@ApiBearerAuth()
@Roles('OWNER', 'ADMIN', 'MANAGER')
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

  // ─── ACCOUNTS LIST ────────────────────────────────────────────

  @Get('accounts')
  @ApiOperation({ summary: 'Barcha loyalty hisoblari ro\'yxati (sahifalangan)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'minPoints', required: false, type: Number })
  listAccounts(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('minPoints', new DefaultValuePipe(undefined)) minPoints?: string,
  ) {
    const min = minPoints !== undefined ? parseInt(minPoints, 10) : undefined;
    return this.loyaltyService.listAccounts(tenantId, page, limit, min);
  }

  // ─── TRANSACTIONS LIST ────────────────────────────────────────

  @Get('transactions')
  @ApiOperation({ summary: 'Loyalty tranzaksiyalar ro\'yxati (sahifalangan)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String, enum: ['EARN', 'REDEEM', 'ADJUSTMENT', 'EXPIRE'] })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  listTransactions(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('type') type?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.loyaltyService.listTransactions(
      tenantId,
      page,
      limit,
      type,
      customerId,
    );
  }

  // ─── STATS ────────────────────────────────────────────────────

  @Get('stats')
  @ApiOperation({ summary: 'Loyalty statistikasi (bugungi + umumiy)' })
  getStats(@CurrentUser('tenantId') tenantId: string) {
    return this.loyaltyService.getStats(tenantId);
  }

  // ─── ACCOUNT (per customer) ───────────────────────────────────

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
