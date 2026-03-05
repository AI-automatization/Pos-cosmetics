import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { JournalRefType, LedgerAccount, LedgerLineType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

interface LedgerLineInput {
  account: LedgerAccount;
  type: LedgerLineType;
  amount: number;
}

interface CreateJournalInput {
  tenantId: string;
  referenceType: JournalRefType;
  referenceId: string;
  description?: string;
  lines: LedgerLineInput[];
}

// ─── Payloads from EventEmitter ───────────────────────────────

interface SaleCreatedPayload {
  tenantId: string;
  orderId: string;
  total: number;
  customerId?: string;
}

interface PaymentSettledPayload {
  tenantId: string;
  intentId: string;
  orderId: string;
  method: string;
  amount: number | Decimal;
}

interface ReturnApprovedPayload {
  tenantId: string;
  returnId: string;
  items: Array<{ productId: string; quantity: number; amount?: number }>;
}

@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── CORE: Create Journal Entry ────────────────────────────

  async recordEntry(input: CreateJournalInput): Promise<void> {
    // Validation: sum(DEBIT) === sum(CREDIT)
    const debitSum = input.lines
      .filter((l) => l.type === LedgerLineType.DEBIT)
      .reduce((s, l) => s + l.amount, 0);

    const creditSum = input.lines
      .filter((l) => l.type === LedgerLineType.CREDIT)
      .reduce((s, l) => s + l.amount, 0);

    if (Math.abs(debitSum - creditSum) > 0.001) {
      const msg = `Ledger imbalance: debit=${debitSum} credit=${creditSum} ref=${input.referenceId}`;
      this.logger.error(msg, { tenantId: input.tenantId });
      throw new InternalServerErrorException(msg);
    }

    await this.prisma.journalEntry.create({
      data: {
        tenantId: input.tenantId,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        description: input.description,
        lines: {
          create: input.lines.map((l) => ({
            account: l.account,
            type: l.type,
            amount: l.amount,
          })),
        },
      },
    });

    this.logger.log(
      `JournalEntry: ${input.referenceType}/${input.referenceId} debit=${debitSum} credit=${creditSum}`,
      { tenantId: input.tenantId },
    );
  }

  // ─── EVENT: sale.created → debit AR / credit Revenue ──────

  @OnEvent('sale.created')
  async handleSaleCreated(payload: SaleCreatedPayload) {
    try {
      // Nasiya (customerId bor) → Accounts Receivable
      // Naqd → Cash (payments.settled event dan keladi)
      // sale.created da: debit Accounts Receivable, credit Revenue
      await this.recordEntry({
        tenantId: payload.tenantId,
        referenceType: JournalRefType.SALE,
        referenceId: payload.orderId,
        description: `Sale order revenue`,
        lines: [
          {
            account: LedgerAccount.ACCOUNTS_RECEIVABLE,
            type: LedgerLineType.DEBIT,
            amount: payload.total,
          },
          {
            account: LedgerAccount.REVENUE,
            type: LedgerLineType.CREDIT,
            amount: payload.total,
          },
        ],
      });
    } catch (err) {
      // Ledger xato bo'lsa ham sale ni to'xtatmaymiz — log yozamiz
      this.logger.error(`Ledger failed for sale ${payload.orderId}`, {
        error: (err as Error).message,
        tenantId: payload.tenantId,
      });
    }
  }

  // ─── EVENT: payment.settled → debit Cash / credit AR ──────

  @OnEvent('payment.settled')
  async handlePaymentSettled(payload: PaymentSettledPayload) {
    if (payload.method === 'DEBT') return; // Nasiya — AR allaqachon debited

    try {
      const amount = Number(payload.amount);
      await this.recordEntry({
        tenantId: payload.tenantId,
        referenceType: JournalRefType.PAYMENT,
        referenceId: payload.intentId,
        description: `Payment ${payload.method} for order ${payload.orderId}`,
        lines: [
          {
            account: LedgerAccount.CASH,
            type: LedgerLineType.DEBIT,
            amount,
          },
          {
            account: LedgerAccount.ACCOUNTS_RECEIVABLE,
            type: LedgerLineType.CREDIT,
            amount,
          },
        ],
      });
    } catch (err) {
      this.logger.error(`Ledger failed for payment ${payload.intentId}`, {
        error: (err as Error).message,
        tenantId: payload.tenantId,
      });
    }
  }

  // ─── EVENT: return.approved → reversal entries ─────────────

  @OnEvent('return.approved')
  async handleReturnApproved(payload: ReturnApprovedPayload) {
    try {
      // Get return total from DB
      const ret = await this.prisma.return.findFirst({
        where: { id: payload.returnId },
        select: { total: true, tenantId: true },
      });
      if (!ret) return;

      const amount = Number(ret.total);
      await this.recordEntry({
        tenantId: payload.tenantId,
        referenceType: JournalRefType.RETURN,
        referenceId: payload.returnId,
        description: `Return reversal`,
        lines: [
          {
            account: LedgerAccount.SALES_RETURN,
            type: LedgerLineType.DEBIT,
            amount,
          },
          {
            account: LedgerAccount.ACCOUNTS_RECEIVABLE,
            type: LedgerLineType.CREDIT,
            amount,
          },
        ],
      });
    } catch (err) {
      this.logger.error(`Ledger failed for return ${payload.returnId}`, {
        error: (err as Error).message,
        tenantId: payload.tenantId,
      });
    }
  }

  // ─── READ: Get journal entries for reference ────────────────

  async getEntriesByRef(tenantId: string, referenceType: JournalRefType, referenceId: string) {
    return this.prisma.journalEntry.findMany({
      where: { tenantId, referenceType, referenceId },
      include: { lines: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getAccountBalance(tenantId: string, account: LedgerAccount) {
    const rows = await this.prisma.$queryRaw<{ balance: number }[]>`
      SELECT
        SUM(
          CASE
            WHEN jl.type = 'DEBIT'  THEN jl.amount
            ELSE -jl.amount
          END
        )::float AS balance
      FROM journal_lines jl
      JOIN journal_entries je ON je.id = jl.journal_entry_id
      WHERE je.tenant_id = ${tenantId}
        AND jl.account   = ${account}::"LedgerAccount"
    `;
    return Number(rows[0]?.balance ?? 0);
  }
}
