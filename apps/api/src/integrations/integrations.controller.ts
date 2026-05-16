import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IntegrationsService } from './integrations.service';
import {
  ConnectZzoneDto,
  PushProductDto,
  UpdateProductDto,
  UpdateOrderStatusDto,
} from './dto/zzone.dto';

@Controller('integrations/zzone')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IntegrationsController {
  constructor(private readonly service: IntegrationsService) {}

  // ─── CONNECTION ──────────────────────────────────────────────────────

  @Post('connect')
  @Roles('OWNER', 'ADMIN')
  async connect(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: ConnectZzoneDto,
  ) {
    const result = await this.service.connect(tenantId, dto.phone, dto.password);
    return { data: result };
  }

  @Post('disconnect')
  @Roles('OWNER', 'ADMIN')
  async disconnect(@CurrentUser('tenantId') tenantId: string) {
    await this.service.disconnect(tenantId);
    return { data: null, message: 'Disconnected from ZZone' };
  }

  @Get('status')
  async getStatus(@CurrentUser('tenantId') tenantId: string) {
    const status = await this.service.getStatus(tenantId);
    return { data: status };
  }

  // ─── STORE ───────────────────────────────────────────────────────────

  @Get('store')
  async getStore(@CurrentUser('tenantId') tenantId: string) {
    const store = await this.service.getStoreInfo(tenantId);
    return { data: store };
  }

  // ─── PRODUCTS ────────────────────────────────────────────────────────

  @Get('products')
  async getProducts(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
  ) {
    const result = await this.service.getProducts(tenantId, page ? +page : 1);
    return { data: result };
  }

  @Post('products')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  async pushProduct(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: PushProductDto,
  ) {
    const product = await this.service.pushProduct(tenantId, dto);
    return { data: product, message: 'Product pushed to ZZone' };
  }

  @Patch('products/:zzoneProductId')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  async updateProduct(
    @CurrentUser('tenantId') tenantId: string,
    @Param('zzoneProductId') zzoneProductId: string,
    @Body() dto: UpdateProductDto,
  ) {
    const product = await this.service.updateProduct(tenantId, zzoneProductId, dto);
    return { data: product, message: 'Product updated on ZZone' };
  }

  @Delete('products/:zzoneProductId')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  async deleteProduct(
    @CurrentUser('tenantId') tenantId: string,
    @Param('zzoneProductId') zzoneProductId: string,
  ) {
    await this.service.deleteProduct(tenantId, zzoneProductId);
    return { data: null, message: 'Product deleted from ZZone' };
  }

  // ─── ORDERS ──────────────────────────────────────────────────────────

  @Get('orders')
  async getOrders(
    @CurrentUser('tenantId') tenantId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
  ) {
    const result = await this.service.getOrders(tenantId, {
      status,
      page: page ? +page : undefined,
    });
    return { data: result };
  }

  @Patch('orders/:orderId/status')
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'CASHIER')
  async updateOrderStatus(
    @CurrentUser('tenantId') tenantId: string,
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.service.updateOrderStatus(tenantId, orderId, dto.status);
    return { data: order, message: `Order status updated to ${dto.status}` };
  }

  // ─── PRODUCT MAPPING ─────────────────────────────────────────────────

  @Post('publish/:productId')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  async publishProduct(
    @CurrentUser('tenantId') tenantId: string,
    @Param('productId') productId: string,
  ) {
    const result = await this.service.publishProduct(tenantId, productId);
    return { data: result, message: 'Product published to ZZone' };
  }

  @Post('unpublish/:productId')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  async unpublishProduct(
    @CurrentUser('tenantId') tenantId: string,
    @Param('productId') productId: string,
  ) {
    await this.service.unpublishProduct(tenantId, productId);
    return { data: null, message: 'Product removed from ZZone' };
  }

  @Get('published')
  async getPublishedProducts(@CurrentUser('tenantId') tenantId: string) {
    const products = await this.service.getPublishedProducts(tenantId);
    return { data: products };
  }
}
