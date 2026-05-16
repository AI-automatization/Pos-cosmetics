import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZzoneInboundService } from './zzone-inbound.service';

/**
 * ZZone → RAOS (Inbound API)
 *
 * Endpoints that ZZone backend calls to interact with RAOS.
 * Auth: API Key in X-Api-Key header (no JWT needed).
 *
 * Base path: /api/v1/zzone
 */

@Controller('zzone')
export class ZzoneInboundController {
  private readonly apiKey: string;

  constructor(
    private readonly service: ZzoneInboundService,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.get<string>('ZZONE_API_KEY') || 'zzone-raos-integration-key-2026';
  }

  // ─── PRODUCTS (ZZone reads from RAOS) ────────────────────────────────

  @Get('products')
  async getProducts(
    @Headers('x-api-key') key: string,
    @Query('sellerId') sellerId?: string,
    @Query('page') page?: string,
  ) {
    this.validateKey(key);
    const result = await this.service.getProducts(sellerId, page ? +page : 1);
    return { success: true, data: result };
  }

  @Get('products/:productId')
  async getProduct(
    @Headers('x-api-key') key: string,
    @Param('productId') productId: string,
  ) {
    this.validateKey(key);
    const product = await this.service.getProduct(productId);
    return { success: true, data: product };
  }

  @Get('products/:productId/stock')
  async getStock(
    @Headers('x-api-key') key: string,
    @Param('productId') productId: string,
  ) {
    this.validateKey(key);
    const stock = await this.service.getProductStock(productId);
    return { success: true, data: stock };
  }

  // ─── ORDERS (ZZone creates in RAOS) ─────────────────────────────────

  @Post('orders')
  async createOrder(
    @Headers('x-api-key') key: string,
    @Body() body: {
      zzoneOrderId: string;
      orderNumber: string;
      productId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      paymentMethod: string;
      clientName?: string;
      clientPhone?: string;
      deliveryAddress?: string;
    },
  ) {
    this.validateKey(key);
    const order = await this.service.createOrderFromZzone(body);
    return { success: true, data: order };
  }

  @Patch('orders/:orderId/status')
  async updateOrderStatus(
    @Headers('x-api-key') key: string,
    @Param('orderId') orderId: string,
    @Body() body: { status: string },
  ) {
    this.validateKey(key);
    const order = await this.service.updateOrderStatus(orderId, body.status);
    return { success: true, data: order };
  }

  @Get('orders')
  async getOrders(
    @Headers('x-api-key') key: string,
    @Query('sellerId') sellerId?: string,
    @Query('status') status?: string,
  ) {
    this.validateKey(key);
    const orders = await this.service.getOrders(sellerId, status);
    return { success: true, data: orders };
  }

  // ─── SELLERS/STORES (ZZone reads) ───────────────────────────────────

  @Get('sellers/:sellerId')
  async getSeller(
    @Headers('x-api-key') key: string,
    @Param('sellerId') sellerId: string,
  ) {
    this.validateKey(key);
    const seller = await this.service.getSeller(sellerId);
    return { success: true, data: seller };
  }

  @Get('stores/:storeId')
  async getStore(
    @Headers('x-api-key') key: string,
    @Param('storeId') storeId: string,
  ) {
    this.validateKey(key);
    const store = await this.service.getStore(storeId);
    return { success: true, data: store };
  }

  // ─── HEALTH ──────────────────────────────────────────────────────────

  @Get('health')
  async health() {
    return { success: true, data: { status: 'ok', service: 'raos-zzone-api' } };
  }

  // ─── AUTH HELPER ─────────────────────────────────────────────────────

  private validateKey(key: string): void {
    if (!key || key !== this.apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }
  }
}
