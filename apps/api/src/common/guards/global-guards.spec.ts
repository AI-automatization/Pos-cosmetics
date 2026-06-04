import { APP_GUARD } from '@nestjs/core';
import { GLOBAL_GUARDS } from './global-guards';
import { JwtAuthGuard } from '../../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../../identity/guards/roles.guard';

// RBAC must be default-on, not opt-in per controller. Registering JwtAuthGuard
// and RolesGuard as global APP_GUARDs closes the class of latent holes where a
// controller declares @Roles but forgets @UseGuards (inert RBAC) or wires no
// guard at all (tasks, pin, users, api-key, auth/me were fully unauthenticated).
// @Public() routes opt out, which is why both guards honour IS_PUBLIC_KEY.

type ProviderEntry = { provide?: unknown; useClass?: unknown };

const guardClasses = (GLOBAL_GUARDS as ProviderEntry[])
  .filter((p) => p && p.provide === APP_GUARD)
  .map((p) => p.useClass);

describe('GLOBAL_GUARDS', () => {
  it('registers JwtAuthGuard as a global APP_GUARD', () => {
    expect(guardClasses).toContain(JwtAuthGuard);
  });

  it('registers RolesGuard as a global APP_GUARD', () => {
    expect(guardClasses).toContain(RolesGuard);
  });

  it('runs JwtAuthGuard before RolesGuard so req.user is populated', () => {
    const jwtIndex = guardClasses.indexOf(JwtAuthGuard);
    const rolesIndex = guardClasses.indexOf(RolesGuard);
    expect(jwtIndex).toBeGreaterThanOrEqual(0);
    expect(rolesIndex).toBeGreaterThan(jwtIndex);
  });
});
