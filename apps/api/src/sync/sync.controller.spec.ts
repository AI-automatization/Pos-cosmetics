import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { RolesGuard } from '../identity/guards/roles.guard';
import { SyncController } from './sync.controller';

// GET /sync/status carries @Roles(OWNER, ADMIN, MANAGER) but the controller only
// wired JwtAuthGuard — the role decorator was inert, so any authenticated user
// could read pending/failed sync events. Wiring RolesGuard enforces it.

function contextForHandler(
  handler: unknown,
  role: string | undefined,
): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => SyncController,
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
  } as unknown as ExecutionContext;
}

describe('SyncController RBAC', () => {
  const guard = new RolesGuard(new Reflector());
  const status = SyncController.prototype.status;

  it('wires RolesGuard on the controller', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, SyncController) ?? [];
    expect(guards).toContain(RolesGuard);
  });

  it('forbids a CASHIER from reading sync status', () => {
    expect(() =>
      guard.canActivate(contextForHandler(status, 'CASHIER')),
    ).toThrow(ForbiddenException);
  });

  it('allows a MANAGER to read sync status', () => {
    expect(guard.canActivate(contextForHandler(status, 'MANAGER'))).toBe(true);
  });
});
