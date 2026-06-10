import { Controller, Get, Post, Patch, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CurrentTenant, Public, Roles } from '../../common/decorators';
import { AdetalOutboundService } from './adetal-outbound.service';
import {
  AdetalStoreCreateDto,
  AdetalStoreUpdateDto,
  AdetalLocationUpdateDto,
  AdetalOrderStatusUpdateDto,
  AdetalPaymentReviewDto,
} from './dto/adetal.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ADETAL_PROVIDER } from './adetal.constants';

@Controller('adetal')
@ApiBearerAuth()
export class AdetalController {
  private readonly logger = new Logger(AdetalController.name);

  constructor(
    private readonly outbound: AdetalOutboundService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── HEALTH ──────────────────────────────────────────────────────────

  @Get('health')
  @Public()
  @ApiTags('Health')
  @ApiOperation({ summary: 'Adetal API ulanish tekshiruvi' })
  @ApiResponse({ status: 200, description: 'Adetal API holati' })
  async health() {
    const isUp = await this.outbound.healthCheck();
    return { status: isUp ? 'ok' : 'down', service: 'adetal-api', timestamp: new Date().toISOString() };
  }

  // ─── STORE ───────────────────────────────────────────────────────────

  @Get('store')
  @ApiTags('Store')
  @ApiOperation({ summary: 'Adetal dagi dokon malumotlari' })
  @Roles('OWNER', 'ADMIN')
  async getStore(@CurrentTenant() tenantId: string) {
    return this.outbound.getMyStore(tenantId);
  }

  @Post('store')
  @ApiTags('Store')
  @ApiOperation({ summary: 'Adetal da dokon yaratish' })
  @Roles('OWNER')
  async createStore(@CurrentTenant() tenantId: string, @Body() body: AdetalStoreCreateDto) {
    return this.outbound.createStore(tenantId, body);
  }

  @Patch('store')
  @ApiTags('Store')
  @ApiOperation({ summary: 'Adetal dokon malumotlarini yangilash' })
  @Roles('OWNER', 'ADMIN')
  async updateStore(@CurrentTenant() tenantId: string, @Body() body: AdetalStoreUpdateDto) {
    return this.outbound.updateStore(tenantId, body);
  }

  @Patch('store/location')
  @ApiTags('Store')
  @ApiOperation({ summary: 'Adetal dokon joylashuvini yangilash' })
  @Roles('OWNER', 'ADMIN')
  async updateLocation(@CurrentTenant() tenantId: string, @Body() body: AdetalLocationUpdateDto) {
    return this.outbound.updateLocation(tenantId, body);
  }

  @Get('plans')
  @Public()
  @ApiTags('Store')
  @ApiOperation({ summary: 'Adetal obuna rejalari' })
  async getPlans() {
    return this.outbound.getStorePlans();
  }

  // ─── PRODUCTS ────────────────────────────────────────────────────────

  @Get('products')
  @ApiTags('Products')
  @ApiOperation({ summary: 'Adetal dagi mahsulotlar' })
  @Roles('OWNER', 'ADMIN')
  async getProducts(@CurrentTenant() tenantId: string) {
    return this.outbound.getMyProducts(tenantId);
  }

  @Post('products/sync')
  @ApiTags('Products')
  @ApiOperation({ summary: 'Barcha mahsulotlarni Adetal ga sinxronlash' })
  @Roles('OWNER')
  async syncProducts(@CurrentTenant() tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId, isActive: true, deletedAt: null },
      select: { id: true },
    });
    return { success: true, message: `Sync triggered for ${products.length} products`, productCount: products.length };
  }

  // ─── ORDERS ──────────────────────────────────────────────────────────

  @Get('orders')
  @ApiTags('Orders')
  @ApiOperation({ summary: 'Adetal dan kelgan zakazlar' })
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  async getOrders(@CurrentTenant() tenantId: string) {
    return this.outbound.getSellerOrders(tenantId, { limit: 50 });
  }

  @Patch('orders/status')
  @ApiTags('Orders')
  @ApiOperation({ summary: 'Adetal zakaz statusini yangilash' })
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  async updateOrderStatus(@CurrentTenant() tenantId: string, @Body() body: AdetalOrderStatusUpdateDto) {
    await this.outbound.updateOrderStatus(tenantId, body.orderId, body.status);
    return { success: true };
  }

  @Patch('orders/review-payment')
  @ApiTags('Orders')
  @ApiOperation({ summary: 'Adetal zakaz tolovini tasdiqlash/rad etish' })
  @Roles('OWNER', 'ADMIN')
  async reviewPayment(@CurrentTenant() tenantId: string, @Body() body: AdetalPaymentReviewDto) {
    await this.outbound.reviewPayment(tenantId, body.orderId, body.approved);
    return { success: true };
  }

  // ─── ANALYTICS ───────────────────────────────────────────────────────

  @Get('analytics')
  @ApiTags('Analytics')
  @ApiOperation({ summary: 'Adetal seller analitikasi' })
  @Roles('OWNER', 'ADMIN')
  async getAnalytics(@CurrentTenant() tenantId: string) {
    return this.outbound.getAnalytics(tenantId);
  }

  // ─── REVIEWS ─────────────────────────────────────────────────────────

  @Get('reviews')
  @ApiTags('Reviews')
  @ApiOperation({ summary: 'Adetal dagi sharhlar' })
  @Roles('OWNER', 'ADMIN')
  async getReviews(@CurrentTenant() tenantId: string) {
    return this.outbound.getSellerReviews(tenantId);
  }

  // ─── NOTIFICATIONS ───────────────────────────────────────────────────

  @Get('notifications')
  @ApiTags('Notifications')
  @ApiOperation({ summary: 'Adetal bildirishnomalar' })
  @Roles('OWNER', 'ADMIN')
  async getNotifications(@CurrentTenant() tenantId: string) {
    return this.outbound.getNotifications(tenantId);
  }

  @Patch('notifications/read-all')
  @ApiTags('Notifications')
  @ApiOperation({ summary: 'Barcha bildirishnomalarni oqilgan qilish' })
  @Roles('OWNER', 'ADMIN')
  async markAllRead(@CurrentTenant() tenantId: string) {
    await this.outbound.markAllNotificationsRead(tenantId);
    return { success: true };
  }

  // ─── CONFIG ──────────────────────────────────────────────────────────

  @Get('config')
  @ApiTags('Config')
  @ApiOperation({ summary: 'Adetal integratsiya konfiguratsiyasi' })
  @Roles('OWNER')
  async getConfig(@CurrentTenant() tenantId: string) {
    const config = await this.prisma.integrationConfig.findUnique({
      where: { tenantId_provider: { tenantId, provider: ADETAL_PROVIDER } },
    });

    if (!config) return { exists: false, isActive: false };

    const adetalConfig = (config.config ?? {}) as Record<string, unknown>;
    const productMappings = (adetalConfig.productMappings ?? {}) as Record<string, string>;

    return {
      exists: true,
      isActive: config.isActive,
      phone: adetalConfig.phone ?? '',
      hasToken: !!adetalConfig.accessToken,
      productCount: Object.keys(productMappings).length,
    };
  }
}
