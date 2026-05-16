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
import { ApiTags, ApiOperation, ApiHeader, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ZzoneInboundService } from './zzone-inbound.service';

@Controller('zzone')
@ApiHeader({ name: 'X-Api-Key', required: true, description: 'API ключ для ZZone интеграции' })
export class ZzoneInboundController {
  private readonly apiKey: string;

  constructor(
    private readonly service: ZzoneInboundService,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.get<string>('ZZONE_API_KEY') || 'zzone-raos-integration-key-2026';
  }

  // ─── PRODUCTS ─────────────────────────────────────────────────────────

  @Get('products')
  @ApiTags('Products')
  @ApiOperation({ summary: 'Barcha mahsulotlar', description: 'RAOS dagi barcha faol mahsulotlarni olish. Pagination bilan.' })
  @ApiQuery({ name: 'sellerId', required: false, description: 'Tenant ID bo\'yicha filter' })
  @ApiQuery({ name: 'page', required: false, description: 'Sahifa raqami (default: 1)' })
  @ApiResponse({ status: 200, description: 'Mahsulotlar ro\'yxati' })
  @ApiResponse({ status: 401, description: 'Noto\'g\'ri API key' })
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

  // ─── ORDERS ──────────────────────────────────────────────────────────

  @Post('orders')
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
    @Body() body: { status: string },
  ) {
    this.validateKey(key);
    const order = await this.service.updateOrderStatus(orderId, body.status);
    return { success: true, data: order };
  }

  @Get('orders')
  @ApiTags('Orders')
  @ApiOperation({ summary: 'ZZone buyurtmalar', description: 'Faqat origin=ZZONE bo\'lgan orderlarni qaytaradi' })
  @ApiQuery({ name: 'sellerId', required: false, description: 'Tenant ID filter' })
  @ApiQuery({ name: 'status', required: false, description: 'PENDING | CONFIRMED | COMPLETED | VOIDED' })
  @ApiResponse({ status: 200, description: 'Buyurtmalar ro\'yxati' })
  async getOrders(
    @Headers('x-api-key') key: string,
    @Query('sellerId') sellerId?: string,
    @Query('status') status?: string,
  ) {
    this.validateKey(key);
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

  @Get('stores/:storeId')
  @ApiTags('Sellers')
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
    if (!key || key !== this.apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }
  }
}
