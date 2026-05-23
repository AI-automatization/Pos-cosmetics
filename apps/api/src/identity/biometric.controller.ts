import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { randomUUID, timingSafeEqual } from 'crypto';
import { CurrentUser, Public } from '../common/decorators';
import { RegisterBiometricDto, VerifyBiometricDto } from './dto';
import { IdentityService } from './identity.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { REFRESH_COOKIE, REFRESH_COOKIE_OPTIONS } from './auth.controller';

@ApiTags('Auth')
@Controller('auth')
export class BiometricController {
  constructor(
    private readonly identityService: IdentityService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── T-225: BIOMETRIC ─────────────────────────────────────────

  /**
   * POST /auth/biometric/register
   * Logged-in user device uchun biometric token yaratadi.
   * Token 30 kunlik, botSettings JSON da saqlanadi.
   */
  @Post('biometric/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'T-225: Qurilma uchun biometric token ro\'yxatdan o\'tkazish' })
  async registerBiometric(
    @CurrentUser('userId') userId: string,
    @Body() dto: RegisterBiometricDto,
  ) {
    const biometricToken = randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const existing = (user.botSettings ?? {}) as Record<string, unknown>;
    const keys = (existing['biometricKeys'] ?? {}) as Record<string, unknown>;

    keys[dto.deviceId] = {
      token: biometricToken,
      publicKey: dto.publicKey,
      expiresAt: expiresAt.toISOString(),
    };

    await this.prisma.user.update({
      where: { id: userId },
      data: { botSettings: { ...existing, biometricKeys: keys } as object },
    });

    return { success: true, biometricToken, expiresAt };
  }

  /**
   * POST /auth/biometric/verify
   * biometricToken + deviceId orqali foydalanuvchi identifikatsiya va JWT qaytaradi.
   */
  @Public()
  @Post('biometric/verify')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'T-225: Biometric token orqali login — JWT qaytaradi' })
  async verifyBiometric(
    @Body() dto: VerifyBiometricDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // T-346 fix 1: tenantId filter — cross-tenant full table scan bartaraf etildi
    const users = await this.prisma.user.findMany({
      where: { isActive: true, tenantId: dto.tenantId },
      select: { id: true, tenantId: true, email: true, role: true, firstName: true, lastName: true, botSettings: true },
    });

    const now = Date.now();
    let found: (typeof users)[0] | null = null;

    for (const u of users) {
      const settings = (u.botSettings ?? {}) as Record<string, unknown>;
      const keys = (settings['biometricKeys'] ?? {}) as Record<string, Record<string, string>>;
      const entry = keys[dto.deviceId];
      if (!entry || new Date(entry['expiresAt']).getTime() <= now) continue;

      // T-346 fix 2: timing attack — crypto.timingSafeEqual ishlatildi
      const storedBuf = Buffer.from(entry['token'] ?? '', 'utf8');
      const givenBuf = Buffer.from(dto.biometricToken, 'utf8');
      const tokenMatch =
        storedBuf.length === givenBuf.length &&
        timingSafeEqual(storedBuf, givenBuf);

      if (tokenMatch) {
        found = u;
        break;
      }
    }

    if (!found) {
      throw new UnauthorizedException('Biometric token yaroqsiz yoki muddati o\'tgan');
    }

    // Token muddatini yangilaymiz
    const settings = (found.botSettings ?? {}) as Record<string, unknown>;
    const keys = (settings['biometricKeys'] ?? {}) as Record<string, Record<string, string>>;
    keys[dto.deviceId] = {
      ...keys[dto.deviceId],
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    };
    await this.prisma.user.update({
      where: { id: found.id },
      data: { botSettings: { ...settings, biometricKeys: keys } as object },
    });

    const tokens = await this.identityService.loginById(found.id);
    // T-347: refreshToken httpOnly cookie — body dan olib tashlandi
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    return {
      accessToken: tokens.accessToken,
      user: {
        id: found.id,
        email: found.email,
        firstName: found.firstName,
        lastName: found.lastName,
        role: found.role,
        tenantId: found.tenantId,
      },
    };
  }
}
