import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VehicleService {
  private readonly logger = new Logger(VehicleService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getVehicles(filters: { brand?: string; model?: string; year?: number }) {
    const where: Record<string, unknown> = {};
    if (filters.brand) where.brand = { contains: filters.brand, mode: 'insensitive' };
    if (filters.model) where.model = { contains: filters.model, mode: 'insensitive' };
    if (filters.year) {
      where.yearFrom = { lte: filters.year };
      where.OR = [{ yearTo: { gte: filters.year } }, { yearTo: null }];
    }

    const vehicles = await this.prisma.vehicle.findMany({
      where,
      take: 100,
      orderBy: [{ brand: 'asc' }, { model: 'asc' }, { yearFrom: 'desc' }],
    });

    return vehicles.map((v) => ({
      id: v.id,
      brand: v.brand,
      model: v.model,
      yearFrom: v.yearFrom,
      yearTo: v.yearTo,
      bodyType: v.bodyType,
    }));
  }

  async getVehicleBrands() {
    const brands = await this.prisma.vehicle.findMany({
      distinct: ['brand'],
      select: { brand: true },
      orderBy: { brand: 'asc' },
    });
    return brands.map((b) => b.brand);
  }

  async createVehicle(data: {
    brand: string;
    model: string;
    yearFrom: number;
    yearTo?: number;
    bodyType?: string;
  }) {
    const vehicle = await this.prisma.vehicle.create({ data });
    this.logger.log(`Vehicle created: ${vehicle.brand} ${vehicle.model} ${vehicle.yearFrom}`);
    return vehicle;
  }

  async getProductsByVehicle(vehicleId: string, sellerId?: string) {
    const where: Record<string, unknown> = { vehicleId };

    const compats = await this.prisma.productVehicleCompatibility.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            tenantId: true,
            name: true,
            sku: true,
            sellPrice: true,
            imageUrl: true,
            isActive: true,
            zzoneVisible: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    return compats
      .filter((c) => c.product.isActive && c.product.zzoneVisible)
      .filter((c) => !sellerId || c.product.tenantId === sellerId)
      .map((c) => ({
        id: c.product.id,
        sellerId: c.product.tenantId,
        name: c.product.name,
        sku: c.product.sku,
        price: Number(c.product.sellPrice),
        imageUrl: c.product.imageUrl,
        category: c.product.category?.name ?? null,
        compatibilityNotes: c.notes,
      }));
  }

  async getProductVehicles(productId: string) {
    const compats = await this.prisma.productVehicleCompatibility.findMany({
      where: { productId },
      include: {
        vehicle: {
          select: { id: true, brand: true, model: true, yearFrom: true, yearTo: true, bodyType: true },
        },
      },
    });

    return compats.map((c) => ({
      id: c.vehicle.id,
      brand: c.vehicle.brand,
      model: c.vehicle.model,
      yearFrom: c.vehicle.yearFrom,
      yearTo: c.vehicle.yearTo,
      bodyType: c.vehicle.bodyType,
      notes: c.notes,
    }));
  }

  async addCompatibility(productId: string, vehicleId: string, notes?: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const compat = await this.prisma.productVehicleCompatibility.create({
      data: { productId, vehicleId, notes },
      include: {
        vehicle: { select: { brand: true, model: true, yearFrom: true } },
      },
    });

    this.logger.log(`Compatibility added: product ${productId} ↔ ${compat.vehicle.brand} ${compat.vehicle.model}`);
    return compat;
  }

  async removeCompatibility(productId: string, vehicleId: string) {
    await this.prisma.productVehicleCompatibility.delete({
      where: { productId_vehicleId: { productId, vehicleId } },
    });
    this.logger.log(`Compatibility removed: product ${productId} ↔ vehicle ${vehicleId}`);
    return { success: true };
  }
}
