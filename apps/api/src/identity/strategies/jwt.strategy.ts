import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  tenantId: string | null;
  role: string;
  branchId: string | null;
  isAdmin?: boolean;
  hasPosAccess?: boolean;
  hasAdminAccess?: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // ─── Super Admin / Support ─────────────────────────────────
    if (payload.isAdmin) {
      const admin = await this.prisma.adminUser.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, name: true, role: true, isActive: true },
      });

      if (!admin || !admin.isActive) {
        throw new UnauthorizedException('Admin user not found or deactivated');
      }

      return {
        userId: admin.id,
        tenantId: null,
        email: admin.email,
        firstName: admin.name,
        lastName: '',
        role: admin.role,
        branchId: null,
        isAdmin: true,
      };
    }

    // ─── Regular tenant user ───────────────────────────────────
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        tenantId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or deactivated');
    }

    return {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      branchId: payload.branchId,
      isAdmin: false,
    };
  }
}
