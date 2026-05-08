import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators';
import { PrismaService } from '../../prisma/prisma.service';

const TENANT_CACHE_TTL = 60_000; // 60 seconds

@Injectable()
export class TenantGuard implements CanActivate {
  private cache = new Map<string, { isActive: boolean; expiresAt: number }>();

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Super Admin / Admin — tenantId yo'q, lekin ruxsat beriladi
    if (user?.isAdmin) {
      return true;
    }

    if (!user?.tenantId) {
      return false;
    }

    const isActive = await this.isTenantActive(user.tenantId);

    if (!isActive) {
      throw new ForbiddenException('Tenant is deactivated');
    }

    return true;
  }

  private async isTenantActive(tenantId: string): Promise<boolean> {
    const cached = this.cache.get(tenantId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.isActive;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { isActive: true },
    });

    const isActive = tenant?.isActive ?? false;
    this.cache.set(tenantId, { isActive, expiresAt: Date.now() + TENANT_CACHE_TTL });

    // Prevent memory leak — clean stale entries periodically
    if (this.cache.size > 1000) {
      const now = Date.now();
      for (const [key, val] of this.cache) {
        if (val.expiresAt < now) this.cache.delete(key);
      }
    }

    return isActive;
  }
}
