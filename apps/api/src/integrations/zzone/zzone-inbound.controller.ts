import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Headers,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../common/decorators';
import { ZzoneInboundService } from './zzone-inbound.service';
import {
  CreateZzoneOrderDto,
  UpdateOrderStatusDto,
  UpdateZzoneOrderDto,
  UpdateProductDto,
  UpdateSellerDto,
  UpdateStoreDto,
} from './dto/zzone.dto';

@Controller('zzone')
@Public()
@Throttle({ default: { limit: 60, ttl: 60000 } })
@ApiHeader({ name: 'X-Api-Key', required: true, description: 'API ключ для ZZone интеграции' })
export class ZzoneInboundController {
  private readonly logger = new Logger(ZzoneInboundController.name);
  private readonly apiKey: string;

  constructor(
    private readonly service: ZzoneInboundService,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.get<string>('ZZONE_API_KEY', '');
    if (!this.apiKey) {
      this.logger.warn('ZZONE_API_KEY not set — all ZZone endpoints will return 401');
    }
  }

  // ─── PRODUCTS ─────────────────────────────────────────────────────────

  @Get('products')
  @ApiTags('Products')
  @ApiOperation({ summary: 'Barcha mahsulotlar' })
  @ApiQuery({ name: 'sellerId', required: true, description: 'Tenant ID' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'updatedAfter', required: false, description: 'ISO date — incremental sync' })
  async getProducts(
    @Headers('x-api-key') key: string,
    @Query('sellerId') sellerId: string,
    @Query('page') page?: string,
    @Query('updatedAfter') updatedAfter?: string,
  ) {
    this.validateKey(key);
    this.requireSellerId(sellerId);
    const pageNum = page ? Math.max(1, parseInt(page, 10) || 1) : 1;
    const updatedAfterDate = updatedAfter ? new Date(updatedAfter) : undefined;
    if (updatedAfter && isNaN(updatedAfterDate!.getTime())) {
      throw new BadRequestException('updatedAfter must be a valid ISO date');
    }
    const result = await this.service.getProducts(sellerId, pageNum, updatedAfterDate);
    return { success: true, data: result };
  }

  @Get('products/:productId')
  @ApiTags('Products')
  @ApiOperation({ summary: 'Bitta mahsulot' })
  @ApiQuery({ name: 'sellerId', required: true })
  async getProduct(
    @Headers('x-api-key') key: string,
    @Param('productId') productId: string,
    @Query('sellerId') sellerId: string,
  ) {
    this.validateKey(key);
    this.requireSellerId(sellerId);
    const product = await this.service.getProduct(sellerId, productId);
    return { success: true, data: product };
  }

  @Get('products/:productId/stock')
  @ApiTags('Products')
  @ApiOperation({ summary: 'Mahsulot zaxirasi (real-time)' })
  @ApiQuery({ name: 'sellerId', required: true })
  async getStock(
    @Headers('x-api-key') key: string,
    @Param('productId') productId: string,
    @Query('sellerId') sellerId: string,
  ) {
    this.validateKey(key);
    this.requireSellerId(sellerId);
    const stock = await this.service.getProductStock(sellerId, productId);
    return { success: true, data: stock };
  }

  @Patch('products/:productId')
  @ApiTags('Products')
  @ApiOperation({ summary: 'Mahsulotni yangilash (partial)' })
  @ApiQuery({ name: 'sellerId', required: true })
  async updateProduct(
    @Headers('x-api-key') key: string,
    @Param('productId') productId: string,
    @Query('sellerId') sellerId: string,
    @Body() body: UpdateProductDto,
  ) {
    this.validateKey(key);
    this.requireSellerId(sellerId);
    const product = await this.service.updateProduct(sellerId, productId, body);
    return { success: true, data: product };
  }

  @Delete('products/:productId')
  @ApiTags('Products')
  @ApiOperation({ summary: 'Mahsulotni o\'chirish (soft)' })
  @ApiQuery({ name: 'sellerId', required: true })
  async deleteProduct(
    @Headers('x-api-key') key: string,
    @Param('productId') productId: string,
    @Query('sellerId') sellerId: string,
  ) {
    this.validateKey(key);
    this.requireSellerId(sellerId);
    const result = await this.service.deleteProduct(sellerId, productId);
    return { success: true, data: result };
  }

  // ─── ORDERS ──────────────────────────────────────────────────────────

  @Post('orders')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiTags('Orders')
  @ApiOperation({ summary: 'Buyurtma yaratish (ZZone → RAOS)' })
  async createOrder(
    @Headers('x-api-key') key: string,
    @Body() body: CreateZzoneOrderDto,
  ) {
    this.validateKey(key);
    const order = await this.service.createOrderFromZzone(body);
    return { success: true, data: order };
  }

  @Patch('orders/:orderId/status')
  @ApiTags('Orders')
  @ApiOperation({ summary: 'Buyurtma statusini o\'zgartirish' })
  async updateOrderStatus(
    @Headers('x-api-key') key: string,
    @Param('orderId') orderId: string,
    @Body() body: UpdateOrderStatusDto,
  ) {
    this.validateKey(key);
    const order = await this.service.updateOrderStatus(orderId, body.status, body.sellerId);
    return { success: true, data: order };
  }

  @Get('orders/:orderId')
  @ApiTags('Orders')
  @ApiOperation({ summary: 'Bitta buyurtma' })
  @ApiQuery({ name: 'sellerId', required: true })
  async getOrder(
    @Headers('x-api-key') key: string,
    @Param('orderId') orderId: string,
    @Query('sellerId') sellerId: string,
  ) {
    this.validateKey(key);
    this.requireSellerId(sellerId);
    const order = await this.service.getOrder(sellerId, orderId);
    return { success: true, data: order };
  }

  @Patch('orders/:orderId')
  @ApiTags('Orders')
  @ApiOperation({ summary: 'Buyurtmani tahrirlash (faqat PENDING)' })
  async updateOrder(
    @Headers('x-api-key') key: string,
    @Param('orderId') orderId: string,
    @Body() body: UpdateZzoneOrderDto,
  ) {
    this.validateKey(key);
    const order = await this.service.updateOrder(orderId, body.sellerId, body);
    return { success: true, data: order };
  }

  @Delete('orders/:orderId')
  @ApiTags('Orders')
  @ApiOperation({ summary: 'Buyurtmani bekor qilish (stock qaytariladi)' })
  @ApiQuery({ name: 'sellerId', required: true })
  async deleteOrder(
    @Headers('x-api-key') key: string,
    @Param('orderId') orderId: string,
    @Query('sellerId') sellerId: string,
  ) {
    this.validateKey(key);
    this.requireSellerId(sellerId);
    const result = await this.service.voidOrder(orderId, sellerId);
    return { success: true, data: result };
  }

  @Get('orders')
  @ApiTags('Orders')
  @ApiOperation({ summary: 'ZZone buyurtmalar ro\'yxati' })
  @ApiQuery({ name: 'sellerId', required: true })
  @ApiQuery({ name: 'status', required: false })
  async getOrders(
    @Headers('x-api-key') key: string,
    @Query('sellerId') sellerId: string,
    @Query('status') status?: string,
  ) {
    this.validateKey(key);
    this.requireSellerId(sellerId);
    const orders = await this.service.getOrders(sellerId, status);
    return { success: true, data: orders };
  }

  // ─── SELLERS ─────────────────────────────────────────────────────────

  @Get('sellers/:sellerId')
  @ApiTags('Sellers')
  @ApiOperation({ summary: 'Seller ma\'lumoti' })
  async getSeller(
    @Headers('x-api-key') key: string,
    @Param('sellerId') sellerId: string,
  ) {
    this.validateKey(key);
    const seller = await this.service.getSeller(sellerId);
    return { success: true, data: seller };
  }

  @Patch('sellers/:sellerId')
  @ApiTags('Sellers')
  @ApiOperation({ summary: 'Seller ma\'lumotini yangilash' })
  async updateSeller(
    @Headers('x-api-key') key: string,
    @Param('sellerId') sellerId: string,
    @Body() body: UpdateSellerDto,
  ) {
    this.validateKey(key);
    const seller = await this.service.updateSeller(sellerId, body);
    return { success: true, data: seller };
  }

  @Delete('sellers/:sellerId')
  @ApiTags('Sellers')
  @ApiOperation({ summary: 'Sellerni deaktivatsiya' })
  async deactivateSeller(
    @Headers('x-api-key') key: string,
    @Param('sellerId') sellerId: string,
  ) {
    this.validateKey(key);
    const result = await this.service.deactivateSeller(sellerId);
    return { success: true, data: result };
  }

  // ─── STORES ──────────────────────────────────────────────────────────

  @Get('stores')
  @ApiTags('Stores')
  @ApiOperation({ summary: 'Do\'konlar ro\'yxati' })
  @ApiQuery({ name: 'sellerId', required: true })
  async getStores(
    @Headers('x-api-key') key: string,
    @Query('sellerId') sellerId: string,
  ) {
    this.validateKey(key);
    this.requireSellerId(sellerId);
    const stores = await this.service.getStores(sellerId);
    return { success: true, data: stores };
  }

  @Get('stores/:storeId')
  @ApiTags('Stores')
  @ApiOperation({ summary: 'Bitta do\'kon' })
  @ApiQuery({ name: 'sellerId', required: true })
  async getStore(
    @Headers('x-api-key') key: string,
    @Param('storeId') storeId: string,
    @Query('sellerId') sellerId: string,
  ) {
    this.validateKey(key);
    this.requireSellerId(sellerId);
    const store = await this.service.getStore(sellerId, storeId);
    return { success: true, data: store };
  }

  @Patch('stores/:storeId')
  @ApiTags('Stores')
  @ApiOperation({ summary: 'Do\'konni yangilash' })
  @ApiQuery({ name: 'sellerId', required: true })
  async updateStore(
    @Headers('x-api-key') key: string,
    @Param('storeId') storeId: string,
    @Query('sellerId') sellerId: string,
    @Body() body: UpdateStoreDto,
  ) {
    this.validateKey(key);
    this.requireSellerId(sellerId);
    const store = await this.service.updateStore(sellerId, storeId, body);
    return { success: true, data: store };
  }

  @Delete('stores/:storeId')
  @ApiTags('Stores')
  @ApiOperation({ summary: 'Do\'konni deaktivatsiya' })
  @ApiQuery({ name: 'sellerId', required: true })
  async deactivateStore(
    @Headers('x-api-key') key: string,
    @Param('storeId') storeId: string,
    @Query('sellerId') sellerId: string,
  ) {
    this.validateKey(key);
    this.requireSellerId(sellerId);
    const result = await this.service.deactivateStore(sellerId, storeId);
    return { success: true, data: result };
  }

  // ─── HEALTH ──────────────────────────────────────────────────────────

  @Get('health')
  @ApiTags('Health')
  @ApiOperation({ summary: 'Health check (no API key required)' })
  async health() {
    return { success: true, data: { status: 'ok', service: 'raos-zzone-api' } };
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────

  private validateKey(key: string): void {
    if (!key || !this.apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }
    const a = Buffer.from(key);
    const b = Buffer.from(this.apiKey);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid API key');
    }
  }

  private requireSellerId(sellerId: string): void {
    if (!sellerId) throw new BadRequestException('sellerId is required');
  }
}
