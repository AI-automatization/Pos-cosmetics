import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NasiyaService } from './nasiya.service';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * /debts/* — DEPRECATED mobile alias for /nasiya/*.
 * Full CRUD lives at /nasiya/*. This controller provides read-only mobile summary endpoints.
 * T-326: path conflict resolution — canonical path is /nasiya/*.
 * @deprecated Use /nasiya/* for full functionality
 */
@ApiTags('Debts (deprecated alias — use /nasiya)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('debts')
export class DebtsController {
  constructor(private readonly nasiyaService: NasiyaService) {}

  // T-206: summary with branchId + aging buckets
  @Get('summary')
  @ApiOperation({ summary: 'T-206: Debt summary — { totalDebt, overdueDebt, overdueCount, aging }' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'branch_id', required: false })
  getSummary(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branchId') branchId?: string,
    @Query('branch_id') branchIdAlt?: string,
  ) {
    return this.nasiyaService.getSummary(tenantId, branchId ?? branchIdAlt);
  }

  @Get('aging-report')
  @ApiOperation({ summary: 'Debt aging report — buckets by overdue days' })
  getAgingReport(@CurrentUser('tenantId') tenantId: string) {
    return this.nasiyaService.getAgingReport(tenantId);
  }

  // T-206: customers with branchId + status filter + T-206 format
  @Get('customers')
  @ApiOperation({ summary: 'T-206: Customers with active debts — { customers: [CustomerDebt] }' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['current', 'overdue'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getCustomers(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branchId') branchId?: string,
    @Query('branch_id') branchIdAlt?: string,
    @Query('status') status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.nasiyaService.getDebtCustomers(tenantId, page, limit, {
      branchId: branchId ?? branchIdAlt,
      status,
    });
  }

  // Full debt detail with payment history and linked order items
  // NOTE: this must be declared after all static routes (summary, aging-report, customers)
  @Get(':id')
  @ApiOperation({ summary: 'Nasiya to\'liq ma\'lumotlari — to\'lov tarixi va buyurtma itemlari bilan' })
  @ApiParam({ name: 'id', type: String })
  getDebtDetail(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.nasiyaService.getDebtDetail(tenantId, id);
  }
}
