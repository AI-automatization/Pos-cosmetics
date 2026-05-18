/**
 * Unit tests — LedgerService (double-entry journal)
 * Critical financial module — immutability + balance validation
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InternalServerErrorException } from '@nestjs/common';
import { LedgerService } from '../ledger.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JournalRefType, LedgerAccount, LedgerLineType } from '@prisma/client';

const mockPrisma = {
  journalEntry: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  return: {
    findFirst: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

describe('LedgerService', () => {
  let service: LedgerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LedgerService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<LedgerService>(LedgerService);
    jest.clearAllMocks();
  });

  describe('recordEntry', () => {
    const validInput = {
      tenantId: 'tenant-1',
      referenceType: JournalRefType.SALE,
      referenceId: 'order-123',
      description: 'Test sale',
      lines: [
        { account: LedgerAccount.ACCOUNTS_RECEIVABLE, type: LedgerLineType.DEBIT, amount: 50000 },
        { account: LedgerAccount.REVENUE, type: LedgerLineType.CREDIT, amount: 50000 },
      ],
    };

    it('creates balanced journal entry', async () => {
      mockPrisma.journalEntry.create.mockResolvedValue({ id: 'je-1' });

      await service.recordEntry(validInput);

      expect(mockPrisma.journalEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          referenceType: JournalRefType.SALE,
          referenceId: 'order-123',
          lines: {
            create: expect.arrayContaining([
              expect.objectContaining({ account: LedgerAccount.ACCOUNTS_RECEIVABLE, type: LedgerLineType.DEBIT, amount: 50000 }),
              expect.objectContaining({ account: LedgerAccount.REVENUE, type: LedgerLineType.CREDIT, amount: 50000 }),
            ]),
          },
        }),
      });
    });

    it('rejects unbalanced entry (debit != credit)', async () => {
      const unbalanced = {
        ...validInput,
        lines: [
          { account: LedgerAccount.ACCOUNTS_RECEIVABLE, type: LedgerLineType.DEBIT, amount: 50000 },
          { account: LedgerAccount.REVENUE, type: LedgerLineType.CREDIT, amount: 30000 },
        ],
      };

      await expect(service.recordEntry(unbalanced)).rejects.toThrow(InternalServerErrorException);
      expect(mockPrisma.journalEntry.create).not.toHaveBeenCalled();
    });

    it('allows small floating point differences (< 0.001)', async () => {
      mockPrisma.journalEntry.create.mockResolvedValue({ id: 'je-2' });

      const almostBalanced = {
        ...validInput,
        lines: [
          { account: LedgerAccount.CASH, type: LedgerLineType.DEBIT, amount: 100.001 },
          { account: LedgerAccount.REVENUE, type: LedgerLineType.CREDIT, amount: 100.0015 },
        ],
      };

      await service.recordEntry(almostBalanced);
      expect(mockPrisma.journalEntry.create).toHaveBeenCalled();
    });
  });

  describe('handleSaleCreated', () => {
    it('creates AR debit + Revenue credit on sale', async () => {
      mockPrisma.journalEntry.create.mockResolvedValue({ id: 'je-3' });

      await service.handleSaleCreated({
        tenantId: 'tenant-1',
        orderId: 'order-456',
        total: 120000,
      });

      expect(mockPrisma.journalEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          referenceType: JournalRefType.SALE,
          referenceId: 'order-456',
        }),
      });
    });

    it('does not throw if ledger fails (logs error instead)', async () => {
      mockPrisma.journalEntry.create.mockRejectedValue(new Error('DB down'));

      // Should not throw — sale must not be blocked by ledger failure
      await expect(
        service.handleSaleCreated({
          tenantId: 'tenant-1',
          orderId: 'order-789',
          total: 50000,
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('handlePaymentSettled', () => {
    it('creates Cash debit + AR credit on payment', async () => {
      mockPrisma.journalEntry.create.mockResolvedValue({ id: 'je-4' });

      await service.handlePaymentSettled({
        tenantId: 'tenant-1',
        intentId: 'pi-100',
        orderId: 'order-100',
        method: 'CASH',
        amount: 75000,
      });

      expect(mockPrisma.journalEntry.create).toHaveBeenCalled();
    });

    it('skips DEBT payments (nasiya — AR already debited)', async () => {
      await service.handlePaymentSettled({
        tenantId: 'tenant-1',
        intentId: 'pi-200',
        orderId: 'order-200',
        method: 'DEBT',
        amount: 50000,
      });

      expect(mockPrisma.journalEntry.create).not.toHaveBeenCalled();
    });

    it('handles Prisma Decimal amount', async () => {
      mockPrisma.journalEntry.create.mockResolvedValue({ id: 'je-5' });

      // Prisma Decimal simulated as object with toString
      const decimalAmount = { toNumber: () => 99000 } as unknown as number;

      await service.handlePaymentSettled({
        tenantId: 'tenant-1',
        intentId: 'pi-300',
        orderId: 'order-300',
        method: 'CARD',
        amount: decimalAmount,
      });

      expect(mockPrisma.journalEntry.create).toHaveBeenCalled();
    });
  });

  describe('handleReturnApproved', () => {
    it('creates reversal entry on return', async () => {
      mockPrisma.return.findFirst.mockResolvedValue({ total: 25000, tenantId: 'tenant-1' });
      mockPrisma.journalEntry.create.mockResolvedValue({ id: 'je-6' });

      await service.handleReturnApproved({
        tenantId: 'tenant-1',
        returnId: 'ret-1',
        items: [{ productId: 'p-1', quantity: 1, amount: 25000 }],
      });

      expect(mockPrisma.journalEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          referenceType: JournalRefType.RETURN,
        }),
      });
    });

    it('skips if return not found in DB', async () => {
      mockPrisma.return.findFirst.mockResolvedValue(null);

      await service.handleReturnApproved({
        tenantId: 'tenant-1',
        returnId: 'ret-nonexistent',
        items: [],
      });

      expect(mockPrisma.journalEntry.create).not.toHaveBeenCalled();
    });
  });

  describe('getAccountBalance', () => {
    it('returns numeric balance from raw query', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ balance: 150000 }]);

      const balance = await service.getAccountBalance('tenant-1', LedgerAccount.CASH);

      expect(balance).toBe(150000);
    });

    it('returns 0 if no entries', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ balance: null }]);

      const balance = await service.getAccountBalance('tenant-1', LedgerAccount.REVENUE);

      expect(balance).toBe(0);
    });
  });
});
