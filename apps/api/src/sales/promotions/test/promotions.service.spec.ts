/**
 * Unit tests — PromotionsService
 * Covers: getPromotions, createPromotion, updatePromotion, deletePromotion, applyPromotions
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PromotionsService } from '../promotions.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { PromotionType } from '@prisma/client';
import { CreatePromotionDto } from '../dto/promotion.dto';

// ─── Mock ──────────────────────────────────────────────────────────────────────

const mockPrisma = {
  promotion: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const TENANT = 'tenant-1';

const makePromotion = (
  id: string,
  type: PromotionType,
  rules: Record<string, unknown>,
  overrides: Record<string, unknown> = {},
) => ({
  id,
  tenantId: TENANT,
  name: `Promo ${id}`,
  type,
  rules,
  isActive: true,
  validFrom: new Date('2026-01-01'),
  validTo: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

const makeCreateDto = (
  type: PromotionType,
  rules: Record<string, unknown>,
  overrides: Partial<CreatePromotionDto> = {},
): CreatePromotionDto => ({
  name: 'Test Promo',
  type,
  rules,
  validFrom: '2026-01-01T00:00:00.000Z',
  isActive: true,
  ...overrides,
});

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('PromotionsService', () => {
  let service: PromotionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PromotionsService>(PromotionsService);
    jest.clearAllMocks();
  });

  // ─── getPromotions ──────────────────────────────────────────────────────────

  describe('getPromotions', () => {
    it('returns all promotions for tenant without activeOnly filter', async () => {
      const promos = [
        makePromotion('p-1', PromotionType.PERCENT, { percent: 10 }),
        makePromotion('p-2', PromotionType.FIXED, { amount: 5000 }, { isActive: false }),
      ];
      mockPrisma.promotion.findMany.mockResolvedValue(promos);

      const result = await service.getPromotions(TENANT);

      expect(mockPrisma.promotion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: TENANT } }),
      );
      expect(result).toHaveLength(2);
    });

    it('applies active+validity filter when activeOnly=true', async () => {
      const promos = [makePromotion('p-1', PromotionType.PERCENT, { percent: 5 })];
      mockPrisma.promotion.findMany.mockResolvedValue(promos);

      const result = await service.getPromotions(TENANT, true);

      expect(mockPrisma.promotion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: TENANT,
            isActive: true,
            validFrom: expect.objectContaining({ lte: expect.any(Date) }),
          }),
        }),
      );
      expect(result).toHaveLength(1);
    });
  });

  // ─── createPromotion ────────────────────────────────────────────────────────

  describe('createPromotion', () => {
    it('creates promotion with tenantId from parameter', async () => {
      const dto = makeCreateDto(PromotionType.PERCENT, { percent: 10 });
      const created = makePromotion('p-new', PromotionType.PERCENT, { percent: 10 });
      mockPrisma.promotion.create.mockResolvedValue(created);

      const result = await service.createPromotion(TENANT, dto);

      expect(mockPrisma.promotion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: TENANT,
            name: dto.name,
            type: PromotionType.PERCENT,
          }),
        }),
      );
      expect(result.tenantId).toBe(TENANT);
    });

    it('defaults isActive to true when not provided in DTO', async () => {
      const dto = makeCreateDto(PromotionType.FIXED, { amount: 3000 }, { isActive: undefined });
      const created = makePromotion('p-new', PromotionType.FIXED, { amount: 3000 });
      mockPrisma.promotion.create.mockResolvedValue(created);

      await service.createPromotion(TENANT, dto);

      expect(mockPrisma.promotion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isActive: true }),
        }),
      );
    });
  });

  // ─── updatePromotion ────────────────────────────────────────────────────────

  describe('updatePromotion', () => {
    it('uses compound where {id, tenantId} to prevent cross-tenant update', async () => {
      const existing = makePromotion('p-1', PromotionType.PERCENT, { percent: 5 });
      const updated = { ...existing, name: 'Updated Name' };
      mockPrisma.promotion.findFirst.mockResolvedValue(existing);
      mockPrisma.promotion.update.mockResolvedValue(updated);

      const result = await service.updatePromotion(TENANT, 'p-1', { name: 'Updated Name' });

      // SECURITY: update must use compound where to prevent TOCTOU tenant bypass
      expect(mockPrisma.promotion.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'p-1', tenantId: TENANT },
        }),
      );
      expect(result.name).toBe('Updated Name');
    });

    it('throws NotFoundException when promotion does not exist in tenant', async () => {
      mockPrisma.promotion.findFirst.mockResolvedValue(null);

      await expect(
        service.updatePromotion(TENANT, 'nonexistent', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.promotion.update).not.toHaveBeenCalled();
    });
  });

  // ─── deletePromotion ────────────────────────────────────────────────────────

  describe('deletePromotion', () => {
    it('uses compound where {id, tenantId} for security', async () => {
      const existing = makePromotion('p-1', PromotionType.FIXED, { amount: 2000 });
      mockPrisma.promotion.findFirst.mockResolvedValue(existing);
      mockPrisma.promotion.delete.mockResolvedValue(existing);

      const result = await service.deletePromotion(TENANT, 'p-1');

      // SECURITY: delete must use compound where to prevent tenant bypass
      expect(mockPrisma.promotion.delete).toHaveBeenCalledWith({
        where: { id: 'p-1', tenantId: TENANT },
      });
      expect(result).toEqual({ success: true });
    });

    it('throws NotFoundException when promotion not found', async () => {
      mockPrisma.promotion.findFirst.mockResolvedValue(null);

      await expect(service.deletePromotion(TENANT, 'ghost-id')).rejects.toThrow(NotFoundException);

      expect(mockPrisma.promotion.delete).not.toHaveBeenCalled();
    });
  });

  // ─── applyPromotions ────────────────────────────────────────────────────────

  describe('applyPromotions', () => {
    const cartItems = [
      { productId: 'prod-1', quantity: 2, unitPrice: 30000 },
      { productId: 'prod-2', quantity: 1, unitPrice: 20000 },
    ];

    it('PERCENT type: calculates percentage discount on subtotal', async () => {
      mockPrisma.promotion.findMany.mockResolvedValue([
        makePromotion('p-1', PromotionType.PERCENT, { percent: 10 }),
      ]);

      const result = await service.applyPromotions(TENANT, {
        subtotal: 80000,
        items: cartItems,
      });

      expect(result.discountAmount).toBe(8000); // 10% of 80000
      expect(result.appliedPromotions).toHaveLength(1);
      expect(result.appliedPromotions[0].discount).toBe(8000);
    });

    it('FIXED type: applies flat amount discount', async () => {
      mockPrisma.promotion.findMany.mockResolvedValue([
        makePromotion('p-1', PromotionType.FIXED, { amount: 5000 }),
      ]);

      const result = await service.applyPromotions(TENANT, {
        subtotal: 80000,
        items: cartItems,
      });

      expect(result.discountAmount).toBe(5000);
    });

    it('BUY_X_GET_Y type: gives cheapest items free', async () => {
      // Buy 2 Get 1 free — 3 items total: 2+1=3 → 1 set → cheapest item free
      const promoItems = [
        { productId: 'prod-1', quantity: 2, unitPrice: 30000 },
        { productId: 'prod-2', quantity: 1, unitPrice: 20000 },
      ];
      // totalQty=3, buyQty=2, getQty=1 → freeSets=1 → cheapest item (20000) is free
      mockPrisma.promotion.findMany.mockResolvedValue([
        makePromotion('p-1', PromotionType.BUY_X_GET_Y, { buyQty: 2, getQty: 1 }),
      ]);

      const result = await service.applyPromotions(TENANT, {
        subtotal: 80000,
        items: promoItems,
      });

      expect(result.discountAmount).toBe(20000); // cheapest item: prod-2 at 20000
      expect(result.appliedPromotions).toHaveLength(1);
    });

    it('BUNDLE type: applies discount only when all bundle products are in cart', async () => {
      // Bundle: prod-1 + prod-2 required → 20% discount on bundle total
      mockPrisma.promotion.findMany.mockResolvedValue([
        makePromotion('p-1', PromotionType.BUNDLE, {
          productIds: ['prod-1', 'prod-2'],
          discount: 20,
        }),
      ]);

      const result = await service.applyPromotions(TENANT, {
        subtotal: 80000,
        items: cartItems,
      });

      // bundleTotal = 2*30000 + 1*20000 = 80000 → 20% = 16000
      expect(result.discountAmount).toBe(16000);
    });

    it('BUNDLE type: no discount when not all bundle products are present', async () => {
      // Bundle requires prod-3 which is not in cart
      mockPrisma.promotion.findMany.mockResolvedValue([
        makePromotion('p-1', PromotionType.BUNDLE, {
          productIds: ['prod-1', 'prod-3'],
          discount: 20,
        }),
      ]);

      const result = await service.applyPromotions(TENANT, {
        subtotal: 80000,
        items: cartItems,
      });

      expect(result.discountAmount).toBe(0);
      expect(result.appliedPromotions).toHaveLength(0);
    });

    it('returns zero discount when no active promotions exist', async () => {
      mockPrisma.promotion.findMany.mockResolvedValue([]);

      const result = await service.applyPromotions(TENANT, {
        subtotal: 50000,
        items: cartItems,
      });

      expect(result.discountAmount).toBe(0);
      expect(result.appliedPromotions).toEqual([]);
    });
  });
});
