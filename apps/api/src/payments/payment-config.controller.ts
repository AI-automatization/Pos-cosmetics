import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PaymentProviderType } from '@prisma/client';
import { PaymentConfigService } from './payment-config.service';
import { UpsertPaymentProviderDto } from './dto/payment-config.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Payment Config')
@ApiBearerAuth()
@Controller('payment-config')
export class PaymentConfigController {
  private readonly logger = new Logger(PaymentConfigController.name);

  constructor(private readonly paymentConfigService: PaymentConfigService) {}

  @Get()
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'List all payment provider configs' })
  getAll(@CurrentUser('tenantId') tenantId: string) {
    return this.paymentConfigService.getProviderConfigs(tenantId);
  }

  @Get('active')
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'CASHIER', 'WAREHOUSE', 'VIEWER')
  @ApiOperation({ summary: 'Active providers for POS' })
  getActive(@CurrentUser('tenantId') tenantId: string) {
    return this.paymentConfigService.getActiveProviders(tenantId);
  }

  @Post(':provider')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Create or update payment provider config' })
  @ApiParam({ name: 'provider', enum: PaymentProviderType })
  upsert(
    @CurrentUser('tenantId') tenantId: string,
    @Param('provider') provider: PaymentProviderType,
    @Body() dto: UpsertPaymentProviderDto,
  ) {
    return this.paymentConfigService.upsertProvider(tenantId, provider, dto);
  }

  @Delete(':provider')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Deactivate a payment provider' })
  @ApiParam({ name: 'provider', enum: PaymentProviderType })
  async deactivate(
    @CurrentUser('tenantId') tenantId: string,
    @Param('provider') provider: PaymentProviderType,
  ) {
    await this.paymentConfigService.deactivateProvider(tenantId, provider);
    return { success: true };
  }

  @Post(':provider/verify')
  @Roles('OWNER', 'ADMIN')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Verify provider credentials' })
  @ApiParam({ name: 'provider', enum: PaymentProviderType })
  verify(
    @CurrentUser('tenantId') tenantId: string,
    @Param('provider') provider: PaymentProviderType,
  ) {
    return this.paymentConfigService.verifyCredentials(tenantId, provider);
  }
}
