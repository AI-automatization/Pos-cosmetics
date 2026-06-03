import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { RolesGuard } from '../identity/guards/roles.guard';
import { InventoryController } from './inventory.controller';

// POST /inventory/warehouses carries @Roles('OWNER','ADMIN','MANAGER') but the
// controller only wired JwtAuthGuard — the role decorator was inert, so a CASHIER
// or WAREHOUSE user could create warehouses. Wiring RolesGuard must enforce it.

function contextForHandler(
  handler: unknown,
  role: string | undefined,
): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => InventoryController,
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
  } as unknown as ExecutionContext;
}

describe('InventoryController RBAC', () => {
  const guard = new RolesGuard(new Reflector());
  const createWarehouse = InventoryController.prototype.createWarehouse;

  it('wires RolesGuard on the controller', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, InventoryController) ?? [];
    expect(guards).toContain(RolesGuard);
  });

  it('forbids a CASHIER from creating warehouses', () => {
    expect(() =>
      guard.canActivate(contextForHandler(createWarehouse, 'CASHIER')),
    ).toThrow(ForbiddenException);
  });

  it('forbids a WAREHOUSE user from creating warehouses', () => {
    expect(() =>
      guard.canActivate(contextForHandler(createWarehouse, 'WAREHOUSE')),
    ).toThrow(ForbiddenException);
  });

  it('allows a MANAGER to create warehouses', () => {
    expect(
      guard.canActivate(contextForHandler(createWarehouse, 'MANAGER')),
    ).toBe(true);
  });
});
