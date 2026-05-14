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
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators';
import { PaymeProvider } from './providers/payme.provider';
import { ClickProvider, ClickWebhookBody } from './providers/click.provider';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER', 'ADMIN', 'MANAGER', 'CASHIER')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymeProvider: PaymeProvider,
    private readonly clickProvider: ClickProvider,
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

  // ─── T-397: PAYME WEBHOOK (rate-limited + IP logged) ──────────

  @Public()
  @Post('webhooks/payme')
  @Throttle({ default: { limit: 120, ttl: 60000 } })
  @ApiOperation({ summary: 'T-397: Payme JSON-RPC 2.0 webhook (public, rate-limited)' })
  async paymeWebhook(
    @Body() body: { id: number; method: string; params: Record<string, unknown> },
    @Headers('authorization') auth: string,
    @Req() req: Request,
  ) {
    const rpcId = body.id;
    this.logger.log('Payme webhook', {
      ip: req.ip,
      requestId: req.headers['x-request-id'],
      method: body.method,
    });

    if (!this.paymeProvider.verifyWebhook(auth ?? '')) {
      this.logger.warn('Payme webhook auth failed', { ip: req.ip });
      return {
        jsonrpc: '2.0',
        id: rpcId,
        error: { code: -32504, message: { uz: 'Forbidden', ru: 'Forbidden', en: 'Forbidden' } },
      };
    }

    const result = await this.paymeProvider.handleMethod(body.method, body.params ?? {});
    return { jsonrpc: '2.0', id: rpcId, ...result };
  }

  // ─── T-397: CLICK WEBHOOKS (rate-limited + IP logged) ────────

  @Public()
  @Post('webhooks/click/prepare')
  @Throttle({ default: { limit: 120, ttl: 60000 } })
  @ApiOperation({ summary: 'T-397: Click Prepare webhook (public, rate-limited)' })
  async clickPrepare(@Body() body: ClickWebhookBody, @Req() req: Request) {
    this.logger.log('Click Prepare webhook', {
      ip: req.ip,
      requestId: req.headers['x-request-id'],
      clickTransId: body.click_trans_id,
    });

    if (!this.clickProvider.verifySignature(body)) {
      this.logger.warn('Click Prepare signature failed', { ip: req.ip });
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
  @Throttle({ default: { limit: 120, ttl: 60000 } })
  @ApiOperation({ summary: 'T-397: Click Complete webhook (public, rate-limited)' })
  async clickComplete(@Body() body: ClickWebhookBody, @Req() req: Request) {
    this.logger.log('Click Complete webhook', {
      ip: req.ip,
      requestId: req.headers['x-request-id'],
      clickTransId: body.click_trans_id,
    });

    if (!this.clickProvider.verifySignature(body)) {
      this.logger.warn('Click Complete signature failed', { ip: req.ip });
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
}
