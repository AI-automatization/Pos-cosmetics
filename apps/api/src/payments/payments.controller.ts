import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Body,
  Headers,
  Param,
  Req,
  Logger,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto, SplitPaymentDto } from './dto/create-payment.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators';
import { PaymeProvider } from './providers/payme.provider';
import { ClickProvider, ClickWebhookBody } from './providers/click.provider';
import { UzumProvider } from './providers/uzum.provider';
import { PrismaService } from '../prisma/prisma.service';
import { WebhookIpGuard } from './guards/webhook-ip.guard';

@ApiTags('Payments')
@ApiBearerAuth()
@Roles('OWNER', 'ADMIN', 'MANAGER', 'CASHIER')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymeProvider: PaymeProvider,
    private readonly clickProvider: ClickProvider,
    private readonly uzumProvider: UzumProvider,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List payment intents' })
  listPayments(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.paymentsService.listPayments(tenantId, { page, limit, status });
  }

  @Post('intent')
  @ApiOperation({ summary: 'Create payment intent (single method)' })
  createIntent(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreatePaymentIntentDto,
  ) {
    return this.paymentsService.createPaymentIntent(tenantId, dto);
  }

  @Post('split')
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Create split payment (multiple methods)' })
  createSplit(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: SplitPaymentDto,
  ) {
    return this.paymentsService.createSplitPayment(tenantId, dto);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm payment intent' })
  @ApiParam({ name: 'id', type: String })
  confirm(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.confirmPayment(tenantId, id);
  }

  @Patch(':id/settle')
  @ApiOperation({ summary: 'Settle payment intent' })
  @ApiParam({ name: 'id', type: String })
  settle(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.settlePayment(tenantId, id);
  }

  @Patch(':id/reverse')
  @ApiOperation({ summary: 'Reverse settled payment' })
  @ApiParam({ name: 'id', type: String })
  reverse(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.reversePayment(tenantId, id);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get all payments for an order' })
  @ApiParam({ name: 'orderId', type: String })
  getOrderPayments(
    @CurrentUser('tenantId') tenantId: string,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ) {
    return this.paymentsService.getOrderPayments(tenantId, orderId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment intent by ID' })
  @ApiParam({ name: 'id', type: String })
  getIntent(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.getPaymentIntent(tenantId, id);
  }

  // ─── T-415: PAYME WEBHOOK (per-tenant + rate-limited + IP logged) ──

  @Public()
  @Post('webhooks/payme')
  @UseGuards(WebhookIpGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Payme JSON-RPC 2.0 webhook (public, IP-filtered, rate-limited)' })
  async paymeWebhook(
    @Body() body: { id: number; method: string; params: Record<string, unknown> },
    @Headers('authorization') auth: string,
    @Req() req: Request,
  ) {
    const rpcId = body.id;
    const params = body.params ?? {};
    this.logger.log('Payme webhook', {
      ip: req.ip,
      requestId: req.headers['x-request-id'],
      method: body.method,
    });

    // Per-tenant routing: orderId → tenantId or paymeId → tenantId
    const tenantId = await this.resolvePaymeTenant(params);

    let authValid: boolean;
    if (tenantId) {
      authValid = await this.paymeProvider.verifyWebhookForTenant(tenantId, auth ?? '');
    } else {
      authValid = this.paymeProvider.verifyWebhookLegacy(auth ?? '');
    }

    if (!authValid) {
      this.logger.warn('Payme webhook auth failed', { ip: req.ip, tenantId });
      return {
        jsonrpc: '2.0',
        id: rpcId,
        error: { code: -32504, message: { uz: 'Forbidden', ru: 'Forbidden', en: 'Forbidden' } },
      };
    }

    const result = await this.paymeProvider.handleMethod(body.method, params);
    return { jsonrpc: '2.0', id: rpcId, ...result };
  }

  /** Resolve tenantId from Payme params (order_id or paymeId) */
  private async resolvePaymeTenant(params: Record<string, unknown>): Promise<string | null> {
    // Try orderId first (CheckPerformTransaction, CreateTransaction)
    const account = params.account as { order_id?: string } | undefined;
    if (account?.order_id) {
      const order = await this.prisma.order.findUnique({
        where: { id: account.order_id },
        select: { tenantId: true },
      });
      return order?.tenantId ?? null;
    }
    // Fallback: paymeId (PerformTransaction, CancelTransaction, CheckTransaction)
    const paymeId = params.id as string | undefined;
    if (paymeId) {
      const tx = await this.prisma.paymeTransaction.findUnique({
        where: { paymeId },
        select: { tenantId: true },
      });
      return tx?.tenantId ?? null;
    }
    return null;
  }

  // ─── T-415: CLICK WEBHOOKS (per-tenant + rate-limited + IP logged) ──

  @Public()
  @Post('webhooks/click/prepare')
  @UseGuards(WebhookIpGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Click Prepare webhook (public, IP-filtered, rate-limited)' })
  async clickPrepare(@Body() body: ClickWebhookBody, @Req() req: Request) {
    this.logger.log('Click Prepare webhook', {
      ip: req.ip,
      requestId: req.headers['x-request-id'],
      clickTransId: body.click_trans_id,
    });

    const tenantId = await this.resolveClickTenant(body.merchant_trans_id);

    let signValid: boolean;
    if (tenantId) {
      signValid = await this.clickProvider.verifySignatureForTenant(tenantId, body);
    } else {
      signValid = this.clickProvider.verifySignatureLegacy(body);
    }

    if (!signValid) {
      this.logger.warn('Click Prepare signature failed', { ip: req.ip, tenantId });
      return {
        click_trans_id: body.click_trans_id,
        merchant_trans_id: body.merchant_trans_id,
        merchant_prepare_id: null,
        error: -1,
        error_note: 'SIGN CHECK FAILED!',
      };
    }
    return this.clickProvider.handlePrepare(body);
  }

  @Public()
  @Post('webhooks/click/complete')
  @UseGuards(WebhookIpGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Click Complete webhook (public, IP-filtered, rate-limited)' })
  async clickComplete(@Body() body: ClickWebhookBody, @Req() req: Request) {
    this.logger.log('Click Complete webhook', {
      ip: req.ip,
      requestId: req.headers['x-request-id'],
      clickTransId: body.click_trans_id,
    });

    const tenantId = await this.resolveClickTenant(body.merchant_trans_id);

    let signValid: boolean;
    if (tenantId) {
      signValid = await this.clickProvider.verifySignatureForTenant(tenantId, body);
    } else {
      signValid = this.clickProvider.verifySignatureLegacy(body);
    }

    if (!signValid) {
      this.logger.warn('Click Complete signature failed', { ip: req.ip, tenantId });
      return {
        click_trans_id: body.click_trans_id,
        merchant_trans_id: body.merchant_trans_id,
        merchant_confirm_id: null,
        error: -1,
        error_note: 'SIGN CHECK FAILED!',
      };
    }
    return this.clickProvider.handleComplete(body);
  }

  /** Resolve tenantId from Click merchant_trans_id (orderId) */
  private async resolveClickTenant(merchantTransId: string): Promise<string | null> {
    if (!merchantTransId) return null;
    const order = await this.prisma.order.findUnique({
      where: { id: merchantTransId },
      select: { tenantId: true },
    });
    return order?.tenantId ?? null;
  }

  // ─── UZUM WEBHOOK (single endpoint, action in path) ────

  @Public()
  @Post('webhooks/uzum/:action')
  @UseGuards(WebhookIpGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Uzum Pay webhook (public, IP-filtered, rate-limited)' })
  @ApiParam({ name: 'action', enum: ['check', 'create', 'confirm', 'reverse', 'status'] })
  async uzumWebhook(
    @Param('action') action: string,
    @Body() body: { serviceId: number; timestamp: number; transId?: string; amount?: number; params?: Record<string, unknown> },
    @Headers('authorization') auth: string,
    @Req() req: Request,
  ) {
    this.logger.log('Uzum webhook', {
      ip: req.ip,
      requestId: req.headers['x-request-id'],
      action,
      serviceId: body.serviceId,
      transId: body.transId,
    });

    if (!this.uzumProvider.isValidAction(action)) {
      return {
        serviceId: body.serviceId,
        timestamp: Date.now(),
        status: 'FAILED',
        errorCode: '10003',
      };
    }

    const tenantId = await this.uzumProvider.resolveTenant(body);

    let authValid: boolean;
    if (tenantId) {
      authValid = await this.uzumProvider.verifyAuthForTenant(tenantId, auth ?? '');
    } else {
      authValid = this.uzumProvider.verifyAuthLegacy(auth ?? '');
    }

    if (!authValid) {
      this.logger.warn('Uzum webhook auth failed', { ip: req.ip, action, tenantId });
      return {
        serviceId: body.serviceId,
        timestamp: Date.now(),
        status: 'FAILED',
        errorCode: '10001',
      };
    }

    return this.uzumProvider.handleAction(action as 'check' | 'create' | 'confirm' | 'reverse' | 'status', body);
  }
}
