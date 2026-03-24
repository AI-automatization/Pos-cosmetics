import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExpenseCategory } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ enum: ExpenseCategory })
  @IsEnum(ExpenseCategory)
  category!: ExpenseCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: '2026-02-28' })
  @IsString()
  date!: string;
}

export class ExpenseFilterDto {
  @ApiPropertyOptional({ enum: ExpenseCategory })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @ApiPropertyOptional({ example: '2026-02-01' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-02-28' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createExpense(tenantId: string, userId: string, dto: CreateExpenseDto) {
    const expense = await this.prisma.expense.create({
      data: {
        tenantId,
        userId,
        category: dto.category,
        description: dto.description,
        amount: dto.amount,
        date: new Date(dto.date),
      },
    });

    this.logger.log(`Expense created: ${expense.id}`, {
      tenantId,
      category: dto.category,
      amount: dto.amount,
    });
    return expense;
  }

  async getExpenses(tenantId: string, filter: ExpenseFilterDto) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(filter.category && { category: filter.category }),
      ...((filter.from || filter.to) && {
        date: {
          ...(filter.from && { gte: new Date(filter.from) }),
          ...(filter.to && { lte: new Date(filter.to) }),
        },
      }),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.expense.count({ where }),
      this.prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
    ]);

    return { items, total, page, limit };
  }

  async getExpenseSummary(tenantId: string, from: Date, to: Date) {
    const rows = await this.prisma.$queryRaw<
      { category: string; total: number; count: number }[]
    >`
      SELECT
        category,
        SUM(amount)::float AS total,
        COUNT(*)::int      AS count
      FROM expenses
      WHERE tenant_id = ${tenantId}
        AND date >= ${from}
        AND date <= ${to}
      GROUP BY category
      ORDER BY total DESC
    `;

    const grandTotal = rows.reduce((s, r) => s + r.total, 0);

    return {
      period: { from, to },
      byCategory: rows,
      grandTotal,
    };
  }

  async deleteExpense(tenantId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, tenantId },
    });
    if (!expense) throw new NotFoundException(`Expense ${id} not found`);

    await this.prisma.expense.delete({ where: { id } });
    this.logger.log(`Expense deleted: ${id}`, { tenantId });
    return { success: true };
  }

  // ─── T-315: PROFIT & LOSS ────────────────────────────────────────────────

  async getPnl(tenantId: string, from: Date, to: Date) {
    type LedgerRow = { account: string; type: string; total: number };

    const rows = await this.prisma.$queryRaw<LedgerRow[]>`
      SELECT
        jl.account,
        jl.type,
        SUM(jl.amount)::float AS total
      FROM journal_lines jl
      JOIN journal_entries je ON je.id = jl.journal_entry_id
      WHERE je.tenant_id = ${tenantId}
        AND je.created_at >= ${from}
        AND je.created_at <= ${to}
      GROUP BY jl.account, jl.type
    `;

    const get = (account: string, type: string) =>
      rows.find((r) => r.account === account && r.type === type)?.total ?? 0;

    // Revenue = CREDIT(REVENUE) - DEBIT(REVENUE)
    const revenue = get('REVENUE', 'CREDIT') - get('REVENUE', 'DEBIT');
    // COGS = DEBIT(COST_OF_GOODS_SOLD)
    const cogs = get('COST_OF_GOODS_SOLD', 'DEBIT') - get('COST_OF_GOODS_SOLD', 'CREDIT');
    // Returns = DEBIT(SALES_RETURN)
    const returns = get('SALES_RETURN', 'DEBIT') - get('SALES_RETURN', 'CREDIT');
    // Expenses (ledger) = DEBIT(EXPENSES)
    const ledgerExpenses = get('EXPENSES', 'DEBIT') - get('EXPENSES', 'CREDIT');

    // Expenses (from expense table) — direct CRUD expenses
    const expenseAgg = await this.prisma.expense.aggregate({
      where: { tenantId, date: { gte: from, lte: to } },
      _sum: { amount: true },
    });
    const directExpenses = Number(expenseAgg._sum.amount ?? 0);

    const grossProfit = revenue - cogs - returns;
    const totalExpenses = ledgerExpenses + directExpenses;
    const netProfit = grossProfit - totalExpenses;
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    this.logger.log('[Finance] P&L generated', { tenantId, revenue, netProfit });

    return {
      period: { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) },
      revenue: Math.round(revenue),
      cogs: Math.round(cogs),
      returns: Math.round(returns),
      grossProfit: Math.round(grossProfit),
      expenses: Math.round(totalExpenses),
      netProfit: Math.round(netProfit),
      margin: Math.round(margin * 100) / 100,
    };
  }

  // ─── T-315: BALANCE SHEET ────────────────────────────────────────────────

  async getBalanceSheet(tenantId: string, asOf: Date) {
    type LedgerRow = { account: string; type: string; total: number };

    const rows = await this.prisma.$queryRaw<LedgerRow[]>`
      SELECT
        jl.account,
        jl.type,
        SUM(jl.amount)::float AS total
      FROM journal_lines jl
      JOIN journal_entries je ON je.id = jl.journal_entry_id
      WHERE je.tenant_id = ${tenantId}
        AND je.created_at <= ${asOf}
      GROUP BY jl.account, jl.type
    `;

    const get = (account: string, type: string) =>
      rows.find((r) => r.account === account && r.type === type)?.total ?? 0;

    // Assets (DEBIT increases assets)
    const cash = get('CASH', 'DEBIT') - get('CASH', 'CREDIT');
    const receivables = get('ACCOUNTS_RECEIVABLE', 'DEBIT') - get('ACCOUNTS_RECEIVABLE', 'CREDIT');
    const totalAssets = cash + receivables;

    // Revenue & Expenses → Retained Earnings
    const revenue = get('REVENUE', 'CREDIT') - get('REVENUE', 'DEBIT');
    const cogs = get('COST_OF_GOODS_SOLD', 'DEBIT') - get('COST_OF_GOODS_SOLD', 'CREDIT');
    const returns = get('SALES_RETURN', 'DEBIT') - get('SALES_RETURN', 'CREDIT');
    const ledgerExpenses = get('EXPENSES', 'DEBIT') - get('EXPENSES', 'CREDIT');

    const expenseAgg = await this.prisma.expense.aggregate({
      where: { tenantId, date: { lte: asOf } },
      _sum: { amount: true },
    });
    const directExpenses = Number(expenseAgg._sum.amount ?? 0);
    const retainedEarnings = revenue - cogs - returns - ledgerExpenses - directExpenses;

    return {
      asOf: asOf.toISOString().slice(0, 10),
      assets: {
        cash: Math.round(cash),
        accountsReceivable: Math.round(receivables),
        total: Math.round(totalAssets),
      },
      equity: {
        retainedEarnings: Math.round(retainedEarnings),
        total: Math.round(retainedEarnings),
      },
    };
  }

  // ─── T-315: CASH FLOW ────────────────────────────────────────────────────

  async getCashFlow(tenantId: string, from: Date, to: Date) {
    type CashRow = { type: string; total: number };

    const rows = await this.prisma.$queryRaw<CashRow[]>`
      SELECT
        jl.type,
        SUM(jl.amount)::float AS total
      FROM journal_lines jl
      JOIN journal_entries je ON je.id = jl.journal_entry_id
      WHERE je.tenant_id = ${tenantId}
        AND jl.account = 'CASH'
        AND je.created_at >= ${from}
        AND je.created_at <= ${to}
      GROUP BY jl.type
    `;

    const inflow = rows.find((r) => r.type === 'DEBIT')?.total ?? 0;
    const outflow = rows.find((r) => r.type === 'CREDIT')?.total ?? 0;

    // Direct expenses also reduce cash
    const expenseAgg = await this.prisma.expense.aggregate({
      where: { tenantId, date: { gte: from, lte: to } },
      _sum: { amount: true },
    });
    const expenseOutflow = Number(expenseAgg._sum.amount ?? 0);

    const netCashFlow = inflow - outflow - expenseOutflow;

    return {
      period: { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) },
      inflow: Math.round(inflow),
      outflow: Math.round(outflow + expenseOutflow),
      netCashFlow: Math.round(netCashFlow),
    };
  }
}
