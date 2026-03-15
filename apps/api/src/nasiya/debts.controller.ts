import {
  Controller,
  Get,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { NasiyaService } from './nasiya.service';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * /debts/* — top-level alias for mobile-owner app.
 * Backend stores debt data under /nasiya/*, this controller delegates to NasiyaService.
 */
@ApiTags('Debts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('debts')
export class DebtsController {
  constructor(private readonly nasiyaService: NasiyaService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Debt summary — totalDebt, overdueDebt, debtorCount, avgDebt' })
  getSummary(@CurrentUser('tenantId') tenantId: string) {
    return this.nasiyaService.getSummary(tenantId);
  }

  @Get('aging-report')
  @ApiOperation({ summary: 'Debt aging report — buckets by overdue days' })
  getAgingReport(@CurrentUser('tenantId') tenantId: string) {
    return this.nasiyaService.getAgingReport(tenantId);
  }

  @Get('customers')
  @ApiOperation({ summary: 'Customers with active debts (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getCustomers(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.nasiyaService.getDebtCustomers(tenantId, page, limit);
  }
}
