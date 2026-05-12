import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

@Injectable()
export class LockoutHelper {
  private readonly logger = new Logger(LockoutHelper.name);

  constructor(private readonly prisma: PrismaService) {}

  async checkLock(userId: string): Promise<void> {
    const lock = await this.prisma.userLock.findUnique({ where: { userId } });
    if (lock && lock.lockedUntil > new Date()) {
      const remainMin = Math.ceil(
        (lock.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Hisob ${remainMin} daqiqa uchun bloklangan. Keyinroq urinib ko'ring.`,
      );
    }
    if (lock) {
      await this.prisma.userLock.delete({ where: { userId } }).catch(() => null);
    }
  }

  async recordAttempt(
    userId: string | null,
    email: string,
    ip: string,
    success: boolean,
  ): Promise<void> {
    try {
      await this.prisma.loginAttempt.create({
        data: { userId, email, ip, success },
      });

      if (!success && userId) {
        const since = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000);
        const failCount = await this.prisma.loginAttempt.count({
          where: { userId, success: false, createdAt: { gte: since } },
        });

        if (failCount >= MAX_FAILED_ATTEMPTS) {
          const lockedUntil = new Date(
            Date.now() + LOCKOUT_MINUTES * 60 * 1000,
          );
          await this.prisma.userLock.upsert({
            where: { userId },
            create: { userId, lockedUntil },
            update: { lockedUntil, lockedAt: new Date() },
          });
          this.logger.warn(
            `User locked for ${LOCKOUT_MINUTES}min: ${email}`,
          );
        }
      }
    } catch {
      // Attempt log xatoligi asosiy loginni to'xtatmaydi
    }
  }

  async unlockUser(adminUserId: string, targetUserId: string): Promise<void> {
    await this.prisma.userLock
      .delete({ where: { userId: targetUserId } })
      .catch(() => null);
    this.logger.log(
      `User unlocked by admin: target=${targetUserId}, admin=${adminUserId}`,
    );
  }
}
