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

  // Mobile-owner: GET /debts/summary
  async getSummary(tenantId: string) {
    const now = new Date();

    const [all, overdue] = await Promise.all([
      this.prisma.debtRecord.aggregate({
        where: {
          tenantId,
          status: { in: [DebtStatus.ACTIVE, DebtStatus.PARTIAL, DebtStatus.OVERDUE] },
        },
        _sum: { remaining: true },
        _count: { id: true },
      }),
      this.prisma.debtRecord.aggregate({
        where: {
          tenantId,
          status: { in: [DebtStatus.ACTIVE, DebtStatus.PARTIAL, DebtStatus.OVERDUE] },
          dueDate: { lt: now },
        },
        _sum: { remaining: true },
        _count: { id: true },
      }),
    ]);

    const debtorCount = await this.prisma.debtRecord.groupBy({
      by: ['customerId'],
      where: {
        tenantId,
        status: { in: [DebtStatus.ACTIVE, DebtStatus.PARTIAL, DebtStatus.OVERDUE] },
      },
    }).then((rows) => rows.length);

    const totalDebt = Number(all._sum.remaining ?? 0);
    const count = all._count.id;

    return {
      totalDebt,
      overdueDebt: Number(overdue._sum.remaining ?? 0),
      overdueCount: overdue._count.id,
      debtorCount,
      avgDebt: debtorCount > 0 ? Math.round(totalDebt / debtorCount) : 0,
      activeCount: count,
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

    const buckets = [
      { key: 'current', label: 'Muddati o\'tmagan', min: -Infinity, max: 0 },
      { key: '1_30', label: '1–30 kun', min: 0, max: 30 },
      { key: '31_60', label: '31–60 kun', min: 30, max: 60 },
      { key: '61_90', label: '61–90 kun', min: 60, max: 90 },
      { key: '90plus', label: '90+ kun', min: 90, max: Infinity },
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

  // Mobile-owner: GET /debts/customers
  async getDebtCustomers(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const now = new Date();

    const records = await this.prisma.debtRecord.findMany({
      where: {
        tenantId,
        status: { in: [DebtStatus.ACTIVE, DebtStatus.PARTIAL, DebtStatus.OVERDUE] },
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { remaining: 'desc' },
    });

    // Group by customer
    const customerMap = new Map<string, {
      customerId: string;
      customerName: string;
      phone: string | null;
      totalDebt: number;
      overdueAmount: number;
      debtCount: number;
    }>();

    for (const r of records) {
      const cId = r.customerId;
      if (!customerMap.has(cId)) {
        customerMap.set(cId, {
          customerId: cId,
          customerName: r.customer.name,
          phone: r.customer.phone,
          totalDebt: 0,
          overdueAmount: 0,
          debtCount: 0,
        });
      }
      const entry = customerMap.get(cId)!;
      entry.totalDebt += Number(r.remaining);
      entry.debtCount += 1;
      if (r.dueDate && r.dueDate < now) {
        entry.overdueAmount += Number(r.remaining);
      }
    }

    const allCustomers = Array.from(customerMap.values());
    const total = allCustomers.length;
    const items = allCustomers.slice(skip, skip + limit);

    return { items, total, page, limit };
  }
}
