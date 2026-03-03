import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

// PIN kerak bo'ladigan operatsiyalar
export const PIN_ACTIONS = [
  'REFUND',
  'VOID',
  'DISCOUNT_HIGH',
  'PRICE_CHANGE',
  'SHIFT_CLOSE',
  'CASH_DRAWER',
] as const;

export type PinAction = (typeof PIN_ACTIONS)[number];

const BCRYPT_ROUNDS = 12;
const MAX_PIN_ATTEMPTS = 3;
const PIN_LOCK_MINUTES = 5;

@Injectable()
export class PinService {
  private readonly logger = new Logger(PinService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── SET PIN ──────────────────────────────────────────────────

  /**
   * PIN o'rnatish (birinchi marta yoki reset).
   * Agar pin_hash allaqachon mavjud bo'lsa — eski PIN kerak.
   */
  async setPin(userId: string, pin: string, oldPin?: string): Promise<void> {
    this.validatePinFormat(pin);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, pinHash: true },
    });

    if (!user) throw new UnauthorizedException('Foydalanuvchi topilmadi');

    // Agar PIN allaqachon o'rnatilgan bo'lsa — eski PIN kerak
    if (user.pinHash) {
      if (!oldPin) {
        throw new BadRequestException('Eski PIN kiritilishi kerak');
      }
      const valid = await bcrypt.compare(oldPin, user.pinHash);
      if (!valid) {
        throw new UnauthorizedException('Eski PIN noto\'g\'ri');
      }
    }

    const pinHash = await bcrypt.hash(pin, BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id: userId },
      data: { pinHash, pinLockedUntil: null },
    });

    this.logger.log(`PIN set for user ${userId}`);
  }

  // ─── VERIFY PIN ───────────────────────────────────────────────

  /**
   * PIN tekshirish operatsiya uchun.
   * 3 marta noto'g'ri → 5 daqiqa PIN lock.
   */
  async verifyPin(userId: string, pin: string, action: PinAction): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, pinHash: true, pinLockedUntil: true },
    });

    if (!user) throw new UnauthorizedException('Foydalanuvchi topilmadi');

    if (!user.pinHash) {
      throw new BadRequestException(
        'PIN o\'rnatilmagan. Avval POST /auth/pin/set orqali PIN o\'rnating.',
      );
    }

    // Lock tekshirish
    if (user.pinLockedUntil && user.pinLockedUntil > new Date()) {
      const remainMin = Math.ceil((user.pinLockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(
        `PIN ${remainMin} daqiqa uchun bloklangan. Keyinroq urinib ko'ring.`,
      );
    }

    const isValid = await bcrypt.compare(pin, user.pinHash);

    // Log attempt
    await this.prisma.pinAttempt.create({
      data: { userId, success: isValid, action },
    });

    if (!isValid) {
      // So'nggi 5 daqiqa ichida noto'g'ri urinishlar
      const since = new Date(Date.now() - PIN_LOCK_MINUTES * 60 * 1000);
      const failCount = await this.prisma.pinAttempt.count({
        where: { userId, success: false, createdAt: { gte: since } },
      });

      if (failCount >= MAX_PIN_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + PIN_LOCK_MINUTES * 60 * 1000);
        await this.prisma.user.update({
          where: { id: userId },
          data: { pinLockedUntil: lockUntil },
        });
        this.logger.warn(`PIN locked for ${PIN_LOCK_MINUTES}min: userId=${userId}`);
        throw new UnauthorizedException(
          `${MAX_PIN_ATTEMPTS} marta noto'g'ri PIN. ${PIN_LOCK_MINUTES} daqiqa kutish kerak.`,
        );
      }

      throw new UnauthorizedException(`PIN noto'g'ri (${failCount}/${MAX_PIN_ATTEMPTS} urinish)`);
    }

    // Muvaffaqiyatli — agar lock bor bo'lsa olib tashlash
    if (user.pinLockedUntil) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { pinLockedUntil: null },
      });
    }

    return true;
  }

  // ─── HELPERS ─────────────────────────────────────────────────

  private validatePinFormat(pin: string): void {
    if (!/^\d{4,6}$/.test(pin)) {
      throw new BadRequestException('PIN 4-6 ta raqamdan iborat bo\'lishi kerak');
    }
  }

  hasPinSet(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { pinHash: true },
    }).then((u) => !!u?.pinHash);
  }
}
