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
}
