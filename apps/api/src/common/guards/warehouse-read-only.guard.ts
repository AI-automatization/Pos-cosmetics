import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/**
 * Restricts WAREHOUSE role to GET (read-only) requests only,
 * with explicit whitelist for allowed write operations.
 *
 * WAREHOUSE allowed writes:
 *   POST   /catalog/suppliers        — create supplier
 *   PATCH  /catalog/suppliers/:id    — edit supplier
 *   DELETE /catalog/suppliers/:id    — delete supplier
 *   POST   /catalog/products         — create product during stock-in
 *   PATCH  /catalog/products/:id     — edit product
 *   POST   /warehouse/invoices       — create invoice (stock-in)
 */

interface WriteRule {
  method: string;
  pathIncludes: string;
}

const WAREHOUSE_WRITE_WHITELIST: WriteRule[] = [
  { method: 'POST',   pathIncludes: '/catalog/suppliers' },
  { method: 'PATCH',  pathIncludes: '/catalog/suppliers' },
  { method: 'DELETE', pathIncludes: '/catalog/suppliers' },
  { method: 'POST',   pathIncludes: '/catalog/products' },
  { method: 'PATCH',  pathIncludes: '/catalog/products' },
  { method: 'POST',   pathIncludes: '/warehouse/invoices' },
];

@Injectable()
export class WarehouseReadOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role?: string }; method: string; path: string; url?: string }>();
    const user = request.user;

    if (user?.role === 'WAREHOUSE' && request.method !== 'GET') {
      const requestPath: string = (request.url ?? request.path ?? '').split('?')[0];
      const isAllowed = WAREHOUSE_WRITE_WHITELIST.some(
        (rule) => rule.method === request.method && requestPath.includes(rule.pathIncludes),
      );

      if (!isAllowed) {
        throw new ForbiddenException(
          'WAREHOUSE role has restricted write access.',
        );
      }
    }

    return true;
  }
}
