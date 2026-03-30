import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/**
 * Restricts WAREHOUSE role to GET (read-only) requests only,
 * with explicit whitelist for specific POST endpoints.
 *
 * WAREHOUSE allowed writes:
 *   POST /catalog/suppliers  — create supplier during stock-in
 *   POST /catalog/products   — create product during stock-in
 *
 * WAREHOUSE blocked:
 *   PATCH, DELETE on any catalog/inventory endpoint
 */

/** Exact path suffixes WAREHOUSE may POST to */
const WAREHOUSE_POST_WHITELIST = [
  '/catalog/suppliers',
  '/catalog/products',
] as const;

@Injectable()
export class WarehouseReadOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role?: string }; method: string; path: string }>();
    const user = request.user;

    if (user?.role === 'WAREHOUSE' && request.method !== 'GET') {
      const path: string = request.path ?? '';
      const isAllowedPost =
        request.method === 'POST' &&
        WAREHOUSE_POST_WHITELIST.some((suffix) => path.endsWith(suffix));

      if (!isAllowedPost) {
        throw new ForbiddenException(
          'WAREHOUSE role has read-only access. Write operations require MANAGER or above.',
        );
      }
    }

    return true;
  }
}
