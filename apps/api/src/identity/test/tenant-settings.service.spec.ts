/**
 * T-126: Unit tests — TenantSettingsService
 */
import { Test, TestingModule } from '@nestjs/testing';
import { TenantSettingsService } from '../tenant-settings.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  tenantSettings: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
};

describe('TenantSettingsService', () => {
  let service: TenantSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantSettingsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<TenantSettingsService>(TenantSettingsService);
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('returns defaults when no record exists', async () => {
      mockPrisma.tenantSettings.findUnique.mockResolvedValue(null);
      const result = await service.getSettings('tenant-1');
      expect(result.currency).toBe('UZS');
      expect(result.language).toBe('uz');
      expect(result.timezone).toBe('Asia/Tashkent');
      expect(result.lowStockThreshold).toBe(5);
    });

    it('returns saved settings', async () => {
      mockPrisma.tenantSettings.findUnique.mockResolvedValue({
        currency: 'USD',
        language: 'en',
        timezone: 'UTC',
        taxRate: 12,
        receiptHeader: 'Test Shop',
        receiptFooter: null,
        lowStockThreshold: 10,
        expiryAlertDays: 60,
        extra: { key: 'value' },
      });
      const result = await service.getSettings('tenant-1');
      expect(result.currency).toBe('USD');
      expect(result.taxRate).toBe(12);
      expect(result.receiptHeader).toBe('Test Shop');
    });
  });

  describe('updateSettings', () => {
    it('upserts settings and returns result', async () => {
      const saved = {
        currency: 'UZS',
        language: 'uz',
        timezone: 'Asia/Tashkent',
        taxRate: 15,
        receiptHeader: 'My Shop',
        receiptFooter: null,
        lowStockThreshold: 3,
        expiryAlertDays: 30,
        extra: {},
      };
      mockPrisma.tenantSettings.upsert.mockResolvedValue(saved);
      const result = await service.updateSettings('tenant-1', {
        receiptHeader: 'My Shop',
        lowStockThreshold: 3,
        taxRate: 15,
      });
      expect(result.receiptHeader).toBe('My Shop');
      expect(result.taxRate).toBe(15);
      expect(mockPrisma.tenantSettings.upsert).toHaveBeenCalledTimes(1);
    });
  });
});
