/**
 * T-126: Unit tests — PriceHistoryService
 */
import { Test, TestingModule } from '@nestjs/testing';
import { PriceHistoryService } from '../price-history.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  priceChange: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
};

describe('PriceHistoryService', () => {
  let service: PriceHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceHistoryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<PriceHistoryService>(PriceHistoryService);
    jest.clearAllMocks();
  });

  describe('getHistory', () => {
    it('returns price change history for a product', async () => {
      const createdAt = new Date('2026-01-01');
      mockPrisma.priceChange.findMany.mockResolvedValue([
        {
          id: 'pc-1',
          field: 'sellPrice',
          oldValue: 50000,
          newValue: 55000,
          reason: 'market adjustment',
          userId: 'user-1',
          createdAt,
        },
      ]);
      const result = await service.getHistory('tenant-1', 'product-1');
      expect(result).toHaveLength(1);
      expect(result[0].oldValue).toBe(50000);
      expect(result[0].newValue).toBe(55000);
      expect(result[0].field).toBe('sellPrice');
    });

    it('returns empty array when no history', async () => {
      mockPrisma.priceChange.findMany.mockResolvedValue([]);
      const result = await service.getHistory('tenant-1', 'product-1');
      expect(result).toEqual([]);
    });
  });

  describe('record', () => {
    it('creates a price change record', async () => {
      const params = {
        tenantId: 'tenant-1',
        productId: 'product-1',
        userId: 'user-1',
        field: 'sellPrice',
        oldValue: 50000,
        newValue: 55000,
        reason: 'test',
      };
      mockPrisma.priceChange.create.mockResolvedValue({ id: 'pc-new', ...params });
      await service.record(params);
      expect(mockPrisma.priceChange.create).toHaveBeenCalledWith({
        data: {
          tenantId: 'tenant-1',
          productId: 'product-1',
          userId: 'user-1',
          field: 'sellPrice',
          oldValue: 50000,
          newValue: 55000,
          reason: 'test',
        },
      });
    });
  });
});
