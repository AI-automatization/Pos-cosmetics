import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  LinkProductSupplierDto,
} from './dto';

@Injectable()
export class CatalogSupplierHelper {
  private readonly logger = new Logger(CatalogSupplierHelper.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── SUPPLIERS ────────────────────────────────────────────────

  async getSuppliers(tenantId: string, isActive: boolean = true) {
    return this.prisma.supplier.findMany({
      where: { tenantId, isActive },
      orderBy: { name: 'asc' },
    });
  }

  async getSupplierById(tenantId: string, id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, tenantId },
      include: {
        productSuppliers: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                barcode: true,
                sellPrice: true,
                isActive: true,
              },
            },
          },
        },
      },
    });
    if (!supplier) throw new NotFoundException(`Supplier ${id} not found`);
    return supplier;
  }

  async createSupplier(tenantId: string, dto: CreateSupplierDto) {
    const supplier = await this.prisma.supplier.create({
      data: {
        tenantId,
        name: dto.name,
        phone: dto.phone,
        company: dto.company,
        address: dto.address,
      },
    });
    this.logger.log(`Supplier created: ${supplier.id}`, { tenantId });
    return supplier;
  }

  async updateSupplier(tenantId: string, id: string, dto: UpdateSupplierDto) {
    await this.findSupplierOrFail(tenantId, id);
    const updated = await this.prisma.supplier.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.company !== undefined && { company: dto.company }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
    this.logger.log(`Supplier updated: ${id}`, { tenantId });
    return updated;
  }

  async deactivateSupplier(tenantId: string, id: string) {
    await this.findSupplierOrFail(tenantId, id);
    await this.prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
    this.logger.log(`Supplier deactivated: ${id}`, { tenantId });
    return { success: true };
  }

  async linkProductToSupplier(
    tenantId: string,
    supplierId: string,
    dto: LinkProductSupplierDto,
    getProductById: (tenantId: string, id: string) => Promise<unknown>,
  ) {
    await this.findSupplierOrFail(tenantId, supplierId);
    await getProductById(tenantId, dto.productId);

    if (dto.isDefault) {
      await this.prisma.productSupplier.updateMany({
        where: { productId: dto.productId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const link = await this.prisma.productSupplier.upsert({
      where: {
        productId_supplierId: {
          productId: dto.productId,
          supplierId,
        },
      },
      create: {
        productId: dto.productId,
        supplierId,
        supplyPrice: dto.supplyPrice,
        isDefault: dto.isDefault ?? false,
      },
      update: {
        supplyPrice: dto.supplyPrice,
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      },
    });
    this.logger.log(
      `Product ${dto.productId} linked to supplier ${supplierId}`,
      { tenantId },
    );
    return link;
  }

  async unlinkProductFromSupplier(
    tenantId: string,
    supplierId: string,
    productId: string,
  ) {
    await this.findSupplierOrFail(tenantId, supplierId);
    const link = await this.prisma.productSupplier.findUnique({
      where: { productId_supplierId: { productId, supplierId } },
    });
    if (!link) {
      throw new NotFoundException(
        `Product ${productId} is not linked to supplier ${supplierId}`,
      );
    }
    await this.prisma.productSupplier.delete({
      where: { productId_supplierId: { productId, supplierId } },
    });
    return { success: true };
  }

  async findSupplierOrFail(tenantId: string, id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, tenantId },
    });
    if (!supplier) throw new NotFoundException(`Supplier ${id} not found`);
    return supplier;
  }
}
