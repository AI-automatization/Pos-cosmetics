import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { RolesGuard } from '../identity/guards/roles.guard';
import { SalesController } from './sales.controller';

// GET /sales/orders carries @Roles('OWNER','ADMIN','MANAGER') but the controller
// only wired JwtAuthGuard — the role decorator was inert, so a CASHIER could list
// all orders. Wiring RolesGuard must activate the author's intended restriction.

function contextForHandler(
  handler: unknown,
  role: string | undefined,
): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => SalesController,
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
  } as unknown as ExecutionContext;
}

describe('SalesController RBAC', () => {
  const guard = new RolesGuard(new Reflector());
  const getOrders = SalesController.prototype.getOrders;

  it('wires RolesGuard on the controller', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, SalesController) ?? [];
    expect(guards).toContain(RolesGuard);
  });

  it('forbids a CASHIER from listing all orders', () => {
    expect(() =>
      guard.canActivate(contextForHandler(getOrders, 'CASHIER')),
    ).toThrow(ForbiddenException);
  });

  it('allows a MANAGER to list all orders', () => {
    expect(guard.canActivate(contextForHandler(getOrders, 'MANAGER'))).toBe(
      true,
    );
  });
});
