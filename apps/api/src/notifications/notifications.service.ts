import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const REMINDER_TYPES = {
  DUE_SOON: 'DUE_SOON',    // muddati yaqin (3 kun ichida)
  OVERDUE: 'OVERDUE',       // muddati o'tgan
} as const;

type ReminderType = keyof typeof REMINDER_TYPES;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── DEBT REMINDERS ───────────────────────────────────────────

  /**
   * Muddati yaqin qarzlarni topish (due_date dan 3 kun oldin).
   * Bugun allaqachon eslatma yuborilmaganlar qaytariladi.
   * tenantId ko'rsatilmasa — barcha tenantlar uchun.
   */
  async getDueSoonDebts(tenantId?: string, daysBefore = 3) {
    const now = new Date();
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysBefore);

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const debts = await this.prisma.debtRecord.findMany({
      where: {
        ...(tenantId && { tenantId }),
        status: { in: ['ACTIVE', 'PARTIAL'] },
        dueDate: { gte: now, lte: threshold },
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        tenant: { select: { id: true, name: true } },
      },
    });

    // Bugun allaqachon eslatma yuborilganlarni olib tashlash
    const sentToday = await this.prisma.reminderLog.findMany({
      where: {
        debtId: { in: debts.map((d) => d.id) },
        type: REMINDER_TYPES.DUE_SOON,
        sentAt: { gte: todayStart },
      },
      select: { debtId: true },
    });

    const sentIds = new Set(sentToday.map((r) => r.debtId));
    return debts.filter((d) => !sentIds.has(d.id));
  }

  /**
   * Muddati o'tgan qarzlar.
   * Eslatma tartibi: birinchi 3 kun — kunlik, keyin — haftalik.
   */
  async getOverdueDebts(tenantId?: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(todayStart);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const debts = await this.prisma.debtRecord.findMany({
      where: {
        ...(tenantId && { tenantId }),
        status: { in: ['ACTIVE', 'PARTIAL', 'OVERDUE'] },
        dueDate: { lt: now },
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        tenant: { select: { id: true, name: true } },
      },
    });

    const result = [];

    for (const debt of debts) {
      const dueDate = debt.dueDate!;
      const overdueDays = Math.floor(
        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      // 1-3 kun: kunlik eslatma
      // 4+ kun: haftalik eslatma
      const lastReminderSince =
        overdueDays <= 3 ? todayStart : weekAgo;

      const alreadySent = await this.prisma.reminderLog.count({
        where: {
          debtId: debt.id,
          type: REMINDER_TYPES.OVERDUE,
          sentAt: { gte: lastReminderSince },
        },
      });

      if (alreadySent === 0) {
        result.push({ ...debt, overdueDays });
      }
    }

    return result;
  }

  /**
   * Eslatma yuborish (log + DB yozish).
   * Haqiqiy Telegram/SMS yuborish uchun kanal qo'shiladi.
   */
  async sendReminder(params: {
    tenantId: string;
    debtId: string;
    customerId: string;
    type: ReminderType;
    customerName: string;
    tenantName: string;
    remaining: number;
    dueDate: Date | null;
    channel?: string;
  }) {
    const {
      tenantId, debtId, customerId, type,
      customerName, tenantName, remaining, dueDate,
    } = params;

    const dueDateStr = dueDate
      ? dueDate.toLocaleDateString('uz-UZ')
      : 'ko\'rsatilmagan';

    const message =
      type === REMINDER_TYPES.DUE_SOON
        ? `Hurmatli ${customerName}, "${tenantName}" do'konida ${remaining.toLocaleString()} so'm qarzingiz bor. Muddati: ${dueDateStr}. Iltimos vaqtida to'lang.`
        : `Hurmatli ${customerName}, "${tenantName}" do'konida ${remaining.toLocaleString()} so'm qarzingizning muddati o'tgan (${dueDateStr}). Iltimos tezroq bog'laning.`;

    await this.prisma.reminderLog.create({
      data: {
        tenantId,
        debtId,
        customerId,
        type,
        channel: params.channel ?? 'LOG',
        message,
      },
    });

    this.logger.log(
      `[${type}] Eslatma yuborildi: customer=${customerName}, qarz=${remaining}`,
      { tenantId, debtId },
    );

    return { message, type };
  }

  /**
   * Barcha pending eslatmalarni tekshirib yuborish.
   * Bot yoki tashqi cron dan chaqiriladi.
   */
  async runDebtReminders(tenantId?: string) {
    const [dueSoon, overdue] = await Promise.all([
      this.getDueSoonDebts(tenantId),
      this.getOverdueDebts(tenantId),
    ]);

    const results = { dueSoon: 0, overdue: 0, errors: 0 };

    for (const debt of dueSoon) {
      try {
        await this.sendReminder({
          tenantId: debt.tenantId,
          debtId: debt.id,
          customerId: debt.customerId,
          type: 'DUE_SOON',
          customerName: debt.customer.name,
          tenantName: debt.tenant.name,
          remaining: Number(debt.remaining),
          dueDate: debt.dueDate,
        });
        results.dueSoon++;
      } catch {
        results.errors++;
      }
    }

    for (const debt of overdue) {
      try {
        await this.sendReminder({
          tenantId: debt.tenantId,
          debtId: debt.id,
          customerId: debt.customerId,
          type: 'OVERDUE',
          customerName: debt.customer.name,
          tenantName: debt.tenant.name,
          remaining: Number(debt.remaining),
          dueDate: debt.dueDate,
        });
        results.overdue++;

        // Status ni OVERDUE ga yangilash
        await this.prisma.debtRecord.update({
          where: { id: debt.id },
          data: { status: 'OVERDUE' },
        });
      } catch {
        results.errors++;
      }
    }

    this.logger.log(
      `Reminder run: ${results.dueSoon} due-soon, ${results.overdue} overdue, ${results.errors} errors`,
    );
    return results;
  }

  // ─── REMINDER LOGS ────────────────────────────────────────────

  async getReminderLogs(
    tenantId: string,
    opts: { page?: number; limit?: number; type?: string },
  ) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 50;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(opts.type && { type: opts.type }),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.reminderLog.count({ where }),
      this.prisma.reminderLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sentAt: 'desc' },
      }),
    ]);

    return { items, total, page, limit };
  }

  // ─── IN-APP NOTIFICATIONS (T-103) ─────────────────────────────

  async getNotifications(
    userId: string,
    tenantId: string,
    opts: { page?: number; limit?: number; unreadOnly?: boolean },
  ) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      tenantId,
      ...(opts.unreadOnly && { isRead: false }),
    };

    const [total, items, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId, tenantId, isRead: false } }),
    ]);

    return { items, total, page, limit, unreadCount };
  }

  async markAsRead(userId: string, tenantId: string, notificationId: string) {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId, tenantId },
      data: { isRead: true },
    });
    return { success: true };
  }

  async markAllAsRead(userId: string, tenantId: string) {
    const { count } = await this.prisma.notification.updateMany({
      where: { userId, tenantId, isRead: false },
      data: { isRead: true },
    });
    return { success: true, count };
  }

  async getUnreadCount(userId: string, tenantId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, tenantId, isRead: false },
    });
    return { count };
  }

  // ─── T-203: OWNER ALERTS FEED ─────────────────────────────────
  // Tenant-wide (not user-specific) — for mobile-owner dashboard

  async getOwnerAlerts(
    tenantId: string,
    opts: {
      type?: string;
      isRead?: boolean;
      branchId?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = Math.max(opts.page ?? 1, 1);
    const limit = Math.min(opts.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId };
    if (opts.type) where['type'] = opts.type;
    if (opts.isRead !== undefined) where['isRead'] = opts.isRead;
    if (opts.branchId) {
      where['data'] = { path: ['branchId'], equals: opts.branchId };
    }

    const [total, rows, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { tenantId, isRead: false } }),
    ]);

    const items = rows.map((n) => {
      const meta = (n.data ?? {}) as Record<string, unknown>;
      return {
        id: n.id,
        type: n.type,
        description: n.body,
        branchId: (meta['branchId'] as string) ?? null,
        branchName: (meta['branchName'] as string) ?? null,
        isRead: n.isRead,
        createdAt: n.createdAt,
        metadata: meta,
      };
    });

    return { items, total, page, limit, unreadCount };
  }

  async markOwnerAlertAsRead(tenantId: string, id: string) {
    await this.prisma.notification.updateMany({
      where: { id, tenantId },
      data: { isRead: true },
    });
    return { success: true };
  }

  async markAllOwnerAlertsAsRead(tenantId: string) {
    const { count } = await this.prisma.notification.updateMany({
      where: { tenantId, isRead: false },
      data: { isRead: true },
    });
    return { success: true, count };
  }
}
