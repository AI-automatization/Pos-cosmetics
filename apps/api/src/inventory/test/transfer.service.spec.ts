/**
 * Unit tests — TransferService
 * Covers: requestTransfer, approveTransfer, shipTransfer, receiveTransfer, cancelTransfer, findTransfer
 */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TransferService } from '../transfer.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TransferStatus } from '@prisma/client';

// ─── Mock ──────────────────────────────────────────────────────────────────────

const mockPrisma = {
  branch: {
    findFirst: jest.fn(),
  },
  stockTransfer: {
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  warehouse: {
    findMany: jest.fn(),
  },
  stockMovement: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const TENANT = 'tenant-1';
const USER_ID = 'user-1';
const BRANCH_A = 'branch-a';
const BRANCH_B = 'branch-b';

const makeTransfer = (
  id: string,
  status: TransferStatus,
  overrides: Record<string, unknown> = {},
) => ({
  id,
  tenantId: TENANT,
  fromBranchId: BRANCH_A,
  toBranchId: BRANCH_B,
  requestedById: USER_ID,
  approvedById: null,
  status,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [
    { id: 'ti-1', transferId: id, productId: 'prod-1', warehouseId: null, quantity: 10 },
  ],
  ...overrides,
});

const makeCreateTransferDto = (overrides: Record<string, unknown> = {}) => ({
  fromBranchId: BRANCH_A,
  toBranchId: BRANCH_B,
  items: [{ productId: 'prod-1', quantity: 10 }],
  notes: 'Test transfer',
  ...overrides,
});

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('TransferService', () => {
  let service: TransferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TransferService>(TransferService);
    jest.clearAllMocks();
  });

  // ─── requestTransfer ────────────────────────────────────────────────────────

  describe('requestTransfer', () => {
    it('creates transfer with REQUESTED status', async () => {
      const dto = makeCreateTransferDto();
      const branch = { id: BRANCH_A, name: 'Branch A' };
      const expectedTransfer = makeTransfer('tr-1', TransferStatus.REQUESTED);

      mockPrisma.branch.findFirst
        .mockResolvedValueOnce(branch) // fromBranch
        .mockResolvedValueOnce({ id: BRANCH_B, name: 'Branch B' }); // toBranch
      mockPrisma.stockTransfer.create.mockResolvedValue(expectedTransfer);

      const result = await service.requestTransfer(TENANT, USER_ID, dto as Parameters<typeof service.requestTransfer>[2]);

      expect(mockPrisma.stockTransfer.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: TENANT,
            fromBranchId: BRANCH_A,
            toBranchId: BRANCH_B,
            status: 'REQUESTED',
          }),
        }),
      );
      expect(result.status).toBe(TransferStatus.REQUESTED);
    });

    it('throws BadRequestException when from and to branches are identical', async () => {
      const dto = makeCreateTransferDto({ fromBranchId: BRANCH_A, toBranchId: BRANCH_A });

      await expect(
        service.requestTransfer(TENANT, USER_ID, dto as Parameters<typeof service.requestTransfer>[2]),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrisma.stockTransfer.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when source branch does not belong to tenant', async () => {
      mockPrisma.branch.findFirst
        .mockResolvedValueOnce(null) // fromBranch not found
        .mockResolvedValueOnce({ id: BRANCH_B });

      await expect(
        service.requestTransfer(TENANT, USER_ID, makeCreateTransferDto() as Parameters<typeof service.requestTransfer>[2]),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── approveTransfer ────────────────────────────────────────────────────────

  describe('approveTransfer', () => {
    it('approves REQUESTED transfer and uses compound where {id, tenantId}', async () => {
      const transfer = makeTransfer('tr-1', TransferStatus.REQUESTED);
      const approved = { ...transfer, status: TransferStatus.APPROVED, approvedById: USER_ID };

      mockPrisma.stockTransfer.findFirst.mockResolvedValue(transfer);
      mockPrisma.stockTransfer.update.mockResolvedValue(approved);

      const result = await service.approveTransfer(TENANT, 'tr-1', USER_ID);

      // SECURITY: update must use compound where {id, tenantId}
      expect(mockPrisma.stockTransfer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tr-1', tenantId: TENANT },
          data: expect.objectContaining({ status: 'APPROVED', approvedById: USER_ID }),
        }),
      );
      expect(result.status).toBe(TransferStatus.APPROVED);
    });

    it('rejects approval when transfer is already APPROVED (not REQUESTED)', async () => {
      const transfer = makeTransfer('tr-1', TransferStatus.APPROVED);
      mockPrisma.stockTransfer.findFirst.mockResolvedValue(transfer);

      await expect(service.approveTransfer(TENANT, 'tr-1', USER_ID)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockPrisma.stockTransfer.update).not.toHaveBeenCalled();
    });

    it('rejects approval when transfer is SHIPPED', async () => {
      const transfer = makeTransfer('tr-1', TransferStatus.SHIPPED);
      mockPrisma.stockTransfer.findFirst.mockResolvedValue(transfer);

      await expect(service.approveTransfer(TENANT, 'tr-1', USER_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects approval when transfer is RECEIVED (terminal state)', async () => {
      const transfer = makeTransfer('tr-1', TransferStatus.RECEIVED);
      mockPrisma.stockTransfer.findFirst.mockResolvedValue(transfer);

      await expect(service.approveTransfer(TENANT, 'tr-1', USER_ID)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ─── findTransfer (private — via approveTransfer) ───────────────────────────

  describe('findTransfer (via approveTransfer)', () => {
    it('throws NotFoundException when transfer does not exist', async () => {
      // findFirst returns null — transfer not found
      mockPrisma.stockTransfer.findFirst.mockResolvedValue(null);

      await expect(service.approveTransfer(TENANT, 'nonexistent-id', USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('does not expose transfers from other tenants', async () => {
      // Simulate cross-tenant isolation: findFirst returns null for wrong tenant
      mockPrisma.stockTransfer.findFirst.mockResolvedValue(null);

      await expect(service.approveTransfer('wrong-tenant', 'tr-1', USER_ID)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrisma.stockTransfer.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tr-1', tenantId: 'wrong-tenant' },
        }),
      );
    });
  });

  // ─── cancelTransfer ──────────────────────────────────────────────────────────

  describe('cancelTransfer', () => {
    it('cancels REQUESTED transfer', async () => {
      const transfer = makeTransfer('tr-1', TransferStatus.REQUESTED);
      const cancelled = { ...transfer, status: TransferStatus.CANCELLED };

      mockPrisma.stockTransfer.findFirst.mockResolvedValue(transfer);
      mockPrisma.stockTransfer.update.mockResolvedValue(cancelled);

      const result = await service.cancelTransfer(TENANT, 'tr-1');

      expect(mockPrisma.stockTransfer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tr-1', tenantId: TENANT }, // #57: tenantId must scope the write
          data: { status: 'CANCELLED' },
        }),
      );
      expect(result.status).toBe(TransferStatus.CANCELLED);
    });

    it('throws ForbiddenException when trying to cancel SHIPPED transfer', async () => {
      const transfer = makeTransfer('tr-1', TransferStatus.SHIPPED);
      mockPrisma.stockTransfer.findFirst.mockResolvedValue(transfer);

      await expect(service.cancelTransfer(TENANT, 'tr-1')).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.stockTransfer.update).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when trying to cancel RECEIVED transfer', async () => {
      const transfer = makeTransfer('tr-1', TransferStatus.RECEIVED);
      mockPrisma.stockTransfer.findFirst.mockResolvedValue(transfer);

      await expect(service.cancelTransfer(TENANT, 'tr-1')).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── #57: tenant scoping on status-mutating updates ─────────────────────────

  describe('tenant isolation on status updates (#57)', () => {
    it('approveTransfer scopes the update by tenantId', async () => {
      const transfer = makeTransfer('tr-1', TransferStatus.REQUESTED);
      mockPrisma.stockTransfer.findFirst.mockResolvedValue(transfer);
      mockPrisma.stockTransfer.update.mockResolvedValue({ ...transfer, status: TransferStatus.APPROVED });

      await service.approveTransfer(TENANT, 'tr-1', USER_ID);

      expect(mockPrisma.stockTransfer.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'tr-1', tenantId: TENANT } }),
      );
    });

    it('shipTransfer scopes the status update by tenantId', async () => {
      const transfer = makeTransfer('tr-1', TransferStatus.APPROVED);
      mockPrisma.stockTransfer.findFirst.mockResolvedValue(transfer);
      mockPrisma.warehouse.findMany.mockResolvedValue([{ id: 'wh-1' }]);
      mockPrisma.$transaction.mockResolvedValue([]);

      await service.shipTransfer(TENANT, 'tr-1', USER_ID);

      const updateCall = mockPrisma.stockTransfer.update.mock.calls.find(
        ([arg]) => arg?.data?.status === 'SHIPPED',
      );
      expect(updateCall?.[0].where).toEqual({ id: 'tr-1', tenantId: TENANT });
    });

    it('receiveTransfer scopes the status update by tenantId', async () => {
      const transfer = makeTransfer('tr-1', TransferStatus.SHIPPED);
      mockPrisma.stockTransfer.findFirst.mockResolvedValue(transfer);
      mockPrisma.warehouse.findMany.mockResolvedValue([{ id: 'wh-2' }]);
      mockPrisma.$transaction.mockResolvedValue([]);

      await service.receiveTransfer(TENANT, 'tr-1', USER_ID);

      const updateCall = mockPrisma.stockTransfer.update.mock.calls.find(
        ([arg]) => arg?.data?.status === 'RECEIVED',
      );
      expect(updateCall?.[0].where).toEqual({ id: 'tr-1', tenantId: TENANT });
    });
  });
});
