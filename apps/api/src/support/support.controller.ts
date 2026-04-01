import {
  Controller, Get, Post, Patch, Param, Body,
  Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SupportService } from './support.service';
import { CreateTicketDto, AddMessageDto, UpdateTicketStatusDto } from './dto/support.dto';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  // ─── POST /support/tickets — create ticket ────────────────────────────────

  @Post('tickets')
  @ApiOperation({ summary: 'T-305: Yangi tiket yaratish' })
  createTicket(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateTicketDto,
  ) {
    return this.supportService.createTicket(tenantId, userId, dto);
  }

  // ─── GET /support/tickets — list own tickets ──────────────────────────────

  @Get('tickets')
  @ApiOperation({ summary: 'T-305: O\'z tiketlari ro\'yxati' })
  listTickets(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    const isAdmin = (role === UserRole.OWNER || role === UserRole.ADMIN);
    return this.supportService.listTickets(tenantId, userId, isAdmin);
  }

  // ─── GET /support/tickets/:id ─────────────────────────────────────────────

  @Get('tickets/:id')
  @ApiOperation({ summary: 'T-305: Tiket detali (xabarlar bilan)' })
  getTicket(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
    @Param('id') ticketId: string,
  ) {
    return this.supportService.getTicket(tenantId, ticketId, userId, role);
  }

  // ─── POST /support/tickets/:id/messages ──────────────────────────────────

  @Post('tickets/:id/messages')
  @ApiOperation({ summary: 'T-305: Tiketga xabar qo\'shish' })
  addMessage(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
    @Param('id') ticketId: string,
    @Body() dto: AddMessageDto,
  ) {
    return this.supportService.addMessage(tenantId, ticketId, userId, role, dto);
  }

  // ─── PATCH /support/tickets/:id/status — OWNER/ADMIN ─────────────────────

  @Patch('tickets/:id/status')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'T-305: Tiket statusini o\'zgartirish (OWNER/ADMIN)' })
  updateStatus(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') ticketId: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.supportService.updateStatus(tenantId, ticketId, dto);
  }
}
