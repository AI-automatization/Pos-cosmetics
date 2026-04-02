import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/**
 * Restricts WAREHOUSE role to GET (read-only) requests only.
 * Apply at controller class level for catalog-type controllers.
 */
@Injectable()
export class WarehouseReadOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: { role?: string }; method: string }>();
    const user = request.user;

    if (user?.role === 'WAREHOUSE' && request.method !== 'GET') {
      throw new ForbiddenException(
        'WAREHOUSE role has read-only access. Write operations require MANAGER or above.',
      );
    }

    return true;
  }
}
