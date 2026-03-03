import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FinanceService, CreateExpenseDto, ExpenseFilterDto } from './finance.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Finance / Expenses')
@ApiBearerAuth()
@Controller('expenses')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post()
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Yangi xarajat qoshish' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.financeService.createExpense(tenantId, userId, dto);
  }

  @Get()
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Xarajatlar royxati' })
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() filter: ExpenseFilterDto,
  ) {
    return this.financeService.getExpenses(tenantId, filter);
  }

  @Get('summary')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Xarajatlar xulosasi (kategoriya boyicha)' })
  summary(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const fromDate = from ? new Date(from) : new Date(new Date().setDate(1));
    const toDate = to ? new Date(to) : new Date();
    return this.financeService.getExpenseSummary(tenantId, fromDate, toDate);
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Xarajatni ochirish' })
  remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.financeService.deleteExpense(tenantId, id);
  }
}
