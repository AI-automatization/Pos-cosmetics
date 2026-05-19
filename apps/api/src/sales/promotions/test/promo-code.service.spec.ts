/**
 * Unit tests — PromoCodeService
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PromoCodeService } from '../promo-code.service';
import { PrismaService } from '../../../prisma/prisma.service';

const mockPrisma = {
  promoCode: {
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('PromoCodeService', () => {
  let service: PromoCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromoCodeService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<PromoCodeService>(PromoCodeService);
    jest.clearAllMocks();
  });

  describe('validateCode', () => {
    const tenantId = 'tenant-1';

    it('returns invalid if code not found', async () => {
      mockPrisma.promoCode.findUnique.mockResolvedValue(null);
      const result = await service.validateCode(tenantId, { code: 'FAKE-CODE', purchaseAmount: 100000 });
      expect(result.valid).toBe(false);
    });

    it('returns invalid if code is inactive', async () => {
      mockPrisma.promoCode.findUnique.mockResolvedValue({
        id: 'pc-1', isActive: false, code: 'RAOS-TEST',
        validFrom: new Date('2020-01-01'), validTo: new Date('2030-01-01'),
        usageLimit: 0, usageCount: 0, minPurchase: 0, type: 'PERCENT', value: 10,
      });
      const result = await service.validateCode(tenantId, { code: 'RAOS-TEST', purchaseAmount: 100000 });
      expect(result.valid).toBe(false);
    });

    it('returns invalid if usage limit exceeded', async () => {
      mockPrisma.promoCode.findUnique.mockResolvedValue({
        id: 'pc-2', isActive: true, code: 'RAOS-FULL',
        validFrom: new Date('2020-01-01'), validTo: new Date('2030-01-01'),
        usageLimit: 5, usageCount: 5, minPurchase: 0, type: 'FIXED', value: 50000,
      });
      const result = await service.validateCode(tenantId, { code: 'RAOS-FULL', purchaseAmount: 100000 });
      expect(result.valid).toBe(false);
    });

    it('returns invalid if purchase below minimum', async () => {
      mockPrisma.promoCode.findUnique.mockResolvedValue({
        id: 'pc-3', isActive: true, code: 'RAOS-MIN',
        validFrom: new Date('2020-01-01'), validTo: new Date('2030-01-01'),
        usageLimit: 0, usageCount: 0, minPurchase: 200000, type: 'PERCENT', value: 10,
      });
      const result = await service.validateCode(tenantId, { code: 'RAOS-MIN', purchaseAmount: 100000 });
      expect(result.valid).toBe(false);
    });

    it('returns valid with PERCENT discount', async () => {
      mockPrisma.promoCode.findUnique.mockResolvedValue({
        id: 'pc-4', isActive: true, code: 'RAOS-10',
        validFrom: new Date('2020-01-01'), validTo: new Date('2030-01-01'),
        usageLimit: 0, usageCount: 0, minPurchase: 0, type: 'PERCENT', value: 10,
      });
      const result = await service.validateCode(tenantId, { code: 'RAOS-10', purchaseAmount: 100000 });
      expect(result.valid).toBe(true);
      expect(result.type).toBe('PERCENT');
      expect(result.discount).toBe(10000); // 10% of 100000
    });

    it('returns valid with FIXED discount', async () => {
      mockPrisma.promoCode.findUnique.mockResolvedValue({
        id: 'pc-5', isActive: true, code: 'RAOS-50K',
        validFrom: new Date('2020-01-01'), validTo: new Date('2030-01-01'),
        usageLimit: 100, usageCount: 3, minPurchase: 0, type: 'FIXED', value: 50000,
      });
      const result = await service.validateCode(tenantId, { code: 'RAOS-50K', purchaseAmount: 200000 });
      expect(result.valid).toBe(true);
      expect(result.type).toBe('FIXED');
      expect(result.discount).toBe(50000);
    });
  });

  describe('createCode', () => {
    it('auto-generates code if not provided', async () => {
      mockPrisma.promoCode.findUnique.mockResolvedValue(null);
      mockPrisma.promoCode.create.mockResolvedValue({ id: 'pc-new', code: 'RAOS-ABCD' });

      await service.createCode('tenant-1', {
        type: 'PERCENT',
        value: 15,
        validFrom: '2026-01-01',
      } as never);

      expect(mockPrisma.promoCode.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-1',
            type: 'PERCENT',
          }),
        }),
      );
    });

    it('throws ConflictException on duplicate code', async () => {
      mockPrisma.promoCode.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.createCode('tenant-1', {
          code: 'RAOS-DUP',
          type: 'FIXED',
          value: 10000,
          validFrom: '2026-01-01',
        } as never),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteCode', () => {
    it('soft-deletes by setting isActive=false', async () => {
      mockPrisma.promoCode.findFirst.mockResolvedValue({ id: 'pc-del', tenantId: 'tenant-1' });
      mockPrisma.promoCode.update.mockResolvedValue({ id: 'pc-del', isActive: false });

      await service.deleteCode('tenant-1', 'pc-del');

      expect(mockPrisma.promoCode.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'pc-del', tenantId: 'tenant-1' }),
          data: { isActive: false },
        }),
      );
    });

    it('throws NotFoundException if code not found', async () => {
      mockPrisma.promoCode.findFirst.mockResolvedValue(null);
      await expect(service.deleteCode('tenant-1', 'fake-id')).rejects.toThrow(NotFoundException);
    });
  });
});
