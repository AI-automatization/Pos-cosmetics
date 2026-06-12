/**
 * Security tests — WarehouseInvoiceService tenant isolation (#51)
 * Cross-tenant reference injection via supplierId / productId in request body.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WarehouseInvoiceService } from '../warehouse-invoice.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../common/cache/cache.service';

const mockPrisma = {
  warehouseInvoice: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
  supplier: { findFirst: jest.fn(), create: jest.fn() },
  product: { count: jest.fn(), findMany: jest.fn() },
  warehouse: { findFirst: jest.fn(), create: jest.fn() },
  stockMovement: { create: jest.fn() },
  $transaction: jest.fn(),
};

const mockCache = {
  invalidatePattern: jest.fn(),
  key: CacheService.key,
};

const TENANT = 'tenant-1';
const USER = 'user-1';

describe('WarehouseInvoiceService — tenant isolation (#51)', () => {
  let service: WarehouseInvoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WarehouseInvoiceService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CacheService, useValue: mockCache },
      ],
    }).compile();
    service = module.get(WarehouseInvoiceService);
    jest.clearAllMocks();
    mockPrisma.warehouse.findFirst.mockResolvedValue({ id: 'wh-1', tenantId: TENANT });
  });

  describe('createInvoice', () => {
    it('rejects a supplierId that belongs to another tenant', async () => {
      mockPrisma.supplier.findFirst.mockResolvedValue(null); // foreign supplier → not found for this tenant
      const dto = {
        supplierId: 'foreign-supplier',
        items: [{ productId: 'prod-1', quantity: 1, purchasePrice: 100, warehouseId: 'wh-1' }],
      };

      await expect(service.createInvoice(TENANT, USER, dto as never)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects productIds not owned by the tenant', async () => {
      mockPrisma.supplier.findFirst.mockResolvedValue({ id: 'sup-1' });
      mockPrisma.product.count.mockResolvedValue(1); // only 1 of 2 productIds belong to tenant
      const dto = {
        supplierId: 'sup-1',
        items: [
          { productId: 'mine', quantity: 1, purchasePrice: 100, warehouseId: 'wh-1' },
          { productId: 'foreign', quantity: 1, purchasePrice: 100, warehouseId: 'wh-1' },
        ],
      };

      await expect(service.createInvoice(TENANT, USER, dto as never)).rejects.toThrow(BadRequestException);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('updateInvoiceMeta', () => {
    it('rejects reassigning invoice to a foreign supplier', async () => {
      mockPrisma.warehouseInvoice.findFirst.mockResolvedValue({ id: 'inv-1', tenantId: TENANT });
      mockPrisma.supplier.findFirst.mockResolvedValue(null); // foreign supplier

      await expect(
        service.updateInvoiceMeta(TENANT, 'inv-1', { supplierId: 'foreign-supplier' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.warehouseInvoice.update).not.toHaveBeenCalled();
    });

    it('scopes the update by tenantId', async () => {
      mockPrisma.warehouseInvoice.findFirst.mockResolvedValue({ id: 'inv-1', tenantId: TENANT });
      mockPrisma.warehouseInvoice.update.mockResolvedValue({ id: 'inv-1' });

      await service.updateInvoiceMeta(TENANT, 'inv-1', { note: 'updated' });

      expect(mockPrisma.warehouseInvoice.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'inv-1', tenantId: TENANT } }),
      );
    });
  });
});
