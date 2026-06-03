import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { RolesGuard } from '../identity/guards/roles.guard';
import { RealestateController } from './realestate.controller';

// Security contract: real-estate exposes financial data (ROI, rental payments).
// It MUST enforce role-based access like the finance module, not just authentication.
// Without RolesGuard + @Roles, any authenticated user (CASHIER/WAREHOUSE/VIEWER)
// can read another role's financial data within the same tenant.

function contextFor(role: string | undefined): ExecutionContext {
  return {
    getHandler: () => RealestateController.prototype.getProperties,
    getClass: () => RealestateController,
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
  } as unknown as ExecutionContext;
}

describe('RealestateController RBAC', () => {
  const guard = new RolesGuard(new Reflector());

  it('wires RolesGuard on the controller', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, RealestateController) ?? [];
    expect(guards).toContain(RolesGuard);
  });

  it('forbids a CASHIER from reading real-estate data', () => {
    expect(() => guard.canActivate(contextFor('CASHIER'))).toThrow(
      ForbiddenException,
    );
  });

  it('forbids a WAREHOUSE user from reading real-estate data', () => {
    expect(() => guard.canActivate(contextFor('WAREHOUSE'))).toThrow(
      ForbiddenException,
    );
  });

  it('allows an OWNER to read real-estate data', () => {
    expect(guard.canActivate(contextFor('OWNER'))).toBe(true);
  });

  it('allows a MANAGER to read real-estate data', () => {
    expect(guard.canActivate(contextFor('MANAGER'))).toBe(true);
  });
});
