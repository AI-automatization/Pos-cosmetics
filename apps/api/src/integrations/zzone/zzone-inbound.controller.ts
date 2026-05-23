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
  @ApiOperation({ summary: 'Barcha mahsulotlar', description: 'RAOS dagi barcha faol mahsulotlarni olish. Pagination bilan.' })
  @ApiQuery({ name: 'sellerId', required: true, description: 'Tenant ID (MAJBURIY — multi-tenant isolation)' })
  @ApiQuery({ name: 'page', required: false, description: 'Sahifa raqami (default: 1)' })
  @ApiQuery({ name: 'updatedAfter', required: false, description: 'ISO date — faqat shu sanadan keyin yangilangan mahsulotlar (incremental sync)' })
  @ApiResponse({ status: 200, description: 'Mahsulotlar ro\'yxati' })
  @ApiResponse({ status: 401, description: 'Noto\'g\'ri API key' })
  async getProducts(
    @Headers('x-api-key') key: string,
    @Query('sellerId') sellerId: string,
    @Query('page') page?: string,
    @Query('updatedAfter') updatedAfter?: string,
  ) {
    this.validateKey(key);
    if (!sellerId) throw new BadRequestException('sellerId is required');
    const updatedAfterDate = updatedAfter ? new Date(updatedAfter) : undefined;
    if (updatedAfter && isNaN(updatedAfterDate!.getTime())) {
      throw new BadRequestException('updatedAfter must be a valid ISO date');
    }
    const result = await this.service.getProducts(sellerId, page ? +page : 1, updatedAfterDate);
    return { success: true, data: result };
  }

  @Get('products/:productId')
  @ApiTags('Products')
  @ApiOperation({ summary: 'Bitta mahsulot', description: 'Mahsulot ID bo\'yicha to\'liq ma\'lumot' })
  @ApiParam({ name: 'productId', description: 'RAOS Product UUID' })
  @ApiResponse({ status: 200, description: 'Mahsulot topildi' })
  @ApiResponse({ status: 404, description: 'Mahsulot topilmadi' })
  async getProduct(
    @Headers('x-api-key') key: string,
    @Param('productId') productId: string,
  ) {
    this.validateKey(key);
    const product = await this.service.getProduct(productId);
    return { success: true, data: product };
  }

  @Get('products/:productId/stock')
  @ApiTags('Products')
  @ApiOperation({ summary: 'Mahsulot zaxirasi', description: 'Hozirgi stock miqdori (real-time)' })
  @ApiParam({ name: 'productId', description: 'RAOS Product UUID' })
  @ApiResponse({ status: 200, description: '{ productId, stock, updatedAt }' })
  async getStock(
    @Headers('x-api-key') key: string,
    @Param('productId') productId: string,
  ) {
    this.validateKey(key);
    const stock = await this.service.getProductStock(productId);
    return { success: true, data: stock };
  }

  @Patch('products/:productId')
  @ApiTags('Products')
  @ApiOperation({ summary: 'Mahsulotni yangilash', description: 'Partial update — faqat yuborilgan fieldlar o\'zgaradi' })
  @ApiParam({ name: 'productId', description: 'RAOS Product UUID' })
  @ApiResponse({ status: 200, description: 'Mahsulot yangilandi' })
  @ApiResponse({ status: 404, description: 'Mahsulot topilmadi' })
  async updateProduct(
    @Headers('x-api-key') key: string,
    @Param('productId') productId: string,
    @Body() body: {
      name?: string;
      price?: number;
      description?: string;
      imageUrl?: string;
      category?: string;
      isActive?: boolean;
    },
  ) {
    this.validateKey(key);
    const product = await this.service.updateProduct(productId, body);
    return { success: true, data: product };
  }

  @Delete('products/:productId')
  @ApiTags('Products')
  @ApiOperation({ summary: 'Mahsulotni o\'chirish', description: 'Soft delete — mahsulot ZZone vitrinadan yashiriladi' })
  @ApiParam({ name: 'productId', description: 'RAOS Product UUID' })
  @ApiResponse({ status: 200, description: 'Mahsulot o\'chirildi (soft)' })
  @ApiResponse({ status: 404, description: 'Mahsulot topilmadi' })
  async deleteProduct(
    @Headers('x-api-key') key: string,
    @Param('productId') productId: string,
  ) {
    this.validateKey(key);
    const result = await this.service.deleteProduct(productId);
    return { success: true, data: result };
  }

  // ─── ORDERS ──────────────────────────────────────────────────────────

  @Post('orders')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiTags('Orders')
  @ApiOperation({ summary: 'Buyurtma yaratish', description: 'ZZone klient buyurtma berganida RAOS da order yaratish. Stock avtomatik kamayadi.' })
  @ApiResponse({ status: 201, description: 'Order yaratildi — raosOrderId qaytaradi' })
  @ApiResponse({ status: 404, description: 'Product topilmadi' })
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
  @ApiTags('Orders')
  @ApiOperation({ summary: 'Buyurtma statusini o\'zgartirish', description: 'Status: PENDING → CONFIRMED → COMPLETED | VOIDED | RETURNED' })
  @ApiParam({ name: 'orderId', description: 'RAOS Order UUID' })
  @ApiResponse({ status: 200, description: 'Status yangilandi' })
  async updateOrderStatus(
    @Headers('x-api-key') key: string,
    @Param('orderId') orderId: string,
    @Body() body: { status: string; sellerId: string },
  ) {
    this.validateKey(key);
    if (!body.sellerId) throw new BadRequestException('sellerId is required');
    const order = await this.service.updateOrderStatus(orderId, body.status, body.sellerId);
    return { success: true, data: order };
  }

  @Get('orders/:orderId')
  @ApiTags('Orders')
  @ApiOperation({ summary: 'Bitta buyurtma', description: 'Order ID bo\'yicha to\'liq ma\'lumot' })
  @ApiParam({ name: 'orderId', description: 'RAOS Order UUID' })
  @ApiResponse({ status: 200, description: 'Order topildi' })
  @ApiResponse({ status: 404, description: 'Order topilmadi' })
  async getOrder(
    @Headers('x-api-key') key: string,
    @Param('orderId') orderId: string,
  ) {
    this.validateKey(key);
    const order = await this.service.getOrder(orderId);
    return { success: true, data: order };
  }

  @Patch('orders/:orderId')
  @ApiTags('Orders')
  @ApiOperation({ summary: 'Buyurtmani tahrirlash', description: 'Faqat PENDING statusda tahrirlash mumkin' })
  @ApiParam({ name: 'orderId', description: 'RAOS Order UUID' })
  @ApiResponse({ status: 200, description: 'Order yangilandi' })
  @ApiResponse({ status: 400, description: 'Faqat PENDING statusda tahrirlash mumkin' })
  async updateOrder(
    @Headers('x-api-key') key: string,
    @Param('orderId') orderId: string,
    @Body() body: {
      sellerId: string;
      quantity?: number;
      totalPrice?: number;
      deliveryAddress?: string;
      clientPhone?: string;
    },
  ) {
    this.validateKey(key);
    if (!body.sellerId) throw new BadRequestException('sellerId is required');
    const order = await this.service.updateOrder(orderId, body.sellerId, body);
    return { success: true, data: order };
  }

  @Delete('orders/:orderId')
  @ApiTags('Orders')
  @ApiOperation({ summary: 'Buyurtmani bekor qilish', description: 'Faqat PENDING yoki CONFIRMED statusda bekor qilish mumkin. Stock qaytariladi.' })
  @ApiParam({ name: 'orderId', description: 'RAOS Order UUID' })
  @ApiQuery({ name: 'sellerId', required: true, description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Order bekor qilindi, stock qaytarildi' })
  @ApiResponse({ status: 400, description: 'COMPLETED statusdagi orderni bekor qilib bo\'lmaydi' })
  async deleteOrder(
    @Headers('x-api-key') key: string,
    @Param('orderId') orderId: string,
    @Query('sellerId') sellerId: string,
  ) {
    this.validateKey(key);
    if (!sellerId) throw new BadRequestException('sellerId is required');
    const result = await this.service.voidOrder(orderId, sellerId);
    return { success: true, data: result };
  }

  @Get('orders')
  @ApiTags('Orders')
  @ApiOperation({ summary: 'ZZone buyurtmalar', description: 'Faqat origin=ZZONE bo\'lgan orderlarni qaytaradi' })
  @ApiQuery({ name: 'sellerId', required: true, description: 'Tenant ID (MAJBURIY — multi-tenant isolation)' })
  @ApiQuery({ name: 'status', required: false, description: 'PENDING | CONFIRMED | COMPLETED | VOIDED' })
  @ApiResponse({ status: 200, description: 'Buyurtmalar ro\'yxati' })
  async getOrders(
    @Headers('x-api-key') key: string,
    @Query('sellerId') sellerId: string,
    @Query('status') status?: string,
  ) {
    this.validateKey(key);
    if (!sellerId) throw new BadRequestException('sellerId is required');
    const orders = await this.service.getOrders(sellerId, status);
    return { success: true, data: orders };
  }

  // ─── SELLERS / STORES ────────────────────────────────────────────────

  @Get('sellers/:sellerId')
  @ApiTags('Sellers')
  @ApiOperation({ summary: 'Seller ma\'lumoti', description: 'Tenant (seller) haqida asosiy ma\'lumot' })
  @ApiParam({ name: 'sellerId', description: 'Tenant UUID' })
  @ApiResponse({ status: 200, description: 'Seller topildi' })
  @ApiResponse({ status: 404, description: 'Seller topilmadi' })
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
  @ApiOperation({ summary: 'Seller ma\'lumotini yangilash', description: 'Tenant ma\'lumotlarini partial update' })
  @ApiParam({ name: 'sellerId', description: 'Tenant UUID' })
  @ApiResponse({ status: 200, description: 'Seller yangilandi' })
  @ApiResponse({ status: 404, description: 'Seller topilmadi' })
  async updateSeller(
    @Headers('x-api-key') key: string,
    @Param('sellerId') sellerId: string,
    @Body() body: { name?: string; phone?: string; city?: string },
  ) {
    this.validateKey(key);
    const seller = await this.service.updateSeller(sellerId, body);
    return { success: true, data: seller };
  }

  @Delete('sellers/:sellerId')
  @ApiTags('Sellers')
  @ApiOperation({ summary: 'Sellerni deaktivatsiya', description: 'Seller nofaol bo\'ladi, barcha mahsulotlari ZZone dan yashiriladi' })
  @ApiParam({ name: 'sellerId', description: 'Tenant UUID' })
  @ApiResponse({ status: 200, description: 'Seller deaktivatsiya qilindi' })
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
  @ApiOperation({ summary: 'Do\'konlar ro\'yxati', description: 'Seller (tenant) ning barcha filiallari' })
  @ApiQuery({ name: 'sellerId', required: true, description: 'Tenant ID (MAJBURIY)' })
  @ApiResponse({ status: 200, description: 'Filiallar ro\'yxati' })
  async getStores(
    @Headers('x-api-key') key: string,
    @Query('sellerId') sellerId: string,
  ) {
    this.validateKey(key);
    if (!sellerId) throw new BadRequestException('sellerId is required');
    const stores = await this.service.getStores(sellerId);
    return { success: true, data: stores };
  }

  @Get('stores/:storeId')
  @ApiTags('Stores')
  @ApiOperation({ summary: 'Do\'kon/filial', description: 'Branch (do\'kon) haqida ma\'lumot' })
  @ApiParam({ name: 'storeId', description: 'Branch UUID' })
  @ApiResponse({ status: 200, description: 'Store topildi' })
  @ApiResponse({ status: 404, description: 'Store topilmadi' })
  async getStore(
    @Headers('x-api-key') key: string,
    @Param('storeId') storeId: string,
  ) {
    this.validateKey(key);
    const store = await this.service.getStore(storeId);
    return { success: true, data: store };
  }

  @Patch('stores/:storeId')
  @ApiTags('Stores')
  @ApiOperation({ summary: 'Do\'konni yangilash', description: 'Branch ma\'lumotlarini partial update' })
  @ApiParam({ name: 'storeId', description: 'Branch UUID' })
  @ApiResponse({ status: 200, description: 'Store yangilandi' })
  @ApiResponse({ status: 404, description: 'Store topilmadi' })
  async updateStore(
    @Headers('x-api-key') key: string,
    @Param('storeId') storeId: string,
    @Body() body: { name?: string; address?: string },
  ) {
    this.validateKey(key);
    const store = await this.service.updateStore(storeId, body);
    return { success: true, data: store };
  }

  @Delete('stores/:storeId')
  @ApiTags('Stores')
  @ApiOperation({ summary: 'Do\'konni deaktivatsiya', description: 'Branch nofaol bo\'ladi' })
  @ApiParam({ name: 'storeId', description: 'Branch UUID' })
  @ApiResponse({ status: 200, description: 'Store deaktivatsiya qilindi' })
  async deactivateStore(
    @Headers('x-api-key') key: string,
    @Param('storeId') storeId: string,
  ) {
    this.validateKey(key);
    const result = await this.service.deactivateStore(storeId);
    return { success: true, data: result };
  }

  // ─── HEALTH ──────────────────────────────────────────────────────────

  @Get('health')
  @ApiTags('Health')
  @ApiOperation({ summary: 'Health check', description: 'API ishlayaptimi tekshirish. API key talab qilinmaydi.' })
  @ApiResponse({ status: 200, description: '{ status: "ok" }' })
  async health() {
    return { success: true, data: { status: 'ok', service: 'raos-zzone-api' } };
  }

  // ─── AUTH HELPER ─────────────────────────────────────────────────────

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
}
