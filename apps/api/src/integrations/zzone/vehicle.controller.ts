import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../common/decorators';
import { VehicleService } from './vehicle.service';

@Controller('zzone')
@Public()
@ApiHeader({ name: 'X-Api-Key', required: true, description: 'API ключ для ZZone интеграции' })
export class VehicleController {
  private readonly apiKey: string;

  constructor(
    private readonly service: VehicleService,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.get<string>('ZZONE_API_KEY', '');
  }

  // ─── VEHICLES ────────────────────────────────────────────────────────

  @Get('vehicles')
  @ApiTags('Vehicles')
  @ApiOperation({ summary: 'Avtomobillar ro\'yxati', description: 'Brand, model, year bo\'yicha filtrlash' })
  @ApiQuery({ name: 'brand', required: false, description: 'Avtomobil brendi (masalan: Toyota)' })
  @ApiQuery({ name: 'model', required: false, description: 'Model nomi (masalan: Camry)' })
  @ApiQuery({ name: 'year', required: false, description: 'Yil (masalan: 2020)' })
  @ApiResponse({ status: 200, description: 'Avtomobillar ro\'yxati' })
  async getVehicles(
    @Headers('x-api-key') key: string,
    @Query('brand') brand?: string,
    @Query('model') model?: string,
    @Query('year') year?: string,
  ) {
    this.validateKey(key);
    const vehicles = await this.service.getVehicles({
      brand,
      model,
      year: year ? +year : undefined,
    });
    return { success: true, data: vehicles };
  }

  @Get('vehicles/brands')
  @ApiTags('Vehicles')
  @ApiOperation({ summary: 'Barcha brendlar', description: 'Unikal avtomobil brendlari ro\'yxati' })
  @ApiResponse({ status: 200, description: 'Brendlar massivi' })
  async getVehicleBrands(@Headers('x-api-key') key: string) {
    this.validateKey(key);
    const brands = await this.service.getVehicleBrands();
    return { success: true, data: brands };
  }

  @Post('vehicles')
  @ApiTags('Vehicles')
  @ApiOperation({ summary: 'Avtomobil qo\'shish', description: 'Yangi avtomobil modelini bazaga qo\'shish (admin)' })
  @ApiResponse({ status: 201, description: 'Avtomobil yaratildi' })
  async createVehicle(
    @Headers('x-api-key') key: string,
    @Body() body: {
      brand: string;
      model: string;
      yearFrom: number;
      yearTo?: number;
      bodyType?: string;
    },
  ) {
    this.validateKey(key);
    const vehicle = await this.service.createVehicle(body);
    return { success: true, data: vehicle };
  }

  // ─── COMPATIBILITY ───────────────────────────────────────────────────

  @Get('vehicles/:vehicleId/products')
  @ApiTags('Vehicles')
  @ApiOperation({ summary: 'Avtomobilga mos mahsulotlar', description: 'Mos keluvchi zapchastlar (ZZone search uchun)' })
  @ApiParam({ name: 'vehicleId', description: 'Vehicle UUID' })
  @ApiQuery({ name: 'sellerId', required: false, description: 'Tenant ID (optional filter)' })
  @ApiResponse({ status: 200, description: 'Mos mahsulotlar' })
  async getProductsByVehicle(
    @Headers('x-api-key') key: string,
    @Param('vehicleId') vehicleId: string,
    @Query('sellerId') sellerId?: string,
  ) {
    this.validateKey(key);
    const products = await this.service.getProductsByVehicle(vehicleId, sellerId);
    return { success: true, data: products };
  }

  @Get('products/:productId/vehicles')
  @ApiTags('Vehicles')
  @ApiOperation({ summary: 'Mahsulotga mos avtomobillar', description: 'Bu zapchast qaysi mashinalarga mos' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Mos avtomobillar' })
  async getProductVehicles(
    @Headers('x-api-key') key: string,
    @Param('productId') productId: string,
  ) {
    this.validateKey(key);
    const vehicles = await this.service.getProductVehicles(productId);
    return { success: true, data: vehicles };
  }

  @Post('products/:productId/vehicles')
  @ApiTags('Vehicles')
  @ApiOperation({ summary: 'Moslik qo\'shish', description: 'Mahsulotga avtomobil mosligi qo\'shish' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({ status: 201, description: 'Moslik yaratildi' })
  async addCompatibility(
    @Headers('x-api-key') key: string,
    @Param('productId') productId: string,
    @Body() body: { vehicleId: string; notes?: string },
  ) {
    this.validateKey(key);
    const compat = await this.service.addCompatibility(productId, body.vehicleId, body.notes);
    return { success: true, data: compat };
  }

  @Delete('products/:productId/vehicles/:vehicleId')
  @ApiTags('Vehicles')
  @ApiOperation({ summary: 'Moslikni o\'chirish', description: 'Mahsulot-avtomobil mosligini olib tashlash' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiParam({ name: 'vehicleId', description: 'Vehicle UUID' })
  @ApiResponse({ status: 200, description: 'Moslik o\'chirildi' })
  async removeCompatibility(
    @Headers('x-api-key') key: string,
    @Param('productId') productId: string,
    @Param('vehicleId') vehicleId: string,
  ) {
    this.validateKey(key);
    const result = await this.service.removeCompatibility(productId, vehicleId);
    return { success: true, data: result };
  }

  // ─── AUTH HELPER ─────────────────────────────────────────────────────

  private validateKey(key: string): void {
    if (!key || key !== this.apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }
  }
}
