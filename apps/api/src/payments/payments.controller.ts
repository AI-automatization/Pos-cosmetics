import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Body,
  Headers,
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

  // ─── T-393: PAYME WEBHOOK (JSON-RPC 2.0) ─────────────────────

  @Public()
  @Post('webhooks/payme')
  @ApiOperation({ summary: 'T-393: Payme JSON-RPC 2.0 webhook (public)' })
  async paymeWebhook(
    @Body() body: { id: number; method: string; params: Record<string, unknown> },
    @Headers('authorization') auth: string,
  ) {
    const rpcId = body.id;

    if (!this.paymeProvider.verifyWebhook(auth ?? '')) {
      return {
        jsonrpc: '2.0',
        id: rpcId,
        error: { code: -32504, message: { uz: 'Forbidden', ru: 'Forbidden', en: 'Forbidden' } },
      };
    }

    const result = await this.paymeProvider.handleMethod(body.method, body.params ?? {});
    return { jsonrpc: '2.0', id: rpcId, ...result };
  }

  // ─── T-395: CLICK WEBHOOKS (signature + real logic) ───────────

  @Public()
  @Post('webhooks/click/prepare')
  @ApiOperation({ summary: 'T-395: Click Prepare webhook (public, verified)' })
  async clickPrepare(@Body() body: ClickWebhookBody) {
    if (!this.clickProvider.verifySignature(body)) {
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
  @ApiOperation({ summary: 'T-395: Click Complete webhook (public, verified)' })
  async clickComplete(@Body() body: ClickWebhookBody) {
    if (!this.clickProvider.verifySignature(body)) {
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
