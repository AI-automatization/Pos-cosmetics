import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

/**
 * Guard: faqat SUPER_ADMIN yoki SUPPORT rolga ega admin userlarga ruxsat beradi.
 * JwtAuthGuard dan keyin qo'llaniladi.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: { isAdmin?: boolean; role?: string } }>();
    const user = request.user;

    if (!user?.isAdmin) {
      throw new ForbiddenException('Faqat Super Admin uchun');
    }

    if (!['SUPER_ADMIN', 'SUPPORT'].includes(user.role ?? '')) {
      throw new ForbiddenException('Yetarli huquq yo\'q');
    }

    return true;
  }
}
