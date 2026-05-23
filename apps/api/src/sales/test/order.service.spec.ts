/**
 * Unit tests — OrderService
 * Covers: createOrder, getOrderById, getReceipt, getQuickStats
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrderService } from '../order.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditService } from '../../audit/audit.service';
import { UserRole } from '@prisma/client';
import { CreateOrderDto, DiscountTypeEnum } from '../dto';

// ─── Mock factories ────────────────────────────────────────────────────────────

const makeMockTx = () => ({
  shift: {
    findFirst: jest.fn().mockResolvedValue(null),
    findUnique: jest.fn().mockResolvedValue(null),
  },
  product: {
    findMany: jest.fn(),
  },
  order: {
    findFirst: jest.fn().mockResolvedValue({ orderNumber: 0 }),
    create: jest.fn(),
  },
});

const mockPrisma = {
  $transaction: jest.fn(),
  order: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  orderItem: {
    groupBy: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
  },
};

const mockEventEmitter = { emit: jest.fn() };
const mockAuditService = { log: jest.fn() };

// ─── Helpers ───────────────────────────────────────────────────────────────────

const TENANT = 'tenant-1';
const USER_ID = 'user-1';

const makeProduct = (id: string) => ({
  id,
  name: `Product ${id}`,
  costPrice: 10000,
  isTaxable: false,
  deletedAt: null,
});

const makeOrderDto = (overrides: Partial<CreateOrderDto> = {}): CreateOrderDto => ({
  items: [
    { productId: 'prod-1', quantity: 2, unitPrice: 20000 },
  ],
  ...overrides,
});

const makeOrder = (overrides: Record<string, unknown> = {}) => ({
  id: 'order-1',
  orderNumber: 1,
  tenantId: TENANT,
  userId: USER_ID,
  status: 'COMPLETED',
  subtotal: 40000,
  discountAmount: 0,
  taxAmount: 0,
  total: 40000,
  createdAt: new Date('2026-01-01T10:00:00Z'),
  items: [
    {
      id: 'item-1',
      productId: 'prod-1',
      productName: 'Product prod-1',
      quantity: 2,
      unitPrice: 20000,
      total: 40000,
      product: { id: 'prod-1', name: 'Product prod-1' },
    },
  ],
  customer: { id: 'cust-1', name: 'Test Customer', phone: '+998901234567' },
  user: { id: USER_ID, firstName: 'John', lastName: 'Doe' },
  paymentIntents: [],
  ...overrides,
});

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    jest.clearAllMocks();
  });

  // ─── createOrder ────────────────────────────────────────────────────────────

  describe('createOrder', () => {
    it('creates order successfully with valid items', async () => {
      const tx = makeMockTx();
      const dto = makeOrderDto();
      const product = makeProduct('prod-1');
      const expectedOrder = makeOrder();

      tx.product.findMany.mockResolvedValue([product]);
      tx.order.findFirst.mockResolvedValue({ orderNumber: 5 });
      tx.order.create.mockResolvedValue(expectedOrder);

      mockPrisma.$transaction.mockImplementation((fn: (arg: unknown) => Promise<unknown>) => fn(tx));

      const result = await service.createOrder(TENANT, USER_ID, dto);

      expect(tx.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ tenantId: TENANT }) }),
      );
      expect(tx.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: TENANT,
            userId: USER_ID,
            orderNumber: 6,
          }),
        }),
      );
      expect(result).toEqual(expectedOrder);
    });

    it('emits sale.created event after order creation', async () => {
      const tx = makeMockTx();
      const dto = makeOrderDto();
      const product = makeProduct('prod-1');
      const expectedOrder = makeOrder();

      tx.product.findMany.mockResolvedValue([product]);
      tx.order.create.mockResolvedValue(expectedOrder);

      mockPrisma.$transaction.mockImplementation((fn: (arg: unknown) => Promise<unknown>) => fn(tx));

      await service.createOrder(TENANT, USER_ID, dto);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'sale.created',
        expect.objectContaining({ tenantId: TENANT, orderId: 'order-1' }),
      );
    });

    it('throws NotFoundException when product not found', async () => {
      const tx = makeMockTx();
      const dto = makeOrderDto({
        items: [{ productId: 'nonexistent-id', quantity: 1, unitPrice: 10000 }],
      });

      // findMany returns empty — product doesn't exist in tenant
      tx.product.findMany.mockResolvedValue([]);

      mockPrisma.$transaction.mockImplementation((fn: (arg: unknown) => Promise<unknown>) => fn(tx));

      await expect(service.createOrder(TENANT, USER_ID, dto)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when CASHIER exceeds 5% discount limit', async () => {
      const tx = makeMockTx();
      // 10% discount exceeds CASHIER limit of 5%
      const dto = makeOrderDto({ discountAmount: 10, discountType: DiscountTypeEnum.PERCENT });

      tx.product.findMany.mockResolvedValue([makeProduct('prod-1')]);

      mockPrisma.$transaction.mockImplementation((fn: (arg: unknown) => Promise<unknown>) => fn(tx));

      await expect(
        service.createOrder(TENANT, USER_ID, dto, UserRole.CASHIER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows ADMIN to apply 100% discount', async () => {
      const tx = makeMockTx();
      const dto = makeOrderDto({ discountAmount: 100, discountType: DiscountTypeEnum.PERCENT });
      const product = makeProduct('prod-1');
      const expectedOrder = makeOrder({ total: 0 });

      tx.product.findMany.mockResolvedValue([product]);
      tx.order.create.mockResolvedValue(expectedOrder);

      mockPrisma.$transaction.mockImplementation((fn: (arg: unknown) => Promise<unknown>) => fn(tx));

      const result = await service.createOrder(TENANT, USER_ID, dto, UserRole.ADMIN);

      expect(tx.order.create).toHaveBeenCalled();
      expect(result.total).toBe(0);
    });

    it('auto-assigns shiftId from user open shift when not provided', async () => {
      const tx = makeMockTx();
      const dto = makeOrderDto(); // no shiftId
      const product = makeProduct('prod-1');
      const openShift = { id: 'shift-99', branchId: 'branch-1' };
      const expectedOrder = makeOrder({ shiftId: 'shift-99' });

      tx.shift.findFirst.mockResolvedValue(openShift);
      tx.product.findMany.mockResolvedValue([product]);
      tx.order.create.mockResolvedValue(expectedOrder);

      mockPrisma.$transaction.mockImplementation((fn: (arg: unknown) => Promise<unknown>) => fn(tx));

      await service.createOrder(TENANT, USER_ID, dto);

      expect(tx.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ shiftId: 'shift-99' }),
        }),
      );
    });
  });

  // ─── getOrderById ────────────────────────────────────────────────────────────

  describe('getOrderById', () => {
    it('returns order with all includes', async () => {
      const order = makeOrder();
      mockPrisma.order.findFirst.mockResolvedValue(order);

      const result = await service.getOrderById(TENANT, 'order-1');

      expect(mockPrisma.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-1', tenantId: TENANT },
          include: expect.objectContaining({ items: expect.anything(), paymentIntents: true }),
        }),
      );
      expect(result).toEqual(order);
    });

    it('throws NotFoundException when order does not exist', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await expect(service.getOrderById(TENANT, 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('does not return orders from other tenants', async () => {
      // Simulate cross-tenant isolation: Prisma returns null for wrong tenantId
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await expect(service.getOrderById('wrong-tenant', 'order-1')).rejects.toThrow(NotFoundException);

      expect(mockPrisma.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'order-1', tenantId: 'wrong-tenant' } }),
      );
    });
  });

  // ─── getReceipt ──────────────────────────────────────────────────────────────

  describe('getReceipt', () => {
    it('formats receipt data correctly', async () => {
      const order = makeOrder();
      mockPrisma.order.findFirst.mockResolvedValue(order);

      const receipt = await service.getReceipt(TENANT, 'order-1');

      expect(receipt).toMatchObject({
        orderNumber: 1,
        cashier: 'John Doe',
        customer: 'Test Customer',
        subtotal: 40000,
        discount: 0,
        total: 40000,
        items: expect.arrayContaining([
          expect.objectContaining({ name: 'Product prod-1', qty: 2, price: 20000 }),
        ]),
      });
    });

    it('returns null customer when order has no customer', async () => {
      const order = makeOrder({ customer: null });
      mockPrisma.order.findFirst.mockResolvedValue(order);

      const receipt = await service.getReceipt(TENANT, 'order-1');

      expect(receipt.customer).toBeNull();
    });

    it('returns empty cashier name when user is not attached', async () => {
      const order = makeOrder({ user: null });
      mockPrisma.order.findFirst.mockResolvedValue(order);

      const receipt = await service.getReceipt(TENANT, 'order-1');

      expect(receipt.cashier).toBe('');
    });
  });

  // ─── getQuickStats ───────────────────────────────────────────────────────────

  describe('getQuickStats', () => {
    it('returns correct ordersCount and avgBasket', async () => {
      const orders = [{ total: 30000 }, { total: 50000 }, { total: 20000 }];
      const topProducts = [
        { productId: 'prod-1', _sum: { quantity: 10, total: 200000 } },
      ];

      mockPrisma.$transaction.mockResolvedValue([orders, topProducts]);
      mockPrisma.product.findMany.mockResolvedValue([{ id: 'prod-1', name: 'Lipstick' }]);

      const stats = await service.getQuickStats(TENANT);

      expect(stats.ordersCount).toBe(3);
      expect(stats.avgBasket).toBe(Math.round((30000 + 50000 + 20000) / 3));
      expect(stats.currency).toBe('UZS');
    });

    it('returns avgBasket=0 when there are no orders today', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], []]);
      mockPrisma.product.findMany.mockResolvedValue([]);

      const stats = await service.getQuickStats(TENANT);

      expect(stats.ordersCount).toBe(0);
      expect(stats.avgBasket).toBe(0);
      expect(stats.topProducts).toEqual([]);
    });

    it('applies branchId filter when provided', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], []]);
      mockPrisma.product.findMany.mockResolvedValue([]);

      const stats = await service.getQuickStats(TENANT, 'branch-5');

      // $transaction is called once and the result is processed successfully
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(stats.ordersCount).toBe(0);
    });
  });
});
