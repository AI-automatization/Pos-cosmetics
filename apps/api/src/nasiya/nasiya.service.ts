import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDebtDto, RecordDebtPaymentDto } from './dto/nasiya.dto';
import { DebtStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class NasiyaService {
  private readonly logger = new Logger(NasiyaService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Create a new debt record
  async createDebt(tenantId: string, dto: CreateDebtDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, tenantId },
    });
    if (!customer)
      throw new NotFoundException(`Customer ${dto.customerId} not found`);

    const debt = await this.prisma.debtRecord.create({
      data: {
        tenantId,
        customerId: dto.customerId,
        orderId: dto.orderId,
        totalAmount: dto.totalAmount,
        paidAmount: 0,
        remaining: dto.totalAmount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
        status: DebtStatus.ACTIVE,
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
      },
    });

    this.logger.log(`Debt created: ${debt.id} for customer ${dto.customerId}`, {
      tenantId,
      amount: dto.totalAmount,
    });
    return debt;
  }

  // Record a debt payment
  async recordPayment(tenantId: string, debtId: string, dto: RecordDebtPaymentDto) {
    const debt = await this.prisma.debtRecord.findFirst({
      where: {
        id: debtId,
        tenantId,
        status: { in: [DebtStatus.ACTIVE, DebtStatus.PARTIAL, DebtStatus.OVERDUE] },
      },
    });
    if (!debt) throw new NotFoundException(`Debt ${debtId} not found or already paid`);

    if (dto.amount > Number(debt.remaining)) {
      throw new BadRequestException(
        `Payment ${dto.amount} exceeds remaining balance ${debt.remaining}`,
      );
    }

    const newPaid = Number(debt.paidAmount) + dto.amount;
    const newRemaining = Number(debt.remaining) - dto.amount;
    const newStatus =
      newRemaining <= 0
        ? DebtStatus.PAID
        : newPaid > 0
          ? DebtStatus.PARTIAL
          : debt.status;

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.debtPayment.create({
        data: {
          debtRecordId: debtId,
          amount: dto.amount,
          method: dto.method ?? PaymentMethod.CASH,
          notes: dto.notes,
        },
      });

      await tx.debtRecord.update({
        where: { id: debtId },
        data: {
          paidAmount: newPaid,
          remaining: newRemaining,
          status: newStatus,
        },
      });

      this.logger.log(
        `Debt payment recorded: ${payment.id}, remaining: ${newRemaining}`,
        { tenantId, debtId },
      );
      return payment;
    });
  }

  // List debts for tenant
  async getDebts(
    tenantId: string,
    opts: { customerId?: string; status?: DebtStatus; page?: number; limit?: number },
  ) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(opts.customerId && { customerId: opts.customerId }),
      ...(opts.status && { status: opts.status }),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.debtRecord.count({ where }),
      this.prisma.debtRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          payments: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
      }),
    ]);

    return { items, total, page, limit };
  }

  // Get single debt
  async getDebtById(tenantId: string, id: string) {
    const debt = await this.prisma.debtRecord.findFirst({
      where: { id, tenantId },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!debt) throw new NotFoundException(`Debt ${id} not found`);
    return debt;
  }

  // Get overdue debts (due date passed)
  async getOverdueDebts(tenantId: string) {
    const now = new Date();
    return this.prisma.debtRecord.findMany({
      where: {
        tenantId,
        status: { in: [DebtStatus.ACTIVE, DebtStatus.PARTIAL] },
        dueDate: { lt: now },
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  // Summary: total debt for a customer
  async getCustomerDebtSummary(tenantId: string, customerId: string) {
    const result = await this.prisma.debtRecord.aggregate({
      where: {
        tenantId,
        customerId,
        status: { in: [DebtStatus.ACTIVE, DebtStatus.PARTIAL, DebtStatus.OVERDUE] },
      },
      _sum: {
        totalAmount: true,
        paidAmount: true,
        remaining: true,
      },
      _count: true,
    });

    return {
      totalDebt: result._sum.totalAmount ?? 0,
      totalPaid: result._sum.paidAmount ?? 0,
      remaining: result._sum.remaining ?? 0,
      recordCount: result._count,
    };
  }

  // Full debt detail with payment history and linked order items
  async getDebtDetail(tenantId: string, debtId: string) {
    const debt = await this.prisma.debtRecord.findFirst({
      where: { id: debtId, tenantId },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!debt) throw new NotFoundException('Nasiya topilmadi');

    // DebtRecord has orderId but no Prisma relation — fetch order separately
    let order = null as Awaited<ReturnType<typeof this.prisma.order.findFirst>> | null;

    if (debt.orderId) {
      order = await this.prisma.order.findFirst({
        where: { id: debt.orderId, tenantId },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              quantity: true,
              unitPrice: true,
              productName: true,
              product: { select: { name: true } },
            },
          },
        },
      }) as Awaited<ReturnType<typeof this.prisma.order.findFirst>>;
    }

    this.logger.log(`Debt detail fetched: ${debtId}`, { tenantId });
    return { ...debt, order };
  }

  // Mobile-owner: GET /debts/summary?branchId=
  // T-206: { totalDebt, overdueDebt, overdueCount, aging: { current, days30, days60, days90plus } }
  async getSummary(tenantId: string, branchId?: string) {
    const now = new Date();
    const branchFilter = branchId
      ? { order: { branchId } } as Record<string, unknown>
      : {};
    const activeWhere = {
      tenantId,
      status: { in: [DebtStatus.ACTIVE, DebtStatus.PARTIAL, DebtStatus.OVERDUE] },
      ...branchFilter,
    };

    const [all, overdue, activeDebts] = await Promise.all([
      this.prisma.debtRecord.aggregate({
        where: activeWhere,
        _sum: { remaining: true },
        _count: { id: true },
      }),
      this.prisma.debtRecord.aggregate({
        where: { ...activeWhere, dueDate: { lt: now } },
        _sum: { remaining: true },
        _count: { id: true },
      }),
      this.prisma.debtRecord.findMany({
        where: activeWhere,
        select: { remaining: true, dueDate: true },
      }),
    ]);

    // Aging buckets
    const aging = { current: 0, days30: 0, days60: 0, days90plus: 0 };
    for (const d of activeDebts) {
      const remaining = Number(d.remaining);
      if (!d.dueDate || d.dueDate >= now) {
        aging.current += remaining;
      } else {
        const daysOverdue = Math.floor((now.getTime() - d.dueDate.getTime()) / 86400000);
        if (daysOverdue <= 30) aging.days30 += remaining;
        else if (daysOverdue <= 60) aging.days60 += remaining;
        else aging.days90plus += remaining;
      }
    }

    return {
      totalDebt: Number(all._sum.remaining ?? 0),
      overdueDebt: Number(overdue._sum.remaining ?? 0),
      overdueCount: overdue._count.id,
      aging,
    };
  }

  // Mobile-owner: GET /debts/aging-report
  async getAgingReport(tenantId: string) {
    const now = new Date();

    const active = await this.prisma.debtRecord.findMany({
      where: {
        tenantId,
        status: { in: [DebtStatus.ACTIVE, DebtStatus.PARTIAL, DebtStatus.OVERDUE] },
        dueDate: { not: null },
      },
      select: { remaining: true, dueDate: true },
    });

    // Keys must match mobile AgingBucketKey: '0_30' | '31_60' | '61_90' | '90_plus'
    const buckets = [
      { key: '0_30',   label: '0–30 kun',  min: -Infinity, max: 30 },
      { key: '31_60',  label: '31–60 kun', min: 30,        max: 60 },
      { key: '61_90',  label: '61–90 kun', min: 60,        max: 90 },
      { key: '90_plus', label: '90+ kun',  min: 90,        max: Infinity },
    ];

    const result = buckets.map((b) => ({ bucket: b.key, label: b.label, amount: 0, customerCount: 0 }));

    for (const debt of active) {
      if (!debt.dueDate) continue;
      const daysOverdue = Math.floor((now.getTime() - debt.dueDate.getTime()) / 86400000);
      const bucket = buckets.find((b) => daysOverdue > b.min && daysOverdue <= b.max);
      if (bucket) {
        const idx = result.findIndex((r) => r.bucket === bucket.key);
        result[idx].amount += Number(debt.remaining);
        result[idx].customerCount += 1;
      }
    }

    return { buckets: result };
  }

  // Mobile-owner: GET /debts/customers?branchId=&status=current|overdue&page=&limit=
  // T-206: { customers: [{ customerId, customerName, phone, totalDebt, overdueAmount, lastPaymentDate, daysPastDue }] }
  async getDebtCustomers(
    tenantId: string,
    page = 1,
    limit = 20,
    opts: { branchId?: string; status?: string } = {},
  ) {
    const skip = (page - 1) * limit;
    const now = new Date();
    const branchFilter = opts.branchId
      ? { order: { branchId: opts.branchId } } as Record<string, unknown>
      : {};

    const records = await this.prisma.debtRecord.findMany({
      where: {
        tenantId,
        status: { in: [DebtStatus.ACTIVE, DebtStatus.PARTIAL, DebtStatus.OVERDUE] },
        ...branchFilter,
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { remaining: 'desc' },
    });

    // Group by customer
    type Entry = {
      customerId: string; customerName: string; phone: string | null;
      totalDebt: number; overdueAmount: number;
      lastDueDate: Date | null; lastUpdatedAt: Date;
    };
    const customerMap = new Map<string, Entry>();

    for (const r of records) {
      const cId = r.customerId;
      if (!customerMap.has(cId)) {
        customerMap.set(cId, {
          customerId: cId,
          customerName: r.customer.name,
          phone: r.customer.phone,
          totalDebt: 0,
          overdueAmount: 0,
          lastDueDate: r.dueDate,
          lastUpdatedAt: r.updatedAt,
        });
      }
      const entry = customerMap.get(cId)!;
      entry.totalDebt += Number(r.remaining);
      if (r.dueDate && r.dueDate < now) {
        entry.overdueAmount += Number(r.remaining);
        // Track the earliest overdue due date for daysPastDue
        if (!entry.lastDueDate || r.dueDate < entry.lastDueDate) {
          entry.lastDueDate = r.dueDate;
        }
      }
      if (r.updatedAt > entry.lastUpdatedAt) {
        entry.lastUpdatedAt = r.updatedAt;
      }
    }

    let allCustomers = Array.from(customerMap.values()).map((e) => {
      const daysPastDue = e.lastDueDate && e.lastDueDate < now
        ? Math.floor((now.getTime() - e.lastDueDate.getTime()) / 86400000)
        : 0;
      return {
        customerId: e.customerId,
        customerName: e.customerName,
        phone: e.phone,
        totalDebt: e.totalDebt,
        overdueAmount: e.overdueAmount,
        lastPaymentDate: e.lastUpdatedAt,
        daysPastDue,
      };
    });

    // status filter: 'current' = daysPastDue === 0, 'overdue' = daysPastDue > 0
    if (opts.status === 'current') {
      allCustomers = allCustomers.filter((c) => c.daysPastDue === 0);
    } else if (opts.status === 'overdue') {
      allCustomers = allCustomers.filter((c) => c.daysPastDue > 0);
    }

    const total = allCustomers.length;
    const customers = allCustomers.slice(skip, skip + limit);

    return { customers, total, page, limit };
  }
}
