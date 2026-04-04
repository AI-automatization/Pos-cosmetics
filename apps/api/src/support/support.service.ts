import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketSenderType, TicketStatus, UserRole } from '@prisma/client';
import { CreateTicketDto, AddMessageDto, UpdateTicketStatusDto } from './dto/support.dto';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── TENANT: Create ticket ────────────────────────────────────────────────

  async createTicket(tenantId: string, userId: string, dto: CreateTicketDto) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        tenantId,
        userId,
        subject: dto.subject,
        description: dto.description,
        priority: dto.priority,
      },
      include: { messages: true },
    });

    this.logger.log(`[Support] Ticket created: ${ticket.id}`, { tenantId, userId });
    return ticket;
  }

  // ─── TENANT: List own tickets ─────────────────────────────────────────────

  async listTickets(tenantId: string, userId: string, isAdmin = false) {
    return this.prisma.supportTicket.findMany({
      where: isAdmin ? { tenantId } : { tenantId, userId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });
  }

  // ─── TENANT: Get ticket detail ────────────────────────────────────────────

  async getTicket(tenantId: string, ticketId: string, userId: string, role: UserRole) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id: ticketId, tenantId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!ticket) throw new NotFoundException('Tiket topilmadi');

    const isAdmin = (role === UserRole.OWNER || role === UserRole.ADMIN);
    if (!isAdmin && ticket.userId !== userId) {
      throw new ForbiddenException('Bu tiketga kirish taqiqlangan');
    }

    return ticket;
  }

  // ─── TENANT: Add message ──────────────────────────────────────────────────

  async addMessage(tenantId: string, ticketId: string, userId: string, role: UserRole, dto: AddMessageDto) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id: ticketId, tenantId },
    });

    if (!ticket) throw new NotFoundException('Tiket topilmadi');

    const isAdmin = (role === UserRole.OWNER || role === UserRole.ADMIN);
    if (!isAdmin && ticket.userId !== userId) {
      throw new ForbiddenException('Bu tiketga kirish taqiqlangan');
    }

    if (ticket.status === TicketStatus.CLOSED) {
      throw new ForbiddenException('Yopilgan tiketga xabar yuborish mumkin emas');
    }

    const message = await this.prisma.ticketMessage.create({
      data: {
        tenantId,
        ticketId,
        senderType: isAdmin ? TicketSenderType.SUPPORT : TicketSenderType.USER,
        senderId: userId,
        message: dto.message,
      },
    });

    // Re-open ticket if user replies to RESOLVED ticket
    if (!isAdmin && ticket.status === TicketStatus.RESOLVED) {
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: TicketStatus.IN_PROGRESS },
      });
    }

    return message;
  }

  // ─── ADMIN: Update ticket status ──────────────────────────────────────────

  async updateStatus(tenantId: string, ticketId: string, dto: UpdateTicketStatusDto) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id: ticketId, tenantId },
    });

    if (!ticket) throw new NotFoundException('Tiket topilmadi');

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: dto.status },
    });
  }

  // ─── SUPER ADMIN: All tenants ─────────────────────────────────────────────

  async listAllTickets(status?: TicketStatus, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return { tickets, total, page, limit };
  }
}
