import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

/**
 * T-103: FCM Push Notification Service
 *
 * Firebase Admin SDK ishlatadi.
 * FIREBASE_SERVICE_ACCOUNT_JSON env da base64-encoded JSON bo'lishi kerak.
 *
 * Aktivlashtirish:
 *   pnpm add firebase-admin
 *   FIREBASE_SERVICE_ACCOUNT_JSON=<base64 of serviceAccountKey.json>
 */

export type PushNotificationType =
  | 'SALE_COMPLETED'
  | 'SHIFT_CHANGED'
  | 'ERROR_ALERT'
  | 'LOW_STOCK'
  | 'EXPIRY_WARNING'
  | 'LARGE_REFUND'
  | 'NASIYA_OVERDUE'
  | 'SYSTEM';

export interface PushPayload {
  type: PushNotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private firebaseApp: any = null;
  private initialized = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.init().catch((e) =>
      this.logger.warn('[FCM] Firebase init failed (disabled):', e.message),
    );
  }

  private async init() {
    const b64 = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON');
    if (!b64) {
      this.logger.warn('[FCM] FIREBASE_SERVICE_ACCOUNT_JSON not set — push disabled');
      return;
    }

    try {
      // Dynamic import — firebase-admin ixtiyoriy dep
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const admin = require('firebase-admin');
      const serviceAccount = JSON.parse(
        Buffer.from(b64, 'base64').toString('utf8'),
      );

      if (admin.apps.length === 0) {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else {
        this.firebaseApp = admin.apps[0];
      }
      this.initialized = true;
      this.logger.log('[FCM] Firebase Admin initialized');
    } catch (err) {
      this.logger.error('[FCM] Firebase Admin init error', {
        error: (err as Error).message,
      });
    }
  }

  // ─── Foydalanuvchi FCM tokenini saqlash ──────────────────────

  async registerToken(userId: string, tenantId: string, token: string, platform = 'android') {
    await this.prisma.fcmToken.upsert({
      where: { token },
      create: { userId, tenantId, token, platform },
      update: { userId, tenantId, platform },
    });
    this.logger.log(`[FCM] Token registered for user ${userId} (${platform})`);
  }

  async removeToken(token: string) {
    await this.prisma.fcmToken.deleteMany({ where: { token } });
  }

  // ─── Foydalanuvchiga push yuborish ────────────────────────────

  async sendToUser(
    tenantId: string,
    userId: string,
    payload: PushPayload,
  ): Promise<number> {
    // In-app notification yaratish (har doim)
    await this.prisma.notification.create({
      data: {
        tenantId,
        userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: (payload.data ?? undefined) as any,
      },
    });

    if (!this.initialized || !this.firebaseApp) return 0;

    const tokens = await this.prisma.fcmToken.findMany({
      where: { userId, tenantId },
      select: { token: true },
    });

    if (!tokens.length) return 0;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const admin = require('firebase-admin');
    let sent = 0;
    const invalidTokens: string[] = [];

    for (const { token } of tokens) {
      try {
        await admin.messaging(this.firebaseApp).send({
          token,
          notification: { title: payload.title, body: payload.body },
          data: payload.data ?? {},
          android: { priority: 'high' },
        });
        sent++;
      } catch (err) {
        const errCode = (err as { errorInfo?: { code?: string } }).errorInfo?.code;
        if (
          errCode === 'messaging/invalid-registration-token' ||
          errCode === 'messaging/registration-token-not-registered'
        ) {
          invalidTokens.push(token);
        }
        this.logger.warn(`[FCM] Send failed for user ${userId}`, {
          error: (err as Error).message,
        });
      }
    }

    // Eskirgan tokenlarni tozalash
    if (invalidTokens.length) {
      await this.prisma.fcmToken.deleteMany({
        where: { token: { in: invalidTokens } },
      });
    }

    return sent;
  }

  // ─── Tenant dagi barcha OWNER/ADMIN larga yuborish ───────────

  async sendToTenantAdmins(tenantId: string, payload: PushPayload): Promise<number> {
    const admins = await this.prisma.user.findMany({
      where: {
        tenantId,
        role: { in: ['OWNER', 'ADMIN'] },
        isActive: true,
      },
      select: { id: true },
    });

    let total = 0;
    for (const admin of admins) {
      total += await this.sendToUser(tenantId, admin.id, payload);
    }
    return total;
  }

  // ─── Barcha aktiv tenantlar ga alert ─────────────────────────
  // Masalan: low stock alert — ham in-app, ham push

  async broadcastLowStock(tenantId: string, productName: string, stock: number) {
    return this.sendToTenantAdmins(tenantId, {
      type: 'LOW_STOCK',
      title: '⚠️ Kam qoldiq ogohlantirish',
      body: `${productName}: ${stock} dona qoldi (minimum dan past)`,
      data: { productName, stock: String(stock) },
    });
  }

  async broadcastExpiryWarning(tenantId: string, productName: string, daysLeft: number) {
    return this.sendToTenantAdmins(tenantId, {
      type: 'EXPIRY_WARNING',
      title: '📅 Muddati yaqinlashmoqda',
      body: `${productName}: ${daysLeft} kun qoldi`,
      data: { productName, daysLeft: String(daysLeft) },
    });
  }

  async broadcastLargeRefund(tenantId: string, amount: number, cashier: string) {
    return this.sendToTenantAdmins(tenantId, {
      type: 'LARGE_REFUND',
      title: '🔴 Katta qaytarish',
      body: `${cashier} tomonidan ${amount.toLocaleString()} so'm qaytarildi`,
      data: { amount: String(amount), cashier },
    });
  }
}
