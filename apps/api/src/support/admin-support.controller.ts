import {
  Controller, Get, Query,
  DefaultValuePipe, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TicketStatus } from '@prisma/client';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../admin/guards/super-admin.guard';

// ─── ADMIN: All tenants ───────────────────────────────────────────────────────

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/support')
export class AdminSupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('tickets')
  @ApiOperation({ summary: 'T-305: Barcha tenantlardan tiketlar (Super Admin)' })
  @ApiQuery({ name: 'status', enum: TicketStatus, required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  listAllTickets(
    @Query('status') status?: TicketStatus,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.supportService.listAllTickets(status, page, limit);
  }
}
