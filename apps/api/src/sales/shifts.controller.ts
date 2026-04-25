import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * /shifts/* — top-level alias for mobile-owner app.
 * Backend stores shifts under /sales/shifts/*, this controller delegates to SalesService.
 */
@ApiTags('Shifts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly salesService: SalesService) {}

  // ─── T-205: paginated shifts with branchId/status filter ────
  @Get()
  @ApiOperation({ summary: 'T-205: Paginated shifts — OWNER sees all branches, CASHIER sees own' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['open', 'closed'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getShifts(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
    @Query('branchId') branchId?: string,
    @Query('branch_id') branchIdAlt?: string,
    @Query('status') status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.salesService.getShifts(tenantId, limit, page, {
      branchId: branchId ?? branchIdAlt,
      status,
      userId,
      role,
    });
  }

  @Get('current')
  @ApiOperation({ summary: 'T-138: Current open shift with stats (cashierName, totalRevenue, ordersCount, etc.)' })
  getCurrentShift(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.salesService.getCurrentShift(tenantId, userId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Shift summary — total revenue, orders, shifts' })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({ name: 'from_date', required: false })
  @ApiQuery({ name: 'to_date', required: false })
  getShiftSummary(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branch_id') branchId?: string,
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
  ) {
    return this.salesService.getShiftSummary(tenantId, { branchId, fromDate, toDate });
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active (open) shifts' })
  @ApiQuery({ name: 'branch_id', required: false })
  getActiveShifts(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branch_id') branchId?: string,
  ) {
    return this.salesService.getActiveShifts(tenantId, branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Shift details by ID with payment breakdown' })
  @ApiParam({ name: 'id', type: String })
  getShiftById(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.salesService.getShiftById(tenantId, id);
  }
}
