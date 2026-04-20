import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramNotifyService } from './telegram-notify.service';

interface ShiftClosedEvent {
  tenantId: string;
  shiftId: string;
  userId: string;
}

@Injectable()
export class ShiftAlertListener {
  private readonly logger = new Logger(ShiftAlertListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegram: TelegramNotifyService,
  ) {}

  @OnEvent('shift.closed')
  async handleShiftClosed(event: ShiftClosedEvent): Promise<void> {
    const { tenantId, shiftId } = event;

    try {
      const shift = await this.prisma.shift.findUnique({
        where: { id: shiftId },
        include: {
          user: { select: { firstName: true, lastName: true } },
          branch: { select: { name: true } },
          orders: {
            where: { status: 'COMPLETED' },
            include: {
              paymentIntents: { select: { method: true, amount: true } },
              returns: { select: { id: true } },
            },
          },
        },
      });

      if (!shift) return;

      const totalRevenue = shift.orders.reduce((s, o) => s + Number(o.total), 0);
      const totalOrders = shift.orders.length;
      const totalRefunds = shift.orders.reduce((s, o) => s + o.returns.length, 0);

      let cash = 0;
      let card = 0;
      for (const order of shift.orders) {
        for (const pi of order.paymentIntents) {
          const m = pi.method.toLowerCase();
          if (m === 'cash') cash += Number(pi.amount);
          else if (m === 'card' || m === 'terminal') card += Number(pi.amount);
        }
      }

      const owners = await this.prisma.user.findMany({
        where: {
          tenantId,
          role: { in: ['OWNER', 'ADMIN'] },
          isActive: true,
          telegramChatId: { not: null },
        },
        select: { telegramChatId: true },
      });

      for (const owner of owners) {
        if (!owner.telegramChatId) continue;

        await this.telegram.sendShiftSummary(owner.telegramChatId, {
          cashierName: `${shift.user?.firstName ?? ''} ${shift.user?.lastName ?? ''}`.trim(),
          branchName: shift.branch?.name ?? null,
          openedAt: shift.openedAt,
          closedAt: shift.closedAt!,
          totalOrders,
          totalRevenue,
          totalRefunds,
          cash,
          card,
        });
      }

      this.logger.log(`Shift summary sent to ${owners.length} owner(s)`, { tenantId, shiftId });
    } catch (err) {
      this.logger.error('Failed to send shift summary', {
        tenantId,
        shiftId,
        error: (err as Error).message,
      });
    }
  }
}
