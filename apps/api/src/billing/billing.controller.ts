import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Headers,
  Req,
  Res,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { BillingProvider } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators';
import { BillingService } from './billing.service';
import { BillingPaymentService } from './billing-payment.service';
import { BillingInvoiceService } from './billing-invoice.service';

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

export class CheckoutDto {
  @IsString()
  planSlug!: string;

  @IsEnum(BillingProvider)
  provider!: BillingProvider;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  months?: number;
}

// ─── Controller ───────────────────────────────────────────────────────────────

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name);

  constructor(
    private readonly billing: BillingService,
    private readonly billingPayment: BillingPaymentService,
    private readonly billingInvoice: BillingInvoiceService,
  ) {}

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

  // ─── Checkout & Payments ────────────────────────────────────────────────

  @Post('checkout')
  @ApiOperation({ summary: 'Create payment checkout URL for plan upgrade' })
  checkout(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CheckoutDto,
  ) {
    return this.billingPayment.createCheckout(tenantId, dto.planSlug, dto.provider, dto.months ?? 1);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Billing payment history' })
  getPayments(@CurrentUser('tenantId') tenantId: string) {
    return this.billingPayment.getPaymentHistory(tenantId);
  }

  @Get('payments/:id')
  @ApiOperation({ summary: 'Get billing payment details' })
  getPayment(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.billingPayment.getPayment(id, tenantId);
  }

  // ─── Billing Webhooks (Tezcode platform merchant) ───────────────────────

  @Public()
  @Post('webhooks/payme')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Payme billing webhook (Tezcode merchant)' })
  async billingPaymeWebhook(
    @Body() body: { id: number; method: string; params: Record<string, unknown> },
    @Headers('authorization') auth: string,
    @Req() req: Request,
  ) {
    this.logger.log('Billing Payme webhook', { ip: req.ip, method: body.method });

    if (!this.billingPayment.verifyPaymeAuth(auth ?? '')) {
      this.logger.warn('Billing Payme auth failed', { ip: req.ip });
      return { jsonrpc: '2.0', id: body.id, error: { code: -32504, message: 'Forbidden' } };
    }

    const result = await this.billingPayment.handlePaymeMethod(body.method, body.params ?? {});
    return { jsonrpc: '2.0', id: body.id, ...result };
  }

  @Public()
  @Post('webhooks/click/prepare')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Click billing prepare webhook (Tezcode merchant)' })
  async billingClickPrepare(@Body() body: Record<string, unknown>, @Req() req: Request) {
    this.logger.log('Billing Click Prepare', { ip: req.ip });
    if (!this.billingPayment.verifyClickSign(body)) {
      return { error: -1, error_note: 'SIGN CHECK FAILED!' };
    }
    return this.billingPayment.handleClickPrepare(body);
  }

  @Public()
  @Post('webhooks/click/complete')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Click billing complete webhook (Tezcode merchant)' })
  async billingClickComplete(@Body() body: Record<string, unknown>, @Req() req: Request) {
    this.logger.log('Billing Click Complete', { ip: req.ip });
    if (!this.billingPayment.verifyClickSign(body)) {
      return { error: -1, error_note: 'SIGN CHECK FAILED!' };
    }
    return this.billingPayment.handleClickComplete(body);
  }

  // ─── Invoices ──────────────────────────────────────────────────────────

  @Get('invoices')
  @ApiOperation({ summary: 'List billing invoices for current tenant' })
  getInvoices(@CurrentUser('tenantId') tenantId: string) {
    return this.billingInvoice.getInvoicesByTenant(tenantId);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get billing invoice details' })
  getInvoice(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.billingInvoice.getInvoice(id, tenantId);
  }

  @Get('invoices/:id/pdf')
  @ApiOperation({ summary: 'Download billing invoice as PDF' })
  async getInvoicePdf(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string, @Res() res: Response) {
    const invoice = await this.billingInvoice.getInvoice(id, tenantId);
    const pdf = this.billingInvoice.generatePdf(invoice);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    });

    pdf.pipe(res);
  }
}
