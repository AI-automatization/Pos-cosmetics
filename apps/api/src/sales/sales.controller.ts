import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { OpenShiftDto, CloseShiftDto, CreateOrderDto, CreateReturnDto } from './dto';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // ─── SHIFTS ───────────────────────────────────────────────────

  @Post('shifts/open')
  @ApiOperation({ summary: 'Open a new shift' })
  openShift(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: OpenShiftDto,
  ) {
    return this.salesService.openShift(tenantId, userId, dto);
  }

  @Post('shifts/:id/close')
  @ApiOperation({ summary: 'Close shift by ID' })
  @ApiParam({ name: 'id', type: String })
  closeShift(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CloseShiftDto,
  ) {
    return this.salesService.closeShift(tenantId, userId, id, dto);
  }

  @Get('shifts/current')
  @ApiOperation({ summary: 'Get current open shift for user' })
  getCurrentShift(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.salesService.getCurrentShift(tenantId, userId);
  }

  @Get('shifts')
  @ApiOperation({ summary: 'List all shifts (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getShifts(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.salesService.getShifts(tenantId, limit, page);
  }

  // ─── T-223: GET /shifts/summary ───────────────────────────────
  @Get('shifts/summary')
  @ApiOperation({ summary: 'T-223: Shift summary — total revenue, orders, shifts' })
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

  // ─── T-223: GET /shifts/:id ────────────────────────────────────
  @Get('shifts/:id')
  @ApiOperation({ summary: 'T-223: Shift details by ID with payment breakdown' })
  @ApiParam({ name: 'id', type: String })
  getShiftById(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.salesService.getShiftById(tenantId, id);
  }

  // ─── ORDERS ───────────────────────────────────────────────────

  @Post('orders')
  @ApiOperation({ summary: 'Create order (POS sale)' })
  createOrder(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') userRole: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.salesService.createOrder(tenantId, userId, dto, userRole as UserRole);
  }

  @Get('orders')
  @ApiOperation({ summary: 'List orders (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'shiftId', required: false })
  getOrders(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('shiftId') shiftId?: string,
  ) {
    return this.salesService.getOrders(tenantId, { page, limit, shiftId });
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', type: String })
  getOrder(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.salesService.getOrderById(tenantId, id);
  }

  @Get('orders/:id/receipt')
  @ApiOperation({ summary: 'Get receipt data for order (ESC/POS ready)' })
  @ApiParam({ name: 'id', type: String })
  getReceipt(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.salesService.getReceipt(tenantId, id);
  }

  // ─── RETURNS ──────────────────────────────────────────────────

  @Post('returns')
  @ApiOperation({ summary: 'Create return request' })
  createReturn(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateReturnDto,
  ) {
    return this.salesService.createReturn(tenantId, userId, dto);
  }

  @Patch('returns/:id/approve')
  @ApiOperation({ summary: 'Approve return (manager/admin)' })
  @ApiParam({ name: 'id', type: String })
  approveReturn(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.salesService.approveReturn(tenantId, userId, id);
  }
}
