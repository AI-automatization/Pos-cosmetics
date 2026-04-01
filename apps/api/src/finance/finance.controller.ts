import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateExpenseDto, ExpenseFilterDto } from './dto/expense.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/guards/roles.guard';

@ApiTags('Finance / Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ─── EXPENSES ─────────────────────────────────────────────────────────────

  @Post('expenses')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Yangi xarajat qoshish' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.financeService.createExpense(tenantId, userId, dto);
  }

  @Get('expenses')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Xarajatlar royxati' })
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() filter: ExpenseFilterDto,
  ) {
    return this.financeService.getExpenses(tenantId, filter);
  }

  @Get('expenses/summary')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Xarajatlar xulosasi (kategoriya boyicha)' })
  @ApiQuery({ name: 'from', required: false, example: '2026-03-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-03-31' })
  summary(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const fromDate = from ? new Date(from) : new Date(new Date().setDate(1));
    const toDate = to ? new Date(to) : new Date();
    return this.financeService.getExpenseSummary(tenantId, fromDate, toDate);
  }

  @Delete('expenses/:id')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Xarajatni ochirish' })
  remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.financeService.deleteExpense(tenantId, id);
  }

  // ─── T-315: MOLIYAVIY HISOBOTLAR ──────────────────────────────────────────

  @Get('pnl')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'T-315: Foyda va Zarar (P&L) hisoboti' })
  @ApiQuery({ name: 'from', required: false, example: '2026-03-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-03-31' })
  getPnl(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from ? new Date(from) : new Date(new Date().setDate(1));
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);
    return this.financeService.getPnl(tenantId, fromDate, toDate);
  }

  @Get('balance-sheet')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'T-315: Balans (aktiv/passiv/kapital)' })
  @ApiQuery({ name: 'asOf', required: false, description: 'ISO date (default: bugun)', example: '2026-03-31' })
  getBalanceSheet(
    @CurrentUser('tenantId') tenantId: string,
    @Query('asOf') asOf?: string,
  ) {
    const asOfDate = asOf ? new Date(asOf) : new Date();
    asOfDate.setHours(23, 59, 59, 999);
    return this.financeService.getBalanceSheet(tenantId, asOfDate);
  }

  @Get('cash-flow')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'T-315: Naqd pul oqimi (Cash Flow)' })
  @ApiQuery({ name: 'from', required: false, example: '2026-03-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-03-31' })
  getCashFlow(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from ? new Date(from) : new Date(new Date().setDate(1));
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);
    return this.financeService.getCashFlow(tenantId, fromDate, toDate);
  }
}
