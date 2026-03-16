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

  @Get()
  @ApiOperation({ summary: 'List all shifts (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getShifts(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.salesService.getShifts(tenantId, limit, page);
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
