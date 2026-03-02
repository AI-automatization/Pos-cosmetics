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
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto, SplitPaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intent')
  @ApiOperation({ summary: 'Create payment intent (single method)' })
  createIntent(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreatePaymentIntentDto,
  ) {
    return this.paymentsService.createPaymentIntent(tenantId, dto);
  }

  @Post('split')
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
}
