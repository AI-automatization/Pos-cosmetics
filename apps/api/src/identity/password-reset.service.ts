import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/cache/cache.service';
import { EmailNotifyService } from '../notifications/email-notify.service';
import { AuditService } from '../audit/audit.service';

const BCRYPT_ROUNDS = 12;
const OTP_TTL_SECONDS = 600; // 10 minutes
const OTP_PREFIX = 'pwd-otp';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly emailService: EmailNotifyService,
    private readonly auditService: AuditService,
  ) {}

  /** Step 1: Generate OTP and send to email */
  async forgotPassword(email: string, slug: string): Promise<{ sent: boolean }> {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) {
      // Don't reveal if tenant exists — return success anyway
      return { sent: true };
    }

    const user = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email } },
    });
    if (!user) {
      // Don't reveal if user exists
      return { sent: true };
    }

    // Generate 6-digit OTP
    const otp = String(randomInt(100000, 999999));
    const cacheKey = `${OTP_PREFIX}:${tenant.id}:${email}`;

    await this.cache.set(cacheKey, otp, OTP_TTL_SECONDS);

    // Send OTP via email
    const sent = await this.emailService.sendOtp(email, otp);
    if (!sent) {
      this.logger.warn(`Failed to send OTP to ${email}`);
    }

    this.logger.log(`Password reset OTP sent to ${email}`, { tenantId: tenant.id });
    return { sent: true };
  }

  /** Step 2: Verify OTP and set new password */
  async resetPassword(
    email: string,
    slug: string,
    otp: string,
    newPassword: string,
  ): Promise<{ success: boolean }> {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) {
      throw new BadRequestException('Noto\'g\'ri ma\'lumotlar');
    }

    const user = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email } },
    });
    if (!user) {
      throw new BadRequestException('Noto\'g\'ri ma\'lumotlar');
    }

    // Verify OTP from Redis
    const cacheKey = `${OTP_PREFIX}:${tenant.id}:${email}`;
    const storedOtp = await this.cache.get<string>(cacheKey);

    if (!storedOtp || storedOtp !== otp) {
      throw new BadRequestException('Noto\'g\'ri yoki muddati o\'tgan kod');
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Delete OTP
    await this.cache.del(cacheKey);

    // Audit
    void this.auditService.log({
      tenantId: tenant.id,
      userId: user.id,
      action: 'PASSWORD_RESET',
      entityType: 'User',
      entityId: user.id,
    });

    this.logger.log(`Password reset completed for ${email}`, { tenantId: tenant.id });
    return { success: true };
  }

  /** Change password (logged-in user) */
  async changePassword(
    userId: string,
    tenantId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean }> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      select: { id: true, email: true, passwordHash: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('Joriy parol noto\'g\'ri');
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Send notification email (non-blocking)
    void this.emailService.sendMail(
      user.email,
      'RAOS — Parolingiz o\'zgartirildi',
      `<p>Sizning parolingiz muvaffaqiyatli o'zgartirildi.</p>
       <p>Agar bu siz bo'lmasangiz — darhol administratorga murojaat qiling.</p>`,
    );

    void this.auditService.log({
      tenantId,
      userId,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: user.id,
    });

    this.logger.log(`Password changed for user ${userId}`);
    return { success: true };
  }
}
