import { Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../../identity/guards/roles.guard';

// Global authentication + authorization, applied to EVERY route by default.
// Opt out per route with @Public(). RBAC is therefore default-on instead of
// opt-in: a controller can no longer be left unauthenticated by forgetting
// @UseGuards, and a declared @Roles can no longer be inert.
//
// Order matters — NestJS runs APP_GUARDs in registration order, so JwtAuthGuard
// must precede RolesGuard to populate req.user before roles are checked.
export const GLOBAL_GUARDS: Provider[] = [
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_GUARD, useClass: RolesGuard },
];
