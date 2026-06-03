import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { RolesGuard } from '../identity/guards/roles.guard';
import { SupportController } from './support.controller';

// PATCH /support/tickets/:id/status carries @Roles(OWNER, ADMIN) but the
// controller only wired JwtAuthGuard — the role decorator was inert, so any
// authenticated user could change ticket status. Wiring RolesGuard enforces it.

function contextForHandler(
  handler: unknown,
  role: string | undefined,
): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => SupportController,
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
  } as unknown as ExecutionContext;
}

describe('SupportController RBAC', () => {
  const guard = new RolesGuard(new Reflector());
  const updateStatus = SupportController.prototype.updateStatus;

  it('wires RolesGuard on the controller', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, SupportController) ?? [];
    expect(guards).toContain(RolesGuard);
  });

  it('forbids a CASHIER from updating ticket status', () => {
    expect(() =>
      guard.canActivate(contextForHandler(updateStatus, 'CASHIER')),
    ).toThrow(ForbiddenException);
  });

  it('allows an ADMIN to update ticket status', () => {
    expect(guard.canActivate(contextForHandler(updateStatus, 'ADMIN'))).toBe(
      true,
    );
  });
});
