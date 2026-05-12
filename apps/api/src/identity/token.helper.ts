import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './strategies/jwt.strategy';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const BCRYPT_ROUNDS = 12;

@Injectable()
export class TokenHelper {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: JwtPayload): Promise<AuthTokens> {
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = randomUUID();
    return { accessToken, refreshToken };
  }

  async saveRefreshToken(userId: string, rawRefreshToken: string): Promise<void> {
    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const days = parseInt(refreshExpiresIn, 10) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const hashedToken = await bcrypt.hash(rawRefreshToken, BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: hashedToken,
        refreshTokenExp: expiresAt,
      },
    });
  }
}
