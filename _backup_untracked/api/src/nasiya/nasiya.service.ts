import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEMO_DEBTORS = [
  {
    id: 'debtor-001',
    customerId: 'cust-001',
    customerName: 'Malika Rahimova',
    customerPhone: '+998901234567',
    totalDebt: 350000,
    currency: 'UZS',
    lastPaymentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    overdueAmount: 0,
    branchId: 'demo-branch-1',
    branchName: 'Asosiy filial',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    payments: [
      {
        id: 'pay-001',
        debtorId: 'debtor-001',
        amount: 150000,
        currency: 'UZS',
        paymentMethod: 'CASH',
        note: 'Birinchi to\'lov',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'debtor-002',
    customerId: 'cust-002',
    customerName: 'Sherzod Karimov',
    customerPhone: '+998909876543',
    totalDebt: 780000,
    currency: 'UZS',
    lastPaymentAt: null,
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    overdueAmount: 780000,
    branchId: 'demo-branch-1',
    branchName: 'Asosiy filial',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    payments: [],
  },
  {
    id: 'debtor-003',
    customerId: 'cust-003',
    customerName: 'Zulfiya Toshmatova',
    customerPhone: '+998911112233',
    totalDebt: 120000,
    currency: 'UZS',
    lastPaymentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    overdueAmount: 0,
    branchId: 'demo-branch-1',
    branchName: 'Asosiy filial',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    payments: [
      {
        id: 'pay-002',
        debtorId: 'debtor-003',
        amount: 80000,
        currency: 'UZS',
        paymentMethod: 'CLICK',
        note: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

@Injectable()
export class NasiyaService {
  private readonly logger = new Logger(NasiyaService.name);

  constructor(private readonly prisma: PrismaService) {}

  getDebtors(branchId?: string) {
    if (branchId) return DEMO_DEBTORS.filter((d) => d.branchId === branchId);
    return DEMO_DEBTORS;
  }

  getDebtorById(id: string) {
    const debtor = DEMO_DEBTORS.find((d) => d.id === id);
    if (!debtor) throw new NotFoundException('Debtor not found');
    return debtor;
  }

  recordPayment(dto: { debtorId: string; amount: number; paymentMethod: string; note?: string }) {
    this.logger.log(`Payment recorded: ${dto.debtorId} — ${dto.amount} UZS`);
    return {
      id: `pay-${Date.now()}`,
      debtorId: dto.debtorId,
      amount: dto.amount,
      currency: 'UZS',
      paymentMethod: dto.paymentMethod,
      note: dto.note ?? null,
      createdAt: new Date().toISOString(),
    };
  }

  sendReminder(debtorId: string) {
    const debtor = DEMO_DEBTORS.find((d) => d.id === debtorId);
    if (!debtor) throw new NotFoundException('Debtor not found');
    this.logger.log(`Reminder sent to ${debtor.customerPhone}`);
    return { success: true, message: `Eslatma ${debtor.customerPhone} ga yuborildi` };
  }
}
