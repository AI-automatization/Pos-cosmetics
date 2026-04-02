import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BillingService } from './billing.service';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export class UpgradePlanDto {
  @IsString()
  planSlug!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  @Type(() => Number)
  months?: number;
}

// ─── Controller ───────────────────────────────────────────────────────────────

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  // ─── Plans ────────────────────────────────────────────────────────────────

  @Get('plans')
  @ApiOperation({ summary: 'Barcha aktiv rejalar ro\'yxati' })
  getPlans() {
    return this.billing.getPlans();
  }

  @Get('plans/:slug')
  @ApiOperation({ summary: 'Slug bo\'yicha reja ma\'lumoti' })
  getPlanBySlug(@Param('slug') slug: string) {
    return this.billing.getPlanBySlug(slug);
  }

  // ─── Tenant Subscription ──────────────────────────────────────────────────

  @Get('subscription')
  @ApiOperation({ summary: 'Joriy tenant obunasi' })
  getSubscription(@CurrentUser('tenantId') tenantId: string) {
    return this.billing.getTenantSubscription(tenantId);
  }

  @Post('upgrade')
  @ApiOperation({ summary: 'Rejani yangilash (TRIAL → ACTIVE yoki plan almashtirish)' })
  upgradePlan(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpgradePlanDto,
  ) {
    return this.billing.upgradePlan(tenantId, dto.planSlug, dto.months ?? 1);
  }

  @Post('trial')
  @ApiOperation({ summary: 'Trial obunani boshlash (yangi tenant uchun)' })
  startTrial(@CurrentUser('tenantId') tenantId: string) {
    return this.billing.startTrial(tenantId);
  }

  @Delete('cancel')
  @ApiOperation({ summary: 'Obunani bekor qilish' })
  cancelSubscription(@CurrentUser('tenantId') tenantId: string) {
    return this.billing.cancelSubscription(tenantId);
  }

  // ─── Limits & Usage ───────────────────────────────────────────────────────

  @Get('limits')
  @ApiOperation({ summary: 'Joriy tarif limitleri (maxBranches, maxProducts, maxUsers)' })
  getLimits(@CurrentUser('tenantId') tenantId: string) {
    return this.billing.getLimits(tenantId);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Joriy foydalanish statistikasi (used vs max)' })
  getUsage(@CurrentUser('tenantId') tenantId: string) {
    return this.billing.getUsageStats(tenantId);
  }
}
