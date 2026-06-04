import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Roles, Public } from '../../common/decorators';

// Once RolesGuard is registered as a global APP_GUARD it runs on EVERY route.
// A @Public() webhook that sits under a class-level @Roles (e.g. payments
// webhooks inheriting the controller roles) would otherwise be evaluated with
// user=undefined and rejected. RolesGuard must honour @Public like the JWT and
// tenant guards do.

function contextFor(handler: unknown, klass: unknown, role?: string): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => klass,
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
  } as unknown as ExecutionContext;
}

// A controller whose class declares roles, but one handler is @Public —
// mirrors payments.controller.ts (class @Roles + @Public webhooks).
@Roles('OWNER', 'ADMIN', 'MANAGER', 'CASHIER')
class FixtureController {
  @Public()
  webhook() {}

  protectedAction() {}
}

describe('RolesGuard @Public handling', () => {
  const guard = new RolesGuard(new Reflector());

  it('allows a @Public route even without a user (inherited class roles)', () => {
    const ctx = contextFor(
      FixtureController.prototype.webhook,
      FixtureController,
      undefined,
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('still enforces roles on non-public routes of the same controller', () => {
    const ctx = contextFor(
      FixtureController.prototype.protectedAction,
      FixtureController,
      'CASHIER',
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('rejects an unknown role on a non-public route', () => {
    const ctx = contextFor(
      FixtureController.prototype.protectedAction,
      FixtureController,
      'WAREHOUSE',
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
